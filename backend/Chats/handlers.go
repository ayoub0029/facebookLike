package chats

import (
	"fmt"
	"net/http"
	global "socialNetwork/Global"
)

func privateChat(w http.ResponseWriter, r *http.Request) {
	message, err := getAllMessages(r)
	if err != nil {
		fmt.Println(err)
		return
	}
	global.JsonResponse(w, 200, message)
}

func groupChat(w http.ResponseWriter, r *http.Request) {
}
