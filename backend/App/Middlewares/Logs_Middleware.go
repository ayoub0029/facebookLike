package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"
)

func Logs_Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		Remoteaddr := strings.Split(r.RemoteAddr, ":")[0]
		if Remoteaddr == "[" {
			Remoteaddr = "127.0.0.1"
		}
		fmt.Printf("%s %s %v %s \n", r.Method, r.URL.Path, Remoteaddr, time.Since(start))
	})
}
