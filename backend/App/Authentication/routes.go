package auth

import "net/http"

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("POST /auth/signup", signUp)
	mux.HandleFunc("POST /auth/login", logIn)
	mux.HandleFunc("POST /auth/logout", logOut)
	mux.HandleFunc("GET /auth/status", status)
	mux.HandleFunc("GET /auth/githublogin", GithubLogin)
	mux.HandleFunc("GET /auth/github/callback", githubCallBack)
}
