package main

import (
	"fmt"
	"net/http"
	"os"

	auth "socialNetwork/Authentication"
	chats "socialNetwork/Chats"
	database "socialNetwork/Database"
	notifications "socialNetwork/Notifications"
	search "socialNetwork/Search"
	socket "socialNetwork/Socket"
)

func main() {
	database.CreateDatabase() // temporary

	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)

	// ayoub---
	// can here add conditions for routes authorization

	auth.Routes(mux)
	chats.Routes(mux)
	socket.Routes(mux)
	notifications.Routes(mux)
	search.Routes(mux)
	// posts.Routes(mux)  example
	// ...

	mux.HandleFunc("/", home)
	port := ":8080"
	fmt.Println("Server running on", port)
	err := http.ListenAndServe(port, mux)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func handleStaticFile(w http.ResponseWriter, r *http.Request) {
	// Strip "/public/" from the path
	filePath := r.URL.Path[len("/public/"):]

	// Construct the full path to the static file
	fullPath := "static/" + filePath

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "404 File not found", http.StatusNotFound)
		return
	}

	// Serve the file
	http.ServeFile(w, r, fullPath)
}

func home(w http.ResponseWriter, r *http.Request) {
	// Only handle root path in home handler
	if r.URL.Path != "/" {
		http.Error(w, "404 Page not found", http.StatusNotFound)
		return
	}

	// Serve index.html from static directory
	http.ServeFile(w, r, "static/index.html")
}
