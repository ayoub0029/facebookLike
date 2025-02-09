package global

import "github.com/gorilla/websocket"

type Client struct {
	UserId uint64 `json:"userid"`
	State  bool   `json:"state"`
	Conn   *websocket.Conn
}
