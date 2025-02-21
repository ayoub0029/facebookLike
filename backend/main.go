package main

import (
	"fmt"
	"net/http"
	"os"

	auth "socialNetwork/Authentication"
	chats "socialNetwork/Chats"
	database "socialNetwork/Database/Sqlite"
	groups "socialNetwork/Groups"
	notifications "socialNetwork/Notifications"
	posts "socialNetwork/Posts"
	profiles "socialNetwork/Profiles"
	search "socialNetwork/Search"
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
	notifications.Routes(mux)
	search.Routes(mux)
	mux.HandleFunc("/", home)

	//-------------------------------------------------------khiri temporary
	// groups.Routes(mux)
	mux.HandleFunc("POST /AddGroup", groups.CreateGroup_handler)
	mux.HandleFunc("GET /groups", groups.GetAllGroups_handler)
	mux.HandleFunc("GET /group/members", groups.GetGroupMembers_handler)
	mux.HandleFunc("POST /groups/events", groups.CreateEvent_handler)
	mux.HandleFunc("GET /group/events", groups.GetEvent_handler)
	//----------------------------------------------------------------------

	// ayoub---
	// can here add conditions for routes authorization

	// posts.Routes(mux)  example
	// ...

	// Server := &http.Server{
	// 	Addr:    ":8080",
	// 	Handler: middleware.Logs_Middleware(mux),
	// }

	// fmt.Println("Server running on", Server.Addr)
	// err := http.ListenAndServe(Server.Addr, Server.Handler)
	// if err != nil {
	// 	fmt.Println("Error starting server:", err)
	// }
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
