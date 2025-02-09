package chats

import "time"

type message struct {
	SenderID    uint64 `json:"senderid"`
	ReceiverID  uint64 `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

type ChatMessage struct {
	SenderID  int       `json:"sender_id"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}
