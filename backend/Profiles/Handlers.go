package profiles

import (
	"net/http"
	"strconv"

	auth "socialNetwork/Authentication"
	global "socialNetwork/Global"
)

// GET /profiles?user_id=123 → Get user profile
// GET /profiles → Get Your user profile Info
func GetProfile(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
		return
	}

	Param := r.FormValue("user_id")

	// If UserId param is missing then will give the user his own profile data
	if Param == "" {
		NewProfile, _ := NewProfile(CurrentUserID)

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

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
		return
	}

	var Field, Data string // From request Key = Field , Vale = Updated data

	for Key, Value := range r.URL.Query() {
		Field, Data = Key, Value[0]
		break
	}

	NewProfile, _ := NewProfile(CurrentUserID)

	if NewProfile.UpdateProfileInfo(w, r, Field, Data) {
		global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Profile Updated Successfully"})
	}
}

// POST /profiles/follow → Send follow request
func Follow(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
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

	NewFollowRequest := NewFollowRequest(CurrentUserID, FollowedID)

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
		global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "User Followed Successfully"})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Send Follow Request Successfully"})
}

// POST /profiles/unfollow → Unfollow a user
func Unfollow(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
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

	NewFollowRequest := NewFollowRequest(CurrentUserID, FollowedID)

	StatusCode, err := NewFollowRequest.Unfollow()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}

	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "User Unfollowed Successfully"})
}

// POST /profiles/follow/accept?user_id=123 → Accept follow request
func AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
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
	NewFollowRequest := NewFollowRequest(CurrentUserID, UserID)

	StatusCode, err := NewFollowRequest.AccepteRequest()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Follow accepted Successfully"})
}

// POST /profiles/follow/reject?user_id=123 → reject follow request
func RejectFollowRequest(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
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

	NewFollowRequest := NewFollowRequest(CurrentUserID, FollowedID)

	StatusCode, err := NewFollowRequest.RejectRequest()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, map[string]string{"Message": "Follow Rejected Successfully"})
}

// GET /profiles/follow/status?user_id=123 → Check follow status
func CheckFollowStatus(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
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

	NewFollowRequest := NewFollowRequest(CurrentUserID, FollowedID)

	Status, StatusCode, err := NewFollowRequest.CheckFollowStatus()
	if err != nil {
		global.JsonResponse(w, StatusCode, map[string]string{"Error": err.Error()})
		return
	}

	global.JsonResponse(w, http.StatusOK, map[string]string{"Status": Status})
}

// GET /profiles/followers?user_id=123&page=1 → Get followers of a user
func GetFollowers(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
		return
	}

	Param1 := r.FormValue("page")
	Page, err := strconv.Atoi(Param1)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	Param2 := r.FormValue("user_id")

	LoggedUserId, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if Param2 == "" && LoggedUserId == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
		return
	}

	UserID, err := strconv.Atoi(Param2)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}

	NewFollowersParam := &FollowersParams{
		UserID:  UserID,
		Page:    Page,
		PerPage: 10,
	}

	if UserID == 0 {
		NewFollowersParam.UserID = CurrentUserID
	} else {
		Public, err := IsPublic(UserID)
		if err == ErrUserNotExist {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
			return
		}
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
			return
		}

		if !Public && CurrentUserID != UserID {
			_, err := IsFollowed(CurrentUserID, UserID)
			if err == ErrUserNotExist || err == ErrFollowYourself {
				global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
				return
			}
			if err != nil {
				global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error3": global.ErrServer.Error()})
				return
			}
		}
	}

	Followers, err := NewFollowersParam.GetFollowers()
	if err != nil {
		if err == ErrUnauthorized {
			global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
			return
		}
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, Followers)
}

// GET /profiles/following?user_id=123&page=1 → Get users the user follows
func GetFollowing(w http.ResponseWriter, r *http.Request) {

	CurrentUserID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return
	}

	if CurrentUserID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": ErrUnauthorized.Error()})
		return
	}
	var UserID int
	Param1 := r.FormValue("page")
	Param2 := r.FormValue("user_id")
	Page, err := strconv.Atoi(Param1)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error1": global.ErrInvalidRequest.Error()})
		return
	}
	if Param2 != "" {
		UserID, err = strconv.Atoi(Param2)
		if err != nil {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error2": global.ErrInvalidRequest.Error()})
			return
		}
	}

	NewFollowersParam := &FollowersParams{
		UserID:  UserID,
		Page:    Page,
		PerPage: 10,
	}

	if UserID == 0 {
		NewFollowersParam.UserID = CurrentUserID
	} else {
		Public, err := IsPublic(UserID)
		if err == ErrUserNotExist {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
			return
		}
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
			return
		}

		if !Public {
			_, err := IsFollowed(CurrentUserID, UserID)
			if err == ErrUserNotExist || err == ErrFollowYourself {
				global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
				return
			}
			if err != nil {
				global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error3": global.ErrServer.Error()})
				return
			}
		}
	}

	Following, err := NewFollowersParam.GetFollowing()
	if err != nil {
		if err == ErrUnauthorized {
			global.JsonResponse(w, http.StatusUnauthorized, map[string]string{"Error": err.Error()})
			return
		}
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrInvalidRequest.Error()})
		return
	}
	global.JsonResponse(w, http.StatusOK, Following)
}
