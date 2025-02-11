package socket

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
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
	ClientsMutex.Lock()
	Clients[client.UserId] = client
	ClientsMutex.Unlock()
}

// this function will help us to send message
func SendMessage(client *global.Client, msg any) error {
	ClientsMutex.Lock()
	defer ClientsMutex.Unlock()
	return client.Conn.WriteJSON(msg)
}

// removing client from the map
func RemoveClient(clientID uint64) {
	ClientsMutex.Lock()
	if client, exists := Clients[clientID]; exists {
		client.Conn.Close()
		delete(Clients, clientID)
	}
	ClientsMutex.Unlock()
}

// respond function for updating protocol http
func WsHandling(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	//senderID, err := auth.IsLoggedIn(r, "token")
	n, _ := rand.Int(rand.Reader, big.NewInt(1000))

	senderID := n.Uint64() + 1
	client := &global.Client{
		UserId: uint64(senderID),
		State:  true,
		Conn:   conn,
	}
	if client.UserId == 0 {
		conn.Close()
		return
	}
	AddClient(client)
	fmt.Println(Clients)
	go SocketListner(client, r)
}

func handlePrvChatMessage(wsMessage WebSocketMessage, receiverID uint64) error {
	var chatMsg chats.ChatPrvMessage
	data, err := json.Marshal(wsMessage.Content)
	if err != nil {
		return fmt.Errorf("error marshaling message: %v", err)
	}
	if err := json.Unmarshal(data, &chatMsg); err != nil {
		return fmt.Errorf("error unmarshaling chat message: %v", err)
	}
	chats.HandleChatPrvMessage(chatMsg, receiverID)
	if Clients[receiverID] != nil {
		return SendMessage(Clients[receiverID], chatMsg)
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
	return nil
}

// this function will handle two case
// of real time actions notification and messages
func SocketListner(client *global.Client, r *http.Request) {

	for {
		//Implement proper authentication
		n, _ := rand.Int(rand.Reader, big.NewInt(1000))
		receiverID := n.Uint64() + 1

		var wsMessage WebSocketMessage
		if err := client.Conn.ReadJSON(&wsMessage); err != nil {
			log.Println(err)
			break
		}
		fmt.Println(wsMessage.Type)
		if wsMessage.Type == "privateChat" {
			if err := handlePrvChatMessage(wsMessage, receiverID); err != nil {
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
