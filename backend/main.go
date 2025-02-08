package main

import (
	"fmt"
	"net/http"
	auth "socialNetwork/Authentication"
	database "socialNetwork/Database"
)

func main() {
	database.CreateDatabase() // temporary

	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)

	// ayoub---
	// can here add conditions for routes authorization

	auth.Routes(mux)
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

func handleStaticFile(res http.ResponseWriter, req *http.Request) {
	// check file if exist and serve the file
}

func home(w http.ResponseWriter, r *http.Request) {
	// home handler
	// check here paths and 404
}
