package posts

import (
	"net/http"
	"socialNetwork/database"
	"strconv"
	"time"
)

// this function responsible for post creation work in both the profile or group
func CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// start handling image
	imagePublic := "" // image path if exist

	// 2500 for content
	if r.ContentLength > (20*1024*1024)+2500 {
		jsonResponse(w, http.StatusConflict, "The image is too big, max size is 20 MB")
		return
	}
	img, _, err := r.FormFile("image")

	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error of server")
		return
	}

	imagePublic, err = image_handler(w, img)
	if err != nil {
		return
	}

	content := r.FormValue("content")
	groupIdString := r.FormValue("groupId")
	groupID := 0
	if groupIdString != "" {
		groupID, _ = strconv.Atoi(groupIdString)
		if groupID <= 0 {
			jsonResponse(w, http.StatusBadRequest, "Bad Request")
			return
		}
	}

	if len(content) >= 2500 {
		jsonResponse(w, http.StatusBadRequest, "Size of content is too large")
		return
	}
	privacy := r.FormValue("privacy")
	if privacy != "public" && privacy != "private" && privacy != "almost private" {
		jsonResponse(w, http.StatusBadRequest, "Privacy is not valid")
		return
	}

	err = InsertPost(strconv.Itoa(userID), content, imagePublic, time.Now(), groupID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error add post")
		return
	}

	jsonResponse(w, http.StatusOK, "Post created successfully")
}

// // spesific profile postes
func UserProfilePosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	page, pageErr := strconv.Atoi(r.FormValue("page"))

	userProfileID, _ := strconv.Atoi(r.FormValue("user_id"))

	if pageErr != nil || userProfileID <= 0 {
		jsonResponse(w, http.StatusBadRequest, "Invalid data provided")
		return
	}

	myQuery := `
	SELECT
	    p.privacy,
	    u.first_name,
		u.last_name,
	    p.id,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
	    p.content,
	    p.created_at,
	    p.updated_at,
	    p.media,
	    (SELECT g.name FROM groups AS g WHERE g.id = p.group_id) AS group_name
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	    LEFT JOIN post_visibility AS pv ON pv.post_id = p.id AND pv.user_id = $1
		LEFT JOIN followers AS f ON f.followed_id = u.id AND f.status != 'pending' AND f.follower_id = $1
	WHERE
		p.user_id = $2 AND
		p.group_id IS NULL AND(
	    p.privacy = 'public' 
		OR (p.privacy = 'almost private' AND f.followed_id IS NOT NULL) 
		OR (p.privacy = 'private' AND pv.post_id IS NOT NULL) 
	    )
	ORDER BY
	    p.id
	LIMIT
		10
	OFFSET
		$3
		`
	posts, err := database.SelectQuery(myQuery, userID, userProfileID, (page*7)-7)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, "Not Found")
		return
	}
	var Post PostData
	var allPosts []PostData
	for posts.Next() {
		posts.Scan(&Post.ID, &Post.Likes, &Post.Comments, &Post.Username, &Post.Content, &Post.CreatedAt, &Post.Image)
		allPosts = append(allPosts, Post)
	}
	jsonResponse(w, http.StatusOK, allPosts)
}

// get posts normally to display in the feed
func getPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	query := `
	SELECT
	    p.privacy,
	    u.first_name,
		u.last_name,
	    p.id,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
	    p.content,
	    p.created_at,
	    p.updated_at,
	    p.media,
	    (SELECT g.name FROM groups AS g WHERE g.id = p.group_id) AS group_name
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	    LEFT JOIN post_visibility AS pv ON pv.post_id = p.id AND pv.user_id = $1
		LEFT JOIN followers AS f ON f.followed_id = u.id AND f.status != 'pending' AND f.follower_id = $1
	WHERE
		p.group_id IS NULL AND(
	    p.privacy = 'public' 
		OR (p.privacy = 'almost private' AND f.followed_id IS NOT NULL) 
		OR (p.privacy = 'private' AND pv.post_id IS NOT NULL) 
	    )
	ORDER BY
	    p.id
	LIMIT
		10
	`
	posts, err := database.SelectQuery(query, userID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "some thinh where wrong")
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.Username, &Post.ID, &Post.Likes, &Post.Comments, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name)
		AllPosts = append(AllPosts, Post)
	}
	jsonResponse(w, http.StatusOK, AllPosts)
}

// get posts from a specific group
func getPostGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	groupID, _ := strconv.Atoi(r.URL.Query().Get("group_id"))
	if groupID <= 0 {
		jsonResponse(w, http.StatusBadRequest, "group_id is required")
		return
	}

	query := `
	SELECT
	    p.privacy,
	    u.first_name,
		u.last_name,
	    p.id,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
	    p.content,
	    p.created_at,
	    p.updated_at,
	    p.media,
	    (SELECT g.name FROM groups AS g WHERE g.id = p.group_id) AS group_name
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	WHERE
		p.group_id IS NOT NULL AND p.group_id = $1
	ORDER BY
	    p.id
	LIMIT
		10
	`
	posts, err := database.SelectQuery(query, userID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "some thinh where wrong")
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.Username, &Post.ID, &Post.Likes, &Post.Comments, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name)
		AllPosts = append(AllPosts, Post)
	}
	jsonResponse(w, http.StatusOK, AllPosts)
}

// add update exsting post
func postUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Invalid user")
		return
	}

	postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}

	isAuthorized, err := is_user_authorized(userID, postID, "post")
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error checking authorization")
		return
	}

	if !isAuthorized {
		jsonResponse(w, http.StatusUnauthorized, "You are not authorized to update this post")
		return
	}

	newContent := r.FormValue("newContent")
	if newContent == "" || len(newContent) > 2500 {
		jsonResponse(w, http.StatusBadRequest, "Content is required")
		return
	}

	query := "UPDATE posts SET content = ? WHERE id = ?"
	_, err = database.ExecQuery(query, newContent, postID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error updating post")
		return
	}

	jsonResponse(w, http.StatusOK, "Post updated successfully")

}

// delete post
func postDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}

	isAuthorized, err := is_user_authorized(userID, postID, "post")
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error checking authorization")
		return
	}

	if !isAuthorized {
		jsonResponse(w, http.StatusUnauthorized, "You are not authorized to delete this post")
		return
	}

	query := `DELETE FROM posts WHERE id = ?`
	_, err = database.ExecQuery(query, postID)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error deleting post")
		return
	}

	jsonResponse(w, http.StatusOK, "Post deleted successfully")
}
