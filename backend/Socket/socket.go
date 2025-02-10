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
	clientsMutex.Lock()
	clients[client.UserId] = client
	defer clientsMutex.Unlock()
}

// this function will help us to send message
func SendMessage(client *global.Client, msg any) error {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()
	return client.Conn.WriteJSON(msg)
}

// removing client from the map
func Removeclient(clientID uint64) {
	clientsMutex.Lock()
	delete(clients, uint64(clientID))
	defer clientsMutex.Unlock()
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
	fmt.Println(clients)
	go SocketListner(client, r)
}

// this function will handle two case
// of real time actions notification and messages
func SocketListner(client *global.Client, r *http.Request) {
	for {
		/* id, err := auth.IsLoggedIn(r, "token")
		if err != nil || id == 0 {
			break
		} */
		n, _ := rand.Int(rand.Reader, big.NewInt(1000))

		receiveridtmp := n.Uint64() + 1
		var wsMessage WebSocketMessage
		err := client.Conn.ReadJSON(&wsMessage)
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}
		if wsMessage.Type == "message" {
			chatMsg := chats.ChatMessage{}
			data, err := json.Marshal(wsMessage.Content)
			if err != nil {
				log.Printf("Error marshling message: %v\n", err)
				continue
			}
			err = json.Unmarshal(data, &chatMsg)
			if err != nil {
				log.Printf("Error unmarshling chat message: %v\n", err)
				continue
			}
			chats.HandleChatMessage(client, chatMsg, receiveridtmp)
			if clients[receiveridtmp] != nil {
				SendMessage(clients[receiveridtmp], chatMsg)
			}
		} else {
			// serraf section
		}
	}
	client.State = false
	Removeclient(client.UserId)
}
