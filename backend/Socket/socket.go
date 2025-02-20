package socket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	auth "socialNetwork/Authentication"
	chats "socialNetwork/Chats"
	global "socialNetwork/Global"

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
	clients[client.UserId] = client
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
	if client, exists := clients[clientID]; exists {
		client.Conn.Close()
		delete(clients, clientID)
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
	userID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		log.Println(err)
		return
	}
	/* n, _ := rand.Int(rand.Reader, big.NewInt(1000))
	userID := n.Uint64() + 1 */
	client := &global.Client{
		UserId: uint64(userID),
		State:  true,
		Conn:   conn,
	}
	if client.UserId == 0 {
		conn.Close()
		return
	}
	AddClient(client)
	fmt.Println(clients)
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
	/* is_followed, err := profiles.IsFollowed(int(chatMsg.SenderID), int(receiverID))
	if is_followed == -1 {
		log.Println(err)
		return nil
	} */
	fmt.Println(chatMsg)
	chats.HandleChatPrvMessage(chatMsg, userID)
	if clients[chatMsg.Receiver_id] != nil {
		return SendMessage(clients[chatMsg.Receiver_id], chatMsg)
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
		userId, err := auth.IsLoggedIn(r, "token")
		if err != nil {
			log.Println(err)
			return
		}
		/* n, _ := rand.Int(rand.Reader, big.NewInt(1000))
		userId := n.Uint64() + 1 */
		var wsMessage WebSocketMessage
		if err := client.Conn.ReadJSON(&wsMessage); err != nil {
			log.Println(err)
			break
		}
		fmt.Println(wsMessage.Type)
		if wsMessage.Type == "privateChat" {
			fmt.Println(wsMessage.Content)
			if err := handlePrvChatMessage(wsMessage, uint64(userId)); err != nil {
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
