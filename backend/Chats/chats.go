package chats

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func GetAllPrivateMsg(r *http.Request) (any, error) {
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
	message, err := GetMsgFromPrvChatDB(receiverID, pageNum, r)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return message, nil
}

func GetAllGroupMsg(r *http.Request) (any, error) {
	groupID, err := strconv.Atoi(r.URL.Query().Get("group_id"))
	fmt.Println(groupID)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	pageNum, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		log.Println(err)
		return nil, err
	}
	message, err := GetMsgFromGrpChatDB(groupID, pageNum, r)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return message, nil
}

func HandleChatPrvMessage(msg ChatPrvMessage, SenderID uint64) error {
	if msg.Message != "" {
		err := AddmessageToPrvDB(SenderID, msg.Message, msg.Receiver_id)
		if err != nil {
			log.Println(err)
			return err
		}
	}
	return nil
}

func HandleChatGrpMessage(msg ChatGrpMessage) error {
	if msg.Message != "" {
		err := AddmessageGrpToDB(msg.SenderID, msg.GroupID, msg.Message)
		if err != nil {
			log.Println(err)
			return err
		}
	}
	return nil
}
