package auth

type User struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	DateOB    string `json:"dateob"`
	Avatar    string `json:"avatar"`
	Nickname  string `json:"nickname"`
	AboutMe   string `json:"aboutMe"`
}

type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
