package posts

import (
	"fmt"
	"html"
	"net/http"
	database "socialNetwork/Database"
	global "socialNetwork/Global"
	groups "socialNetwork/Groups"
	middleware "socialNetwork/Middlewares"
	"strconv"
)

// add comment
// link: POST /posts/comments&post_id=`id`&content=`content`
func addComment(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postid := r.FormValue("post_id")
	post_id, _ := strconv.Atoi(postid)
	if post_id <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "postID is invalid")
		return
	}

	group_id, err := getGroupOfpost(post_id)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	if group_id < 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member in")
		return
	}

	if group_id != 0 && !groups.IsMember(group_id, userID) {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member")
		return
	}

	content := r.FormValue("content")

	okAuth, err := isAuthorized(post_id, userID, group_id)
	if err != nil {
		fmt.Println(err)
		global.JsonResponse(w, http.StatusInternalServerError, "Something was wrong")
		return
	}

	if !okAuth {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized")
		return
	}

	imagePublic := ""

	// 2500 for content
	if r.ContentLength > (20*1024*1024)+2500 {
		global.JsonResponse(w, http.StatusConflict, "The image is too big, max size is 20 MB")
		return
	}
	img, _, err := r.FormFile("image")
	if len(content) >= 2100 || (err != nil && (len(content) <= 2)) {
		global.JsonResponse(w, http.StatusBadRequest, "Size of content isn't valid")
		return
	}
	if err == nil {
		imagePublic, err = image_handler(w, img)
		if err != nil {
			return
		}
	}

	// -------------------------- check if post id exist
	post := 0
	row, err := database.SelectOneRow("SELECT id FROM posts WHERE id = ?", post_id)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	err = row.Scan(&post)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "post id not exist")
		return
	}
	// --------------------------- inset to the data base
	cmd := `INSERT INTO comments (user_id, post_id, comment_text, image) VALUES(?, ?, ?, ?)`
	_, err = database.ExecQuery(cmd, userID, post_id, content, imagePublic)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	global.JsonResponse(w, http.StatusCreated, "comment created")
}

// get the comment 10 by 10 in spesific post
// link: GET /posts/comments&post_id=`id`&last_id=`id`&page=`page`
func getComments(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postId, _ := strconv.Atoi(r.URL.Query().Get("post_id"))
	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))

	if lastId == 0 {
		lastId = 999999999999999999
	}

	if postId <= 0 || lastId < 0 {
		global.JsonResponse(w, http.StatusBadRequest, "postID is invalid")
		return
	}

	group_id, err := getGroupOfpost(postId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something was wrong")
		return
	}

	if group_id != 0 && !groups.IsMember(group_id, userID) {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member")
		return
	}

	okAuth, err := isAuthorized(postId, userID, group_id)
	if err != nil {
		fmt.Println(err)
		global.JsonResponse(w, http.StatusInternalServerError, "Something is wrong")
		return
	}
	if !okAuth {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized to react to this post")
		return
	}

	query := `
        SELECT
    		cmt.id,
    		u.id,
    		u.avatar,
			u.first_name,
			u.last_name,
    		cmt.comment_text,
    		cmt.created_at,
			cmt.image,
			CASE u.id 
           		WHEN ? 
           		    THEN true 
           		ELSE false 
       		END edit
		FROM
		    comments AS cmt
		    JOIN users AS u on cmt.user_id = u.id
		    JOIN posts AS p on cmt.post_id = p.id

		WHERE p.id = ? AND cmt.id < ?

		ORDER BY cmt.id DESC
		LIMIT 5
`

	sqlrows, err := database.SelectQuery(query, userID, postId, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something was wrong")
		return
	}

	var comments []Comment
	for sqlrows.Next() {
		var comment Comment
		if err := sqlrows.Scan(
			&comment.ID,
			&comment.UserID,
			&comment.Avatar,
			&comment.First_name,
			&comment.Last_name,
			&comment.CommentContent,
			&comment.CreatedAt,
			&comment.Image,
			&comment.Edit,
		); err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "Failed to process comments")
			return
		}
		comments = append(comments, comment)
	}

	global.JsonResponse(w, http.StatusOK, comments)
}

// comment delete handler
// link DELETE /posts/comments/delete?comment_id=`id`
func commentDelete(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))
	if comment_id <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	isauthorized, err := is_user_authorized(userID, comment_id, "comments")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "something is wrong")
		return
	}

	if !isauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	query := `DELETE FROM comments WHERE id=?`
	_, err = database.ExecQuery(query, comment_id)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something was wrong")
		return
	}

	global.JsonResponse(w, http.StatusOK, "the comment deleted seccessfully")
}

// comment update handler
// link PUT /posts/comments/update?comment_id=`id`&content=`newcontentt`
func commentUpdate(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))
	if comment_id <= 0 {
		global.JsonResponse(w, http.StatusInternalServerError, "Something was wrong")
		return
	}

	isAuthorized, err := is_user_authorized(userID, comment_id, "comments")

	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something where wrong")
		return
	}
	if !isAuthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_content := r.FormValue("newContent")
	fmt.Println(comment_content)
	if comment_content == "" || len(comment_content) >= 1100 {
		global.JsonResponse(w, http.StatusBadRequest, "Something is wrong")
		return
	}
	comment_content = html.EscapeString(comment_content)

	query := `UPDATE comments SET comment_text = ? WHERE id = ?`

	_, err = database.ExecQuery(query, comment_content, comment_id)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	global.JsonResponse(w, http.StatusAccepted, "comment updated")
}
