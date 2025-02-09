package Profiles

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

	// If UserUd param is missing then will give the user his own profile data
	if Param == "" {
		UserID, err := GetUserID(r)
		if err == ErrUnauthorized {
			global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
			return
		}
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
			return
		}
		NewProfile, _ := NewProfile(UserID)

		if err := NewProfile.GetProfileInfo(); err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
			return
		}

		global.JsonResponse(w, http.StatusOK, NewProfile.ProfileData)
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

	if NewProfile.ProfileData.ProfileStatus == ProfileStatus[Profile_Private] {
		global.JsonResponse(w, http.StatusOK,
			struct {
				ProfileStatus string
				Avatar        string
				Nickname      string
			}{
				ProfileStatus: NewProfile.ProfileData.ProfileStatus,
				Avatar:        NewProfile.ProfileData.Avatar,
				Nickname:      NewProfile.ProfileData.Nickname,
			},
		)
		return
	}

	global.JsonResponse(w, http.StatusOK, NewProfile.ProfileData)
}

// POST /profiles/update → Update profile details
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}
}

// POST /profiles/follow → Send follow request
func Follow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}

	Param := r.FormValue("followedid")
	if Param == "" {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidParams.Error()})
		return
	}

	FollowedID, err := strconv.Atoi(Param)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowRequest, err := NewFollowRequest(FollowedID, r)
	if err == ErrUnauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
		return
	}
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": err.Error()})
		return
	}

	StatusCode, err := NewFollowRequest.Follow()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}

	Public, err := IsPublic(FollowedID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if Public {
		global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "User Followed Seccusfuly"})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Send Follow Request Seccusfuly"})
}

// POST /profiles/unfollow → Unfollow a user
func Unfollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}

	Param := r.FormValue("followedid")
	if Param == "" {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidParams.Error()})
		return
	}

	FollowedID, err := strconv.Atoi(Param)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowRequest, err := NewFollowRequest(FollowedID, r)
	if err == ErrUnauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
		return
	}
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": err.Error()})
		return
	}

	StatusCode, err := NewFollowRequest.Unfollow()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}

	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "User Unfollowed Seccusfuly"})
}

// POST /profiles/follow/accept?user_id=123 → Accept follow request
func AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowRequest, err := NewFollowRequest(UserID, r)
	if err == ErrUnauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
		return
	}
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": err.Error()})
		return
	}

	StatusCode, err := NewFollowRequest.AccepteRequest()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Follow accepted Seccusfuly"})
}

// POST /profiles/follow/reject?user_id=123 → reject follow request
func RejectFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}

	Param := r.FormValue("user_id")
	if Param == "" {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidParams.Error()})
		return
	}

	FollowedID, err := strconv.Atoi(Param)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowRequest, err := NewFollowRequest(FollowedID, r)
	if err == ErrUnauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
		return
	}
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": err.Error()})
		return
	}

	StatusCode, err := NewFollowRequest.RejectRequest()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Follow Rejected Seccusfuly"})
}

// GET /profiles/follow/status?user_id=123 → Check follow status
func CheckFollowStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
		return
	}

	Param := r.FormValue("user_id")
	if Param == "" {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidParams.Error()})
		return
	}

	FollowedID, err := strconv.Atoi(Param)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowRequest, err := NewFollowRequest(FollowedID, r)
	if err == ErrUnauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
		return
	}
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": err.Error()})
		return
	}

	Status, StatusCode, err := NewFollowRequest.CheckFollowStatus()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}

	global.JsonResponse(w, http.StatusOK, map[string]string{"Status": Status})
}

// // GET /profiles/followers?user_id=123&page=1 → Get followers of a user
// func GetFollowers(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
// 		return
// 	}
// }

// // GET /profiles/following?user_id=123&page=1 → Get users the user follows
// func GetFollowing(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodGet {
// 		global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
// 		return
// 	}
// }
