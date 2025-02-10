package chats

import (
	"log"
	"net/http"
	global "socialNetwork/Global"
	"strconv"
)

func getAllMessages(r *http.Request) (any, error) {
	receiverID, err := strconv.Atoi(r.URL.Query().Get("receiver_id"))
	if err != nil {
		log.Println(err)
		return nil, err
	}
	pageNum, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		log.Println(err)
		return nil, err
	}
	message, err := getMsgFromDB(receiverID, pageNum, r)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return message, nil
}

func HandleChatMessage(client *global.Client, msg ChatMessage, receiverID uint64) error {
	if msg.Message != "" {
		err := AddmessageToDB(msg.SenderID, msg.Message, receiverID)
		if err != nil {
			log.Println(err)
			return err
		}
	}
	return nil
}
