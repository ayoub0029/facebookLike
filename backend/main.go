package main

import (
	"fmt"
	"net/http"
	chats "socialNetwork/Chats"
	"socialNetwork/database"
)

func main() {
	database.CreateDatabase() // temporary

	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)

	// ayoub---
	// can here add conditions for routes authorization

	// auth.Routes(mux)  example
	// posts.Routes(mux)  example
	chats.Routes(mux)
	// ...

	port := ":8080"
	fmt.Println("Server running on", port)
	err := http.ListenAndServe(port, mux)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func handleStaticFile(res http.ResponseWriter, req *http.Request) {
	// check file if exist and serve the file
}
