package auth

import "net/http"

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/auth/signup" , signUp)
	mux.HandleFunc("/auth/login" , logIn)
	mux.HandleFunc("/auth/logout" , logOut)
	mux.HandleFunc("/auth/status" , status)
	mux.HandleFunc("/auth/callback" , callBack)
	mux.HandleFunc("/auth/github/callback" , githubCallBack)
}

func signUp(w http.ResponseWriter, r *http.Request) {
}

func logIn(w http.ResponseWriter, r *http.Request) {
}

func logOut(w http.ResponseWriter, r *http.Request) {
}

func status(w http.ResponseWriter, r *http.Request) {
}

func callBack(w http.ResponseWriter, r *http.Request) {
}

func githubCallBack(w http.ResponseWriter, r *http.Request) {
}