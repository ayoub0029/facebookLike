package posts

import (
	"html"
	"net/http"
	auth "socialNetwork/Authentication"
	database "socialNetwork/Database"
	global "socialNetwork/Global"
	groups "socialNetwork/Groups"
	"strconv"
	"time"
)

// this function responsible for post creation work in both the profile or group
// the user sould be member of the group to post in it
// link is POST /posts&content=`content`&image=`image`&group_id=`group_id`&privacy=`privacy“
func CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// start handling image
	imagePublic := "" // image path if exist

	content := r.FormValue("content")
	content = html.EscapeString(content)
	if len(content) >= 2500 || len(content) <= 2 {
		global.JsonResponse(w, http.StatusBadRequest, "Size of content isn't valid")
		return
	}

	// 2500 for content
	if r.ContentLength > (20*1024*1024)+2500 {
		global.JsonResponse(w, http.StatusConflict, "The image is too big, max size is 20 MB")
		return
	}
	img, _, err := r.FormFile("image")

	if err == nil {
		imagePublic, err = image_handler(w, img)
		if err != nil {
			return
		}
	}

	groupIdString := r.FormValue("groupId")
	groupID := 0
	if groupIdString != "" {
		groupID, _ = strconv.Atoi(groupIdString)
		if groupID <= 0 {
			global.JsonResponse(w, http.StatusBadRequest, "Bad Request")
			return
		}

		IsMember := groups.IsMember(userID, groupID)
		if !IsMember {
			global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
	}

	privacy := r.FormValue("privacy")
	if privacy != "public" && privacy != "private" && privacy != "almost private" {
		global.JsonResponse(w, http.StatusBadRequest, "Privacy is not valid")
		return
	}

	err = InsertPost(strconv.Itoa(userID), content, imagePublic, groupID, privacy)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error add post")
		return
	}

	global.JsonResponse(w, http.StatusOK, "Post created successfully")
}

// spesific profile postes
// link is GET /posts/profile&user_id=`user_id`&last_id=`last_id`
func UserProfilePosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))
	userProfileID, _ := strconv.Atoi(r.FormValue("user_id"))

	if userProfileID <= 0 || lastId <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid data provided")
		return
	}

	myQuery := `
	SELECT
		p.id,
		u.avatar,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
		u.nickname,
	    p.content,
	    p.created_at,
	    p.media,
	    p.updated_at,
	    u.first_name,
		u.last_name,
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
	    ) AND p.id > $3
	ORDER BY
	    p.id
	LIMIT
		10
		`
	posts, err := database.SelectQuery(myQuery, userID, userProfileID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusNotFound, "Not Found")
		return
	}
	var Post PostData
	var allPosts []PostData
	for posts.Next() {
		posts.Scan(&Post.ID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.Content, &Post.CreatedAt, &Post.Image, &Post.Updated_at, &Post.First_name, &Post.Last_name, &Post.Group_name)
		allPosts = append(allPosts, Post)
	}
	global.JsonResponse(w, http.StatusOK, allPosts)
}

// get posts to display in the feed
// link is GET /posts&last_id=`last_id`
func getPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))
	if lastId < 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid data provided")
		return
	}
	query := `
	SELECT
		p.id,
		u.avatar,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
		u.nickname,
	    u.first_name,
		u.last_name,
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
	    ) AND p.id > $2
	ORDER BY
	    p.id
	LIMIT
		10
	`
	posts, err := database.SelectQuery(query, userID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.ID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name)
		// Post.IsLiked, err = CheckLikePost(userID, Post.ID)
		// if err != nil {
		// 	global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		// 	return
		// }
		AllPosts = append(AllPosts, Post)
	}
	global.JsonResponse(w, http.StatusOK, AllPosts)
}

// get posts from a specific group
// link is GET /posts/group&group_id=`group_id`&last_id=`last_id`
func getPostGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	groupID, _ := strconv.Atoi(r.URL.Query().Get("group_id"))
	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))
	if groupID <= 0 || lastId < 0 {
		global.JsonResponse(w, http.StatusBadRequest, "group_id is required")
		return
	}
	isMember := groups.IsMember(userID, groupID)
	if !isMember {
		global.JsonResponse(w, http.StatusUnauthorized, "you are not a member of this group")
		return
	}

	query := `
	SELECT
		p.id,
		u.avatar,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
		u.nickname,
	    u.first_name,
		u.last_name,
	    p.content,
	    p.created_at,
	    p.updated_at,
	    p.media,
	    p.privacy,
	    (SELECT g.name FROM groups AS g WHERE g.id = p.group_id) AS group_name
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	WHERE
		p.group_id IS NOT NULL AND p.group_id = $1 AND p.id > $2
	ORDER BY
	    p.id
	LIMIT
		10
	`
	posts, err := database.SelectQuery(query, groupID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.ID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Privacy, &Post.Group_name)
		Post.IsLiked, err = CheckLikePost(userID, Post.ID)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
			return
		}
		AllPosts = append(AllPosts, Post)
	}
	global.JsonResponse(w, http.StatusOK, AllPosts)
}

// add update exsting post
// link is PUT /posts/update&post_id=`post_id`&newContent=`newContent`
func postUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Invalid user")
		return
	}

	postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}

	isAuthorized, err := is_user_authorized(userID, postID, "post")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error checking authorization")
		return
	}

	if !isAuthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized to update this post")
		return
	}

	newContent := r.FormValue("newContent")
	newContent = html.EscapeString(newContent)
	if len(newContent) <= 2 || len(newContent) > 2500 {
		global.JsonResponse(w, http.StatusBadRequest, "Content length is not valid")
		return
	}

	query := "UPDATE posts SET content = ?, updated_at = ? WHERE id = ?"
	_, err = database.ExecQuery(query, newContent, time.Now(), postID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error updating post")
		return
	}

	global.JsonResponse(w, http.StatusOK, "Post updated successfully")

}

// delete post
// likn is DELETE /posts/delete&post_id=`post_id`
func postDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}

	isAuthorized, err := is_user_authorized(userID, postID, "post")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error checking authorization")
		return
	}

	if !isAuthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized to delete this post")
		return
	}

	query := `DELETE FROM posts WHERE id = ?`
	_, err = database.ExecQuery(query, postID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error deleting post")
		return
	}

	global.JsonResponse(w, http.StatusOK, "Post deleted successfully")
}

// likn is GET /posts/getpost&post_id=`post_id`
func getSpesificPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userID, err := get_userID(r)
	if err != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID, _ := strconv.Atoi(r.URL.Query().Get("post_id"))

	if postID <= 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Bad Request")
		return
	}

	query := `
	SELECT
		p.id,
		u.avatar,
	    (SELECT COUNT(*) FROM post_reactions AS reaction WHERE reaction.post_id = p.id) AS likes,
	    (SELECT COUNT(*) FROM comments AS com WHERE com.post_id = p.id) AS comments,
		u.nickname,
	    u.first_name,
		u.last_name,
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
		(p.privacy = 'public'
		OR (p.privacy = 'almost private' AND f.followed_id IS NOT NULL)
		OR (p.privacy = 'private' AND pv.post_id IS NOT NULL)
	    )AND p.id = $2
	ORDER BY
	    p.id
	`
	posts, err := database.SelectQuery(query, userID, postID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}
	var Post PostData
	posts.Scan(&Post.ID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name)
	Post.IsLiked, err = CheckLikePost(userID, Post.ID)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}

	if Post.Group_name != "" {
		id, err := getGroupid(userID, Post.Group_name)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
			return
		}
		ok := groups.IsMember(userID, id)
		if !ok {
			global.JsonResponse(w, http.StatusForbidden, "you are not member of this group")
			return
		}
	}

	global.JsonResponse(w, http.StatusOK, Post)
}
