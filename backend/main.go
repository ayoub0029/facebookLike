package main

import (
	"fmt"
	"net/http"

	auth "socialNetwork/Authentication"
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
