package chats

import "time"

type privateMsg struct {
	Avatar      string `json:"avatar"`
	FullName    string `json:"fullname"`
	SenderID    uint64 `json:"senderid"`
	ReceiverID  uint64 `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
	MessageID   uint64 `json:"messageid"`
}

type groupMsg struct {
	Avatar      string `json:"avatar"`
	FullName    string `json:"fullname"`
	GroupId     uint64 `json:"groupid"`
	SenderID    uint64 `json:"senderid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
	MessageID   uint64 `json:"messageid"`
}

type ChatPrvMessage struct {
	Sender_id   int       `json:"sender_id"`
	Receiver_id uint64    `json:"receiver_id"`
	Message     string    `json:"message"`
	Timestamp   time.Time `json:"timestamp"`
}

type ChatGrpMessage struct {
	GroupID  uint64 `json:"groupid"`
	SenderID uint64 `json:"senderid"`
	Message  string `json:"message"`
}
