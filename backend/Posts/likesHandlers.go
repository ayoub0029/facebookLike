package posts

import (
	"net/http"
	"strconv"
)

//	ApplyUserRection going to reciver postID and userID and statusLike
// it going to add like if status like are 1
// it going to remove like if status like are 0
func ApplyUserReaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	postID, err1 := strconv.Atoi(r.URL.Query().Get("post_id"))
	statusLike, err2 := strconv.Atoi(r.URL.Query().Get("status_like"))

	if err1 != nil || err2 != nil {
		jsonResponse(w, http.StatusBadRequest, "Missing itemID or action")
		return
	}

	err = LikePost(postID, userID, statusLike)

	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonResponse(w, http.StatusOK, "Success")
}
