package Profiles

import (
	"net/http"
	middleware "socialNetwork/Middlewares"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/profiles", middleware.Methode_Middleware(GetProfile, http.MethodGet))
	mux.HandleFunc("/profiles/update", middleware.Methode_Middleware(UpdateProfile, http.MethodPost))
	mux.HandleFunc("/profiles/follow", middleware.Methode_Middleware(Follow, http.MethodPost))
	mux.HandleFunc("/profiles/unfollow", middleware.Methode_Middleware(Unfollow, http.MethodPost))
	mux.HandleFunc("/profiles/follow/accept", middleware.Methode_Middleware(AcceptFollowRequest, http.MethodPost))
	mux.HandleFunc("/profiles/follow/reject", middleware.Methode_Middleware(RejectFollowRequest, http.MethodPost))
	mux.HandleFunc("/profiles/follow/status", middleware.Methode_Middleware(CheckFollowStatus, http.MethodGet))
	mux.HandleFunc("/profiles/followers", middleware.Methode_Middleware(GetFollowers, http.MethodGet))
	mux.HandleFunc("/profiles/following", middleware.Methode_Middleware(GetFollowing, http.MethodGet))
}
