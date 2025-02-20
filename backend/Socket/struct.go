package socket

import (
	global "socialNetwork/Global"
	"sync"
)

type WebSocketMessage struct {
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
}

var (
	Clients      = make(map[uint64]*global.Client)
	clientsMutex sync.RWMutex
)
