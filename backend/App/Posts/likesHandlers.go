package posts

import (
	"errors"
	"net/http"
	database "socialNetwork/Database"
	global "socialNetwork/App/Global"
	middleware "socialNetwork/App/Middlewares"
	"strconv"
)

//	ApplyUserRection going to reciver postID and userID and statusLike
//
// it going to add like if status like are 1
// it going to remove like if status like are 0
// link is GET /posts/reactions?post_id=`id`&status_like=`status`
func ApplyUserReaction(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	postID, err1 := strconv.Atoi(r.URL.Query().Get("post_id"))
	statusLike, err2 := strconv.Atoi(r.URL.Query().Get("status_like"))

	if err1 != nil || err2 != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Missing itemID or action")
		return
	}

	group_id, err := getGroupOfpost(postID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if group_id < 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member in")
		return
	}
	err = userprevstate(postID, userID, statusLike)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	err = LikePost(postID, userID, statusLike)

	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "the was an error")
		return
	}
	global.JsonResponse(w, http.StatusOK, "Success")
}

func userprevstate(postID, userID, statusLike int) error {
	query := `SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?`

	prevStatus := -1
	row, err := database.SelectOneRow(query, postID, userID)
	if row.Scan(&prevStatus) != nil && statusLike == 0 {
		return errors.New("you didn't like this post")
	} else if err != nil {
		return err
	}

	if prevStatus == statusLike {
		return errors.New("you have already reacted")
	}
	return nil
}
