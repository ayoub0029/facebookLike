package auth

type User struct {
	Email     string `json:"email,omitempty"`
	Password  string `json:"password,omitempty"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	DateOB    string `json:"dateob,omitempty"`
	Avatar    string `json:"avatar,omitempty"`
	Nickname  string `json:"nickname,omitempty"`
	AboutMe   string `json:"aboutMe,omitempty"`
	GithubID  *int   `json:"githubid"`
}

type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GitHubUserInfo struct {
	Login     string `json:"login"`
	Name      string `json:"name,omitempty"`
	Email     string `json:"email,omitempty"`
	Bio       string `json:"bio,omitempty"`
	ID        int    `json:"id"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

const (
	clientID     = "Ov23lizV08UkuxdzTzwM"
	clientSecret = "0f442761d78a2527968ae65b45dc49d8117b77de"
	redirectURI  = "http://localhost:8080/auth/github/callback"
)
