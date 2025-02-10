package chats

import "time"

type message struct {
	SenderID    uint64 `json:"senderid"`
	ReceiverID  uint64 `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

type ChatMessage struct {
	SenderID  uint64    `json:"senderid"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}
