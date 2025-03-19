package chats

import (
	"net/http"

	global "socialNetwork/Global"
)

var logger = global.NewLogger()

func privateChat(w http.ResponseWriter, r *http.Request) {
	message, err := GetAllPrivateMsg(r)
	if err != nil {
		if err.Error() == "parseGusery" {
			global.JsonResponse(w, http.StatusBadRequest, "bad argemount")
			return
		}
		logger.Error("mesage: %v", err)
		global.JsonResponse(w, http.StatusInternalServerError, "server side error")
		return
	}
	global.JsonResponse(w, 200, message)
}

func groupChat(w http.ResponseWriter, r *http.Request) {
	message, err := GetAllGroupMsg(r)
	if err != nil {
		if err.Error() == "parseGusery" {
			global.JsonResponse(w, http.StatusBadRequest, "bad argemount")
			return
		}
		logger.Error("mesage: %v", err)
		global.JsonResponse(w, http.StatusInternalServerError, "server side error")
		return
	}
	global.JsonResponse(w, 200, message)
}

func userIchatWith(w http.ResponseWriter, r *http.Request) {
	message, err := GetUserIchatWith(r)
	if err != nil {
		logger.Error("mesage: %v", err)
		global.JsonResponse(w, http.StatusInternalServerError, "server side error")
		return
	}
	global.JsonResponse(w, 200, message)
}
