package socket

import (
	"net/http"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/ws", WsHandling)
}
