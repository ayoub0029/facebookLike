package posts

import (
	"net/http"
	"time"
)

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("POST /posts", CreatePost)
	mux.HandleFunc("GET /posts", getPosts)
	mux.HandleFunc("DELETE /posts/delete", postDelete)
	mux.HandleFunc("PUT /posts/update", postUpdate)
	mux.HandleFunc("GET /posts/profile", UserProfilePosts)
	mux.HandleFunc("GET /posts/group", getPostGroup)
	mux.HandleFunc("GET /posts/reactions", ApplyUserReaction)
	mux.HandleFunc("GET /posts/comments", getComments)
	mux.HandleFunc("POST /posts/comments", addComment)
	mux.HandleFunc("DELETE /posts/comments/delete", commentDelete)
	mux.HandleFunc("PUT /posts/comments/update", commentUpdate)
}

type Comment struct {
	ID             int    `json:"id"`
	Username       string `json:"user_name"`
	CommentContent string `json:"comment_content"`
	CreatedAt      string `json:"created_at"`
}

type PostData struct {
	ID         int       `json:"id"`
	Likes      int       `json:"likes"`
	Comments   int       `json:"comments"`
	Username   string    `json:"username"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
	Updated_at time.Time `json:"updated_at_at"`
	Image      string    `json:"image"`
	Group_name string    `json:"group_name"`
}
