package chats

import (
	"fmt"
	"net/http"
	global "socialNetwork/Global"
	"strconv"
)

func getAllMessages(r *http.Request) (any, error) {
	receiverID, err := strconv.Atoi(r.URL.Query().Get("receiver_id"))
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	pageNum, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	message, err := getMsgFromDB(receiverID, pageNum, r)
	if err != nil {
		return nil, err
	}
	return message, nil
}

func HandleChatMessage(client *global.Client, msg ChatMessage) {
	
}
