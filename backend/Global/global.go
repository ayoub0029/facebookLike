package global

import (
	"encoding/json"
	"net/http"
)

func JsonResponse(w http.ResponseWriter, status int, message any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(message)
}
