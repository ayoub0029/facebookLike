package posts

import (
	"html"
	"net/http"
	"socialNetwork/database"
	"strconv"
	"time"
)

// add comment
func addComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	postid := r.FormValue("post_id")
	post_id, _ := strconv.Atoi(postid)
	if post_id <= 0 {
		jsonResponse(w, http.StatusBadRequest, "postID is invalid")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	content := r.FormValue("content")
	content = html.EscapeString(content)

	ok, err := isAuthorized(post_id, userID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !ok {
		jsonResponse(w, http.StatusUnauthorized, "You are not authorized")
	}

	if len(content) >= 1100 || len(content) == 0 {
		jsonResponse(w, http.StatusBadRequest, "Size of comment invalid")
		return
	}

	if content == "" {
		jsonResponse(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	// -------------------------- check if post id exist
	var post int
	row, err := database.SelectOneRow("SELECT id FROM post WHERE id = ?", post_id)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	errpost := row.Scan(&post)
	if errpost != nil {
		jsonResponse(w, http.StatusBadRequest, "post id not exist")
		return
	}
	// --------------------------- inset to the data base
	cmd := `INSERT INTO comment (user_id, post_id, comment_text, created_at) VALUES(?, ?, ?, ?)`
	_, errr := database.ExecQuery(cmd, userID, post_id, content, time.Now())
	if errr != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	jsonResponse(w, http.StatusCreated, "comment created")
}

// get the comment 10 by 10 in spesific post
func getComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postIdString := r.URL.Query().Get("post_id")
	post_id, _ := strconv.Atoi(postIdString)
	if post_id <= 0 {
		jsonResponse(w, http.StatusBadRequest, "postID is invalid")
		return
	}

	ok, err := isAuthorized(post_id, userID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !ok {
		jsonResponse(w, http.StatusUnauthorized, "You are not authorized to react to this post")
	}

	page := r.URL.Query().Get("page")
	Page, err := strconv.Atoi(page)
	if err != nil || Page < 1 {
		jsonResponse(w, http.StatusBadRequest, "Something wrong")
		return
	}
	offset := (Page - 1) * 5
	query := `
        SELECT
    		cmt.id,
    		u.username,
    		cmt.comment_content,
    		cmt.created_at,
		FROM
		    comment AS cmt
		    JOIN user AS u on cmt.user_id = u.id
		    JOIN post AS p on cmt.post_id = p.id

		WHERE p.id = ?

		ORDER BY cmt.created_at DESC

		LIMIT 5 OFFSET ?
`

	sqlrows, err := database.SelectQuery(query, post_id, offset)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
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
			jsonResponse(w, http.StatusInternalServerError, "Failed to process comments")
			return
		}
		comments = append(comments, comment)
	}

	jsonResponse(w, http.StatusOK, comments)
}

// comment delete handler
func commentDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		jsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))
	if comment_id <= 0 {
		jsonResponse(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	isauthorized, err := is_user_authorized(userID, comment_id, "comment")
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	if !isauthorized {
		jsonResponse(w, http.StatusUnauthorized, "Something wrong")
		return
	}

	query := `DELETE FROM comment WHERE id=?`
	_, err = database.ExecQuery(query, comment_id)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	jsonResponse(w, http.StatusOK, "the comment deleted seccessfully")
}

// comment update handler
func commentUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		jsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	comment_id, _ := strconv.Atoi(r.FormValue("comment_id"))

	if comment_id <= 0 {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}

	isAuthorized, err := is_user_authorized(userID, comment_id, "comment")

	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	if !isAuthorized {
		jsonResponse(w, http.StatusUnauthorized, "Something wrong")
		return
	}

	comment_content := r.FormValue("content")
	if comment_content == "" || len(comment_content) >= 1100 {
		jsonResponse(w, http.StatusBadRequest, "Something wrong")
		return
	}
	comment_content = html.EscapeString(comment_content)

	query := `UPDATE comment SET comment_content = ? WHERE id = ?`

	_, err = database.ExecQuery(query, comment_content, comment_id)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return
	}
	jsonResponse(w, http.StatusAccepted, "comment updated")
}
