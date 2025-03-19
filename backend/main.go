package main

import (
	"fmt"
	"net/http"
	"os"

	auth "socialNetwork/App/Authentication"
	chats "socialNetwork/App/Chats"
	global "socialNetwork/App/Global"
	groups "socialNetwork/App/Groups"
	middleware "socialNetwork/App/Middlewares"
	notifications "socialNetwork/App/Notifications"
	posts "socialNetwork/App/Posts"
	profiles "socialNetwork/App/Profiles"
	search "socialNetwork/App/Search"
	socket "socialNetwork/App/Socket"
	database "socialNetwork/Database/Sqlite"
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
	groups.Routes(mux)
	socket.Routes(mux)
	notifications.Routes(mux)
	search.Routes(mux)
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
	fullPath := "App/Assets/" + filePath
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "404 File not found ----", http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, fullPath)
}

func notFound(w http.ResponseWriter, r *http.Request) {
	global.JsonResponse(w, http.StatusNotFound, "404 Page not found")
}
