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
	mux.HandleFunc("GET /post", getSpesificPost)
}

type Comment struct {
	ID             int    `json:"id"`
	Username       string `json:"user_name"`
	CommentContent string `json:"comment_content"`
	CreatedAt      string `json:"created_at"`
	Image          any    `json:"image"`
}

type PostData struct {
	ID         int       `json:"id"`
	Avatar     any       `json:"avatar"`
	Nickname   any       `json:"nickname"`
	First_name string    `json:"first_name"`
	Last_name  string    `json:"last_name"`
	Likes      any       `json:"likes"`
	Comments   any       `json:"comments"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
	Updated_at any       `json:"updated_at_at"`
	Image      any       `json:"image"`
	Group_name any       `json:"group_name"`
	IsLiked    any       `json:"is_liked"`
	Privacy    string    `json:"privacy"`
	Edit       bool      `json:"edit"`
}
