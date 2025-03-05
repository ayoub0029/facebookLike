package chats

import "time"

type privateMsg struct {
	FirstName   string `json:"firstname"`
	LastName    string `json:"lastname"`
	SenderID    uint64 `json:"senderid"`
	ReceiverID  uint64 `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
	MessageID   uint64 `json:"messageid"`
}

type groupMsg struct {
	GroupId     uint64 `json:"groupid"`
	SenderID    uint64 `json:"senderid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

type ChatPrvMessage struct {
	Receiver_id uint64    `json:"receiver_id"`
	Message     string    `json:"message"`
	Timestamp   time.Time `json:"timestamp"`
}

type ChatGrpMessage struct {
	GroupID  uint64 `json:"groupid"`
	SenderID uint64 `json:"senderid"`
	Message  string `json:"message"`
}
