package global

import (
	"log"
	"os"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserId uint64 `json:"userid"`
	State  bool   `json:"state"`
	Conn   *websocket.Conn
}

var (
	//   for end color \033[0m
	InfoLog *log.Logger = log.New(os.Stdout, "\033[34mINFO\t", log.Ldate|log.Ltime)
	//   for end color \033[0m
	ErrorLog *log.Logger = log.New(os.Stderr, "\033[31mERROR\t", log.Ldate|log.Ltime|log.Lshortfile)
)
