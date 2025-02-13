package Profiles

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	auth "socialNetwork/Authentication"
	global "socialNetwork/Global"
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

var AllowedImageExtensions = map[string]bool{
	".jpeg": true,
	".png":  true,
	".gif":  true,
}

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

func (p *Profile) UpdateProfileInfo(w http.ResponseWriter, r *http.Request, Field, Value string) bool {
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

	Value, Field = strings.TrimSpace(Value), strings.TrimSpace(Field)
	if !allowedFields[Field] {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidField.Error()})
		return false
	}
	if global.CheckEmpty(Value) {
		global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": ErrInvalidField.Error()})
		return false
	}

	switch Field {
	case "first_name":
		if len(Value) < 2 || len(Value) > 20 {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "first name must be between 2 and 20 characters"})
			return false
		}
	case "last_name":
		if len(Value) < 2 || len(Value) > 20 {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "last name must be between 2 and 20 characters"})
			return false
		}
	case "email":
		validEmail, err := regexp.MatchString(`^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,40}$`, Value)
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": "error validating email"})
			return false
		}
		if !validEmail {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "invalid email format"})
			return false
		}
	case "password":
		if len(Value) < 5 || len(Value) > 35 {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "password must be between 5 and 35 characters"})

			return false
		}
	case "date_of_birth":
		if err := auth.IsValidDate(Value, "2006-01-02"); err != nil {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
			return false
		}
	case "nickname":
		if len(Value) < 3 || len(Value) > 20 {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "nickname must be 3 to 20 characters"})
			return false
		}
	case "about_me":
		if len(Value) > 200 {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "about me must be under 200 characters"})
			return false
		}
	case "profile_status":
		if ProfileStatus[Profile_Public] != Value && ProfileStatus[Profile_Private] != Value {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "undefinded Profile Status"})
			return false
		}
	case "avatar":
		resultPath := auth.UploadImage(Field, w, r)
		if resultPath == nil {
			return false
		}
		Value = *resultPath
	}

	query := fmt.Sprintf("UPDATE users SET %s = ? WHERE id = ?", Field)
	if _, err := database.ExecQuery(query, Value, p.Id); err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": ErrServer.Error()})
		return false
	}
	return true
}
