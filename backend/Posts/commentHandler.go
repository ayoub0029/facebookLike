package posts

import (
	"html"
	"net/http"
	global "socialNetwork/Global"
	"socialNetwork/database"
	"strconv"
	"time"
)

// add comment
// link: POST /posts/comments&post_id=`id`&content=`content`
func addComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
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
	if group_id <= 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member in")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	content := r.FormValue("content")
	content = html.EscapeString(content)

	ok, err := isAuthorized(post_id, userID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !ok {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized")
		return
	}

	if len(content) >= 1100 || len(content) == 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Size of comment invalid")
		return
	}

	// -------------------------- check if post id exist
	post := 0
	row, err := database.SelectOneRow("SELECT id FROM post WHERE id = ?", post_id)
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
	cmd := `INSERT INTO comments (user_id, post_id, comment_text, created_at) VALUES(?, ?, ?, ?)`
	_, err = database.ExecQuery(cmd, userID, post_id, content, time.Now())
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	global.JsonResponse(w, http.StatusCreated, "comment created")
}

// get the comment 10 by 10 in spesific post
// link: GET /posts/comments&post_id=`id`&last_id=`id`&page=`page`
func getComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postId, _ := strconv.Atoi(r.URL.Query().Get("post_id"))
	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))
	if postId <= 0 || lastId <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "postID is invalid")
		return
	}

	group_id, err := getGroupOfpost(postId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if group_id <= 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "post is in group that you are not member in")
		return
	}

	ok, err := isAuthorized(postId, userID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !ok {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized to react to this post")
		return
	}

	page := r.URL.Query().Get("page")
	Page, err := strconv.Atoi(page)
	if err != nil || Page < 1 {
		global.JsonResponse(w, http.StatusBadRequest, "Something wrong")
		return
	}

	query := `
        SELECT
    		cmt.id,
    		u.username,
    		cmt.comment_text,
    		cmt.created_at
		FROM
		    comments AS cmt
		    JOIN user AS u on cmt.user_id = u.id
		    JOIN post AS p on cmt.post_id = p.id

		WHERE p.id = ?, cmt.id > ?

		ORDER BY cmt.created_at DESC
		LIMIT 5
`

	sqlrows, err := database.SelectQuery(query, postId, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	var comments []Comment
	for sqlrows.Next() {
		var comment Comment
		if err := sqlrows.Scan(
			&comment.ID,
			&comment.Username,
			&comment.CommentContent,
			&comment.CreatedAt,
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
	if r.Method != http.MethodDelete {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))
	if comment_id <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	isauthorized, err := is_user_authorized(userID, comment_id, "comment")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "something wrong")
		return
	}

	if !isauthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	query := `DELETE FROM comments WHERE id=?`
	_, err = database.ExecQuery(query, comment_id)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	global.JsonResponse(w, http.StatusOK, "the comment deleted seccessfully")
}

// comment update handler
// link PUT /posts/comments/update?comment_id=`id`
func commentUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))
	if comment_id <= 0 {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	isAuthorized, err := is_user_authorized(userID, comment_id, "comment")

	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !isAuthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_content := r.FormValue("content")
	if comment_content == "" || len(comment_content) >= 1100 {
		global.JsonResponse(w, http.StatusBadRequest, "Something wrong")
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
