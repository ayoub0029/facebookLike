package profiles

import (
	"net/http"
	"strconv"

	global "socialNetwork/Global"
)

// GET /profiles?user_id=123 → Get user profile
// GET /profiles → Get Your user profile Info
func GetProfile(w http.ResponseWriter, r *http.Request) {
	
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}
	Param := r.FormValue("user_id")

	if Param == "" {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidParams.Error()})
		return
	}

	UserID, err := strconv.Atoi(Param)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrUserIdMustBeInt.Error()})
		return
	}

	NewProfile, err := NewProfile(UserID)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
		return
	}

	if err := NewProfile.GetProfileInfo(); err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	global.JsonResponse(w, http.StatusOK, NewProfile.ProfileData)
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
