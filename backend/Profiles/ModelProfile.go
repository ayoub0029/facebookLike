package Profiles

import (
	"errors"
	"fmt"

	"socialNetwork/database"
)

type Profile struct {
	Id          int
	ProfileData ProfileData
}

type ProfileData struct {
	ProfileStatus string
	Avatar        string
	Nickname      string
	First_Name    string
	Last_Name     string
	AboutMe       string
	Email         string
	DOB           string
	Created_at    string
}

var (
	ProfileStatus        = [2]string{"private", "public"}
	Profile_Private int8 = 0 // Index Of Privat in ProfileStatus Array
	Profile_Public  int8 = 1 // Index Of Public in ProfileStatus Array
)

var ErrInvalidField = errors.New("disallowed field name")

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
		date_of_birth,
		Created_at
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
		&p.ProfileData.Created_at,
	)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func (p *Profile) UpdateProfileInfo(Field, Data string) error {
	allowedFields := map[string]bool{
		"first_name":     true,
		"last_name":      true,
		"email":          true,
		"password":       true,
		"date_of_birth":  true,
		"avatar":         true,
		"nickname":       true,
		"about_me":       true,
		"profile_status": true,
	}

	if !allowedFields[Field] {
		return ErrInvalidField
	}
	query := fmt.Sprintf("UPDATE users SET %s = ? WHERE id = ?", Field)
	if _, err := database.ExecQuery(query, Data, p.Id); err != nil {
		return err
	}
	return nil
}
