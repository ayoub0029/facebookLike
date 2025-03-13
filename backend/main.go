package main

import (
	"fmt"
	"net/http"
	"os"

	auth "socialNetwork/Authentication"
	chats "socialNetwork/Chats"
	database "socialNetwork/Database/Sqlite"
	global "socialNetwork/Global"
	groups "socialNetwork/Groups"
	middleware "socialNetwork/Middlewares"
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
	groups.Routes(mux)
	socket.Routes(mux)
	notifications.Routes(mux)
	search.Routes(mux)
	groups.Routes(mux)
	mux.HandleFunc("/", notFound)

	Server := &http.Server{
		Addr:    ":8080",
		Handler: middleware.Auth(mux),
	}

	fmt.Println("Server running on", Server.Addr)
	err := Server.ListenAndServe()
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func handleStaticFile(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Path[len("/public/"):]
	fullPath := "Assets/" + filePath
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "404 File not found ----", http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, fullPath)
}

func notFound(w http.ResponseWriter, r *http.Request) {
	global.JsonResponse(w, http.StatusNotFound, "404 Page not found")
}
