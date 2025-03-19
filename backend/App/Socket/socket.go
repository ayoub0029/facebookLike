package socket

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	chats "socialNetwork/App/Chats"
	global "socialNetwork/App/Global"
	middleware "socialNetwork/App/Middlewares"
	database "socialNetwork/Database"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// this function add client active to the map
// we use mutex teo prevent race condition when two values try accessing
// the same adresse
func AddClient(client *global.Client) {
	clientsMutex.Lock()
	Clients[client.UserId] = client
	clientsMutex.Unlock()
}

// this function will help us to send message
func SendMessage(client *global.Client, msg any) error {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()
	return client.Conn.WriteJSON(msg)
}

// removing client from the map
func RemoveClient(clientID uint64) {
	clientsMutex.Lock()
	if client, exists := Clients[clientID]; exists {
		client.Conn.Close()
		delete(Clients, clientID)
	}
	clientsMutex.Unlock()
}

// respond function for updating protocol http
func WsHandling(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	if !ok {
		return
	}
	fmt.Printf("userName : %s\n", user.Name)
	client := &global.Client{
		UserId: user.ID,
		State:  true,
		Conn:   conn,
	}

	AddClient(client)
	fmt.Println(client.UserId)
	fmt.Println(client.UserId)
	go SocketListner(client, r)
}

func handlePrvChatMessage(wsMessage WebSocketMessage, userID uint64, fullName string) error {
	var chatMsg chats.ChatPrvMessage
	data, err := json.Marshal(wsMessage.Content)
	if err != nil {
		return fmt.Errorf("error marshaling message: %v", err)
	}
	if err := json.Unmarshal(data, &chatMsg); err != nil {
		return fmt.Errorf("error unmarshaling chat message: %v", err)
	}
	is_followed, _ := IsFollowed(int(chatMsg.Receiver_id), int(userID))
	if is_followed == -1 {
		if Clients[userID] != nil {
			return SendMessage(Clients[userID], map[string]string{"Error": "user not following"})
		}
		return nil
	}
	chats.HandleChatPrvMessage(chatMsg, userID)
	if Clients[chatMsg.Receiver_id] != nil {
		chatMsg.Sender_id = int(userID)
		chatMsg.Type = "message"
		chatMsg.FullName = fullName
		return SendMessage(Clients[chatMsg.Receiver_id], chatMsg)
	}
	return nil
}

func handleGrpChatMessage(wsMessage WebSocketMessage, userID uint64, fullname string) error {
	var grpChatMsg chats.ChatGrpMessage
	data, err := json.Marshal(wsMessage.Content)
	if err != nil {
		return fmt.Errorf("error marshaling message: %v", err)
	}
	if err := json.Unmarshal(data, &grpChatMsg); err != nil {
		return fmt.Errorf("error unmarshaling chat message: %v", err)
	}
	err = chats.HandleChatGrpMessage(grpChatMsg)
	if err != nil {
		fmt.Println("111; socket", err)
	}
	userIDs, err := global.GetIdsUsersOfGroup(grpChatMsg.GroupID)
	if err != nil {
		return err
	}
	groupName, err := global.GetNameOfGroupById(uint(grpChatMsg.GroupID))
	if err != nil {
		return err
	}
	laderGroup, err := global.GetLaderbyIdGroup(grpChatMsg.GroupID)
	if err != nil {
		return err
	}
	userIDs = append(userIDs, laderGroup)
	grpChatMsg.GroupName = groupName
	grpChatMsg.Type = "Group_message"
	/* grpMembers broadcasting */
	for _, member := range userIDs {
		conn, ok := Clients[uint64(member)]
		if ok && member != userID {
			grpChatMsg.FullName = fullname
			fmt.Println(grpChatMsg)
			SendMessage(conn, grpChatMsg)
		}
	}
	return nil
}

// this function will handle multiple cases
// of real time actions ex: notification and messages...
func SocketListner(client *global.Client, r *http.Request) {
	for {
		user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
		if !ok {
			return
		}

		var wsMessage WebSocketMessage
		if err := client.Conn.ReadJSON(&wsMessage); err != nil {
			log.Println(err)
			break
		}
		if wsMessage.Type == "privateChat" {
			fmt.Println(wsMessage.Content)
			if err := handlePrvChatMessage(wsMessage, user.ID, user.Name); err != nil {
				log.Printf("Error handling %s message: %v", wsMessage.Type, err)
			}
		} else if wsMessage.Type == "groupChat" {
			if err := handleGrpChatMessage(wsMessage, user.ID, user.Name); err != nil {
				log.Printf("Error handling %s message: %v", wsMessage.Type, err)
			}
		}
	}
	client.State = false
	RemoveClient(client.UserId)
}

// ================================
// check if A if follow user B
// If This function return -1 That mean false
func IsFollowed(a, b int) (int, error) {
	if a == b {
		return -1, fmt.Errorf("err Follow Yourself")
	}

	if !UserExists(a) || !UserExists(b) {
		return -1, fmt.Errorf("errUserNotExist")
	}

	var RelationID int

	Query := `SELECT id FROM followers WHERE (follower_id = $1 AND followed_id = $2) OR (follower_id = $2 AND followed_id = $1) AND status = 'accept'`
	row, err := database.SelectOneRow(Query, a, b)
	if err != nil {
		return -1, err
	}

	if err := row.Scan(&RelationID); err != nil {
		if err == sql.ErrNoRows {
			return -1, fmt.Errorf("errCantFindRelationId")
		}
		return -1, err
	}

	return RelationID, nil
}

func UserExists(userID int) bool {
	var Exist bool
	Query := "SELECT COUNT(1) FROM users WHERE id = ?"

	Row, err := database.SelectOneRow(Query, userID)
	if err != nil {
		fmt.Println(err)
		return false
	}
	if err := Row.Scan(&Exist); err != nil {
		return false
	}
	return Exist
}
