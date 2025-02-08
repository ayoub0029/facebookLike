package profiles

import (
	"fmt"

	"socialNetwork/database"
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

var (
	ProfileStatus         = [2]string{"private", "public"}
	FollowerStatus        = [2]string{"pending", "accept"}
	Profile_Private  int8 = 0
	Profile_Public   int8 = 1
	Follower_Pending int8 = 0
	Follower_Accept  int8 = 1
)

type ProfileData struct {
	ProfileStatus string
	Avatar        string
	Nickname      string
	First_Name    string
	Last_Name     string
	AboutMe       string
	Email         string
	DOB           string
	Following     []Following
	Followers     []Followers
}

func NewProfile(Id int) (*Profile, error) {
	if !UserExists(Id) {
		return nil, ErrUserNotExist
	}
	return &Profile{
		Id:          Id,
		ProfileData: ProfileData{},
	}, nil
}

func (p *Profile) GetProfileInfo() error {
	Query := `
	SELECT 
		profile_status,
		avatar,
		nickname,
		first_name,
		last_name,
		about_me,
		email,
		date_of_birth
	FROM users 
	WHERE id = ?
	`
	Row, err := database.SelectOneRow(Query, p.Id)
	if err != nil {
		return err
	}
	err = Row.Scan(
		&p.ProfileData.ProfileStatus,
		&p.ProfileData.Avatar,
		&p.ProfileData.Nickname,
		&p.ProfileData.First_Name,
		&p.ProfileData.Last_Name,
		&p.ProfileData.AboutMe,
		&p.ProfileData.Email,
		&p.ProfileData.DOB,
	)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}
