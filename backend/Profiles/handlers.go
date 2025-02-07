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

// GET /profiles?user_id=123 → Get user profile
func GetProfile(w http.ResponseWriter, r *http.Request) {
}

// POST /profiles/update → Update profile details
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
}

// POST /profiles/follow → Send follow request
func Follow(w http.ResponseWriter, r *http.Request) {
}

// POST /profiles/unfollow → Unfollow a user
func Unfollow(w http.ResponseWriter, r *http.Request) {
}

// GET /profiles/followers?user_id=123&page=1 → Get followers of a user
func GetFollowers(w http.ResponseWriter, r *http.Request) {
}

// GET /profiles/following?user_id=123&page=1 → Get users the user follows
func GetFollowing(w http.ResponseWriter, r *http.Request) {
}

// POST /profiles/follow/accept → Accept/reject follow request
func FollowRequest(w http.ResponseWriter, r *http.Request) {
}

// GET /profiles/follow/status?user_id=123 → Check follow status
func CheckProfileStatus(w http.ResponseWriter, r *http.Request) {
}
