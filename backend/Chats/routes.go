package chats

import (
	"net/http"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/chats/private", privateChat)
	mux.HandleFunc("/chats/group", groupChat)
}
