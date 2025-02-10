package chats

import (
	"log"
	"net/http"
	global "socialNetwork/Global"
)

func privateChat(w http.ResponseWriter, r *http.Request) {
	message, err := GetAllPrivateMsg(r)
	if err != nil {
		log.Println(err)
		return
	}
	global.JsonResponse(w, 200, message)
}

func groupChat(w http.ResponseWriter, r *http.Request) {
	message, err := GetAllGroupMsg(r)
	if err != nil {
		log.Println(err)
		return
	}
	global.JsonResponse(w, 200, message)
}
