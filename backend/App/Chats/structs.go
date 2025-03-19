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
	Type        string
	FullName    string    `json:"fullname"`
	Sender_id   int       `json:"sender_id"`
	Receiver_id uint64    `json:"receiver_id"`
	Message     string    `json:"message"`
	Timestamp   time.Time `json:"timestamp"`
}

type ChatGrpMessage struct {
	Type      string
	FullName  string    `json:"fullname"`
	GroupName string    `json:"groupname"`
	GroupID   uint64    `json:"groupid"`
	SenderID  uint64    `json:"senderid"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type User struct {
	Last_id  string `json:"id"`
	ID       uint64 `json:"Id"`
	FullName string `json:"fullname"`
	Avatar   string `json:"Avatar"`
}
