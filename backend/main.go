package main

import (
	"fmt"
	"net/http"

	profiles "socialNetwork/Profiles"
	"socialNetwork/database"
	"socialNetwork/Groups"

)

func main() {
	database.CreateDatabase() // temporary 
	
	mux := http.NewServeMux();
	mux.HandleFunc("/public/", handleStaticFile);

	profiles.Routes(mux);
	
	mux.HandleFunc("POST /AddGroup", groups.CreateGroup_handler);
	mux.HandleFunc("GET /groups", groups.GetAllGroups_handler);
	mux.HandleFunc("GET /group/members", groups.GetGroupMembers_handler);
	mux.HandleFunc("POST /groups/events", groups.CreateEvent_handler);
	mux.HandleFunc("GET /group/events", groups.GetEvent_handler);




	// ayoub---
	// can here add conditions for routes authorization

	// auth.Routes(mux)  example
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
