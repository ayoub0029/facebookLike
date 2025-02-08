package chats

import (
	"fmt"
	"log"
	"net/http"
	global "socialNetwork/Global"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserId int  `json:"id"`
	State  bool `json:"state"`
	Conn   *websocket.Conn
}

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/chats/private", privateChat)
	mux.HandleFunc("/ws", wsHandling)
	mux.HandleFunc("/chats/group", groupChat)
}

func privateChat(w http.ResponseWriter, r *http.Request) {
	message, err := getAllMessages(r)
	if err != nil {
		fmt.Println(err)
		return
	}
	global.JsonResponse(w, 200, message)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandling(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}

}

func groupChat(w http.ResponseWriter, r *http.Request) {
}
