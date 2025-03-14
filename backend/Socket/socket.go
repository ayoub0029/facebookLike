package socket

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	chats "socialNetwork/Chats"
	database "socialNetwork/Database"
	global "socialNetwork/Global"
	middleware "socialNetwork/Middlewares"

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

func handlePrvChatMessage(wsMessage WebSocketMessage, userID uint64) error {
	var chatMsg chats.ChatPrvMessage
	data, err := json.Marshal(wsMessage.Content)
	if err != nil {
		return fmt.Errorf("error marshaling message: %v", err)
	}
	if err := json.Unmarshal(data, &chatMsg); err != nil {
		return fmt.Errorf("error unmarshaling chat message: %v", err)
	}
	is_followed, err := IsFollowed(int(chatMsg.Receiver_id), int(userID))
	if is_followed == -1 {
		log.Println(err)
		return nil
	}
	chats.HandleChatPrvMessage(chatMsg, userID)
	if Clients[chatMsg.Receiver_id] != nil {
		chatMsg.Sender_id = int(userID)
		return SendMessage(Clients[chatMsg.Receiver_id], chatMsg)
	}
	return nil
}

func handleGrpChatMessage(wsMessage WebSocketMessage) error {
	var grpChatMsg chats.ChatGrpMessage
	data, err := json.Marshal(wsMessage.Content)
	if err != nil {
		return fmt.Errorf("error marshaling message: %v", err)
	}
	if err := json.Unmarshal(data, &grpChatMsg); err != nil {
		return fmt.Errorf("error unmarshaling chat message: %v", err)
	}
	chats.HandleChatGrpMessage(grpChatMsg)
	/* grpMembers broadcasting */
	/* for member := range members {
		if clients[member] != nil {
			return SendMessage(clients[member], grpChatMsg)
		}
	} */
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
		fmt.Println(wsMessage.Type)
		if wsMessage.Type == "privateChat" {
			fmt.Println(wsMessage.Content)
			if err := handlePrvChatMessage(wsMessage, user.ID); err != nil {
				log.Printf("Error handling %s message: %v", wsMessage.Type, err)
			}
		} else if wsMessage.Type == "groupChat" {
			if err := handleGrpChatMessage(wsMessage); err != nil {
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

	Query := `SELECT id FROM followers WHERE follower_id = ? AND followed_id = ? AND status = 'accept'`
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
