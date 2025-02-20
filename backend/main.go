package main

import (
	"fmt"
	"net/http"
	"os"

	auth "socialNetwork/Authentication"
	middleware "socialNetwork/Middlewares"
	posts "socialNetwork/Posts"
	profiles "socialNetwork/Profiles"
	chats "socialNetwork/Chats"
	database "socialNetwork/Database/Sqlite"
	socket "socialNetwork/Socket"
)

func main() {
	if err := database.InitializeMigrations(); err != nil {
		fmt.Printf("Migration error: %v\n", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)
	profiles.Routes(mux)
	auth.Routes(mux)
	posts.Routes(mux)
	chats.Routes(mux)
	socket.Routes(mux)

	// ayoub---
	// can here add conditions for routes authorization

	// posts.Routes(mux)  example
	// ...

	Server := &http.Server{
		Addr:    ":8080",
		Handler: middleware.Logs_Middleware(mux),
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

func home(w http.ResponseWriter, r *http.Request) {
	// home handler
	// check here paths and 404
}
