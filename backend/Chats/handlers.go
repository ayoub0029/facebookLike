package chats

import (
	"fmt"
	"net/http"
	"strconv"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/chats/private", privateChat)
	mux.HandleFunc("/chats/group", groupChat)
}

func privateChat(w http.ResponseWriter, r *http.Request) {
	receiverID, err := strconv.Atoi(r.URL.Query().Get("receiver_id"))
	if err != nil {
		fmt.Println(err)
		return
	}
	pageNum, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(receiverID, pageNum)
}

func groupChat(w http.ResponseWriter, r *http.Request) {
}
