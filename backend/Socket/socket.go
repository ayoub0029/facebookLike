package socket

import (
	"encoding/json"
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

func AddClient(client *global.Client) {
	clientsMutex.Lock()
	clients[client.UserId] = client
	defer clientsMutex.Unlock()
}

func Removeclient(clientID uint64) {
	clientsMutex.Lock()
	delete(clients, uint64(clientID))
	defer clientsMutex.Unlock()
}

func WsHandling(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	senderID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		log.Println(err)
		return
	}
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
	go SocketListner(client, r)
}

func SocketListner(client *global.Client, r *http.Request) {
	for {
		id, err := auth.IsLoggedIn(r, "token")
		if err != nil || id == 0 {
			break
		}
		messageType, p, err := client.Conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}
		if messageType == websocket.TextMessage {
			var wsMessage WebSocketMessage
			err := json.Unmarshal(p, &wsMessage)
			if err != nil {
				log.Printf("Error unmarshling message: %v\n", err)
				continue
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
				chats.HandleChatMessage(client, chatMsg)
			} else {
				// serraf section
			}
		}
	}
	client.State = false
	Removeclient(client.UserId)
}
