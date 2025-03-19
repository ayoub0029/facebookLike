package chats

import (
	"net/http"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("GET /chats/private", privateChat)
	mux.HandleFunc("GET /chats/group", groupChat)
	mux.HandleFunc("GET /chats/userIchatWith", userIchatWith)
}
