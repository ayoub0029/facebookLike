package main

import (
	"fmt"
	"net/http"
	"socialNetwork/database"
	"socialNetwork/Groups"

)

func main() {
	database.CreateDatabase() // temporary 
	/*myGroup := groups.NewGroup("myTeam5","for learning 5",1);
	result := myGroup.Create();
	if result {
		fmt.Printf("group %d is created \n",myGroup.ID);
		groups.PrintGroupsData();
		return 
	}else{
		fmt.Println("Error");
		return ;
	}*/
	mux := http.NewServeMux()
	mux.HandleFunc("/public/", handleStaticFile)

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
