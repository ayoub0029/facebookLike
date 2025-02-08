package profiles

import "net/http"

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("/profiles", GetProfile)
	mux.HandleFunc("/profiles/update", UpdateProfile)
	mux.HandleFunc("/profiles/follow", Follow)
	mux.HandleFunc("/profiles/unfollow", Unfollow)
	mux.HandleFunc("/profiles/followers", GetFollowers)
	mux.HandleFunc("/profiles/following", GetFollowing)
	mux.HandleFunc("/profiles/follow/accept", FollowRequest)
	mux.HandleFunc("/profiles/follow/status", CheckProfileStatus)
}
