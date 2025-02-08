package chats

import (
	"fmt"
	"net/http"
	"strconv"
)

func getAllMessages(r *http.Request) (any, error) {
	receiverID, err := strconv.Atoi(r.URL.Query().Get("receiver_id"))
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	pageNum, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	message := getMsgFromDB(receiverID, pageNum)
	return message, nil
}
