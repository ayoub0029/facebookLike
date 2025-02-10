package chats

import "time"

type privateMsg struct {
	SenderID    uint64 `json:"senderid"`
	ReceiverID  uint64 `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

type groupMsg struct {
	GroupId     uint64 `json:"groupid"`
	SenderID    uint64 `json:"senderid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

type ChatPrvMessage struct {
	SenderID  uint64    `json:"senderid"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type ChatGrpMessage struct {
	GroupID   uint64    `json:"groupid"`
	SenderID  uint64    `json:"senderid"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}
