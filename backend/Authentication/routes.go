package auth

import "net/http"

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/auth/signup", signUp)
	mux.HandleFunc("/auth/login", logIn)
	mux.HandleFunc("/auth/logout", logOut)
	mux.HandleFunc("/auth/status", status)
	mux.HandleFunc("/auth/callback", callBack)
	mux.HandleFunc("/auth/github/callback", githubCallBack)
}
