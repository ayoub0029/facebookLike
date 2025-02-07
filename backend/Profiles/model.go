package profiles

import (
	"net/http"
)

type Following struct {
	Id       int
	Nickname string
	Avatar   string
}

type Followers struct {
	Id       int
	Nickname string
	Avatar   string
}

type Profile struct {
	Id          int
	ProfileData ProfileData
}

type ProfileData struct {
	Email      string
	First_Name string
	Last_Name  string
	DOB        string
	Avatar     string
	Nickname   string
	AboutMe    string
	Following  []Following
	Followers  []Followers
}

func NewProfile(Id int) (*Profile, error) {
	if !UserExists(Id) {
		return nil, ErrUserNotExist
	}
	return &Profile{Id: Id}, nil
}

func (p *Profile) GetProfileInfo() (int, error) {
	return http.StatusOK, nil
}
