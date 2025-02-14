package main

import (
	"fmt"
	"net/http"
	"time"

	auth "socialNetwork/Authentication"
	middleware "socialNetwork/Middlewares"
	profiles "socialNetwork/Profiles"
	"socialNetwork/database"
)

func main() {
	database.CreateDatabase() // temporary
	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)
	profiles.Routes(mux)
	auth.Routes(mux)
	// ayoub---
	// can here add conditions for routes authorization

	// posts.Routes(mux)  example
	// ...

	Server := &http.Server{
		Addr:         ":8080",
		Handler:      middleware.Logs_Middleware(mux),
		ReadTimeout:  10 * time.Second, // Max duration for reading the entire request
		WriteTimeout: 10 * time.Second, // Max duration before a write operation times out
		TLSConfig:    nil,
	}

	fmt.Println("Server running on", Server.Addr)
	err := http.ListenAndServe(Server.Addr, Server.Handler)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func handleStaticFile(res http.ResponseWriter, req *http.Request) {
	// check file if exist and serve the file
}
