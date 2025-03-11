package posts

import (
	"fmt"
	"net/http"
	auth "socialNetwork/Authentication"
	database "socialNetwork/Database"
	global "socialNetwork/Global"
	groups "socialNetwork/Groups"
	middleware "socialNetwork/Middlewares"
	"strconv"
	"time"
)

// this function responsible for post creation work in both the profile or group
// the user sould be member of the group to post in it
// link is POST /posts&content=`content`&image=`image`&group_id=`group_id`&privacy=`privacy“
func CreatePost(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := auth.ParseFormSize(w, r); err != nil {
		return
	}
	resultPath := auth.UploadImage("image", w, r)
	if resultPath == nil {
		return
	}

	// start handling image
	imagePublic := *resultPath

	content := r.FormValue("content")
	if len(content) >= 2500 || len(content) <= 2 {
		global.JsonResponse(w, http.StatusBadRequest, "Size of content isn't valid")
		return
	}

	groupIdString := r.FormValue("groupId")
	var groupID *int = nil

	if groupIdString != "" {
		id, err := strconv.Atoi(groupIdString)
		if err != nil || id <= 0 {
			global.JsonResponse(w, http.StatusBadRequest, "Bad Request")
			return
		}
		groupID = &id

		IsMember := groups.IsMember(*groupID, userID)
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

	postID, err := InsertPost(strconv.Itoa(userID), content, imagePublic, groupID, privacy)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error add post")
		return
	}

	if privacy == "private" {
		r.ParseForm()
		err := private_post(postID, r.Form["allowedUsers"])
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "Error add post")
			return
		}
	}

	global.JsonResponse(w, http.StatusOK, "Post created successfully")
}

// spesific profile posts
// link is GET /posts/profile&user_id=`user_id`&last_id=`last_id`
func UserProfilePosts(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	lastId, err := strconv.Atoi(r.URL.Query().Get("last_id"))
	userProfileID, errr := strconv.Atoi(r.FormValue("user_id"))

	if userProfileID < 0 || lastId < 0 || err != nil || errr != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid data provided")
		return
	}

	if lastId == 0 {
		lastId = 9223372036854775806
	}

	// Improved query that includes the edit flag and properly handles visibility
	myQuery := `
	SELECT
		p.id,
		u.id,
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
		(SELECT g.id FROM groups AS g WHERE g.id = p.group_id) AS group_id,
		p.privacy,
		CASE 
			WHEN p.user_id = $1 THEN true 
			ELSE false 
		END AS edit
	FROM
		posts AS p
		JOIN users AS u ON p.user_id = u.id
		LEFT JOIN post_visibility AS pv ON pv.post_id = p.id AND pv.user_id = $1
		LEFT JOIN followers AS f ON f.followed_id = u.id AND f.status != 'pending' AND f.follower_id = $1
	WHERE
		p.user_id = $2 AND
		p.group_id IS NULL AND (
			(u.profile_status = 'public') OR 
			(f.follower_id IS NOT NULL) OR 
			(p.user_id = $1)
		) AND (
			p.privacy = 'public' OR 
			(p.privacy = 'almost private' AND f.followed_id IS NOT NULL) OR 
			(p.privacy = 'private' AND pv.post_id IS NOT NULL) OR
			p.user_id = $1
		) AND p.id < $3
	ORDER BY
		p.id DESC
	LIMIT
		10
	`
	posts, err := database.SelectQuery(myQuery, userID, userProfileID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something went wrong")
		return
	}

	var allPosts []PostData
	for posts.Next() {
		var Post PostData
		err := posts.Scan(
			&Post.ID,
			&Post.UserID,
			&Post.Avatar,
			&Post.Likes,
			&Post.Comments,
			&Post.Nickname,
			&Post.First_name,
			&Post.Last_name,
			&Post.Content,
			&Post.CreatedAt,
			&Post.Updated_at,
			&Post.Image,
			&Post.Group_name,
			&Post.Privacy,
			&Post.Edit,
		)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "Error scanning post data")
			return
		}

		// Check if user liked the post
		Post.IsLiked, err = CheckLikePost(Post.ID, userID)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "Error checking likes")
			return
		}

		allPosts = append(allPosts, Post)
	}

	global.JsonResponse(w, http.StatusOK, allPosts)
}

// get posts to display in the feed
// link is GET /posts&last_id=`last_id`

// ta3dilat ayoub ---- lastId < | p.group_id = 0 machi null | ORDER BY  p.id DESC | 9223372036854775806

func getPosts(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	lastId, _ := strconv.Atoi(r.URL.Query().Get("last_id"))
	if lastId < 0 {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid data provided")
		return
	}
	if lastId == 0 {
		lastId = 9223372036854775806
	}
	// tas7i7 zet edit
	query := `
	SELECT
		p.id,
		u.id,
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
	    (SELECT g.id FROM groups AS g WHERE g.id = p.group_id) AS group_id,
		p.privacy,
		CASE u.id 
           WHEN $1 
               THEN true 
           ELSE false 
       	END edit
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	    LEFT JOIN post_visibility AS pv ON pv.post_id = p.id AND pv.user_id = $1
		LEFT JOIN followers AS f ON f.followed_id = u.id AND f.status != 'pending' AND f.follower_id = $1
	WHERE
		p.group_id IS NULL
		AND ((u.profile_status = 'public') OR (f.follower_id IS NOT NULL) OR (p.user_id = $1))
		AND (p.privacy = 'public' 
		OR (p.privacy = 'almost private' AND f.followed_id IS NOT NULL) 
		OR (p.privacy = 'private' AND pv.post_id IS NOT NULL) 
	    OR p.user_id = $1) AND p.id < $2  
	ORDER BY
    	p.id DESC  
	LIMIT
		10
	`
	posts, err := database.SelectQuery(query, userID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrongg")
		return
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.ID, &Post.UserID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name, &Post.Privacy, &Post.Edit)
		Post.IsLiked, err = CheckLikePost(Post.ID, userID)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "some thing wrong")
			return
		}
		AllPosts = append(AllPosts, Post)
	}
	global.JsonResponse(w, http.StatusOK, AllPosts)
}

// get posts from a specific group
// link is GET /posts/group&group_id=`group_id`&last_id=`last_id`
func getPostGroup(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	groupID, err := strconv.Atoi(r.URL.Query().Get("group_id"))
	lastId, errr := strconv.Atoi(r.URL.Query().Get("last_id"))
	if groupID < 0 || lastId < 0 || err != nil || errr != nil {
		global.JsonResponse(w, http.StatusBadRequest, "group_id is required")
		return
	}

	if lastId == 0 {
		lastId = 9223372036854775806
	}

	isMember := groups.IsMember(groupID, userID)
	if !isMember {
		global.JsonResponse(w, http.StatusUnauthorized, "you are not a member of this group")
		return
	}

	query := `
	SELECT
		p.id,
		u.id,
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
	    (SELECT g.id FROM groups AS g WHERE g.id = p.group_id) AS group_id,
		CASE u.id 
           WHEN $1 
               THEN true 
           ELSE false 
       	END edit
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	WHERE
		p.group_id IS NOT NULL AND p.group_id = $2 AND p.id < $3
	ORDER BY
	    p.id DESC
	LIMIT
		10
	`

	posts, err := database.SelectQuery(query, userID, groupID, lastId)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}
	var AllPosts []PostData
	for posts.Next() {
		var Post PostData
		posts.Scan(&Post.ID, &Post.UserID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Privacy, &Post.Group_name, &Post.Edit)
		Post.IsLiked, err = CheckLikePost(Post.ID, userID)
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
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// tas7i7 FormValue instead of .Query().Get(
	// postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	postID, err := strconv.Atoi(r.FormValue("post_id"))
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}

	isAuthorized, err := is_user_authorized(userID, postID, "posts")
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error checking authorization")
		return
	}

	if !isAuthorized {
		global.JsonResponse(w, http.StatusUnauthorized, "You are not authorized to update this post")
		return
	}

	newContent := r.FormValue("newContent")
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
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid post id")
		return
	}
	isAuthorized, err := is_user_authorized(userID, postID, "posts")
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
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	userID := int(user.ID)
	if !ok || userID == 0 {
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
		u.id,
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
	    (SELECT g.id FROM groups AS g WHERE g.id = p.group_id) AS group_id,
		CASE u.id 
           WHEN $1 
               THEN true 
           ELSE false 
       	END edit
	FROM
	    posts AS p
	    JOIN users AS u ON p.user_id = u.id
	    LEFT JOIN post_visibility AS pv ON pv.post_id = p.id AND pv.user_id = $1
		LEFT JOIN followers AS f ON f.followed_id = u.id AND f.status != 'pending' AND f.follower_id = $1
	WHERE
		(p.privacy = 'public'
		OR (p.privacy = 'almost private' AND f.followed_id IS NOT NULL)
		OR (p.privacy = 'private' AND pv.post_id IS NOT NULL)
		OR (p.user_id = $1)
	    )AND p.id = $2
	`
	posts, err := database.SelectOneRow(query, userID, postID) // tas7i7
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}
	var Post PostData
	posts.Scan(&Post.ID, &Post.UserID, &Post.Avatar, &Post.Likes, &Post.Comments, &Post.Nickname, &Post.First_name, &Post.Last_name, &Post.Content, &Post.CreatedAt, &Post.Updated_at, &Post.Image, &Post.Group_name, &Post.Edit)
	Post.IsLiked, err = CheckLikePost(postID, userID) // tas7i7
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "some thing was wrong")
		return
	}

	if Post.Group_name != nil { // tas7i7
		groupIdString := fmt.Sprintf("%d", Post.Group_name)
		groupID, _ := strconv.Atoi(groupIdString)
		ok := groups.IsMember(groupID, userID)
		if !ok {
			global.JsonResponse(w, http.StatusForbidden, "you are not member of this group")
			return
		}
	}

	global.JsonResponse(w, http.StatusOK, []PostData{Post})
}
