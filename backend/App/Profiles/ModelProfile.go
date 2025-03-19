package profiles

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	auth "socialNetwork/App/Authentication"
	database "socialNetwork/Database"
	global "socialNetwork/App/Global"

	"golang.org/x/crypto/bcrypt"
)

type Profile struct {
	Id          int
	ProfileData ProfileData
}

type ProfileData struct {
	Id            uint64
	ProfileStatus string
	Avatar        string
	Nickname      string
	First_Name    string
	Last_Name     string
	AboutMe       string
	Email         string
	DOB           string
	Created_at    string
	Follower      uint64
	Follwoed      uint64
}

var (
	ProfileStatus        = [2]string{"private", "public"}
	Profile_Private int8 = 0 // Index Of Privat in ProfileStatus Array
	Profile_Public  int8 = 1 // Index Of Public in ProfileStatus Array
)
var ImagesUrl = "backend/Assets/"
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

// Security Note: Directly injecting user input into SQL queries can lead to SQL injection vulnerabilities.
func (p *Profile) GetUserField(Field string) (any, error) {
	var Data any
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = ?", Field)
	Row, err := database.SelectOneRow(query, p.Id)
	if err != nil {
		return Data, err
	}
	if err := Row.Scan(&Data); err != nil {
		return Data, err
	}
	return Data, nil
}

// Retrieve profile information, and allow joining with /posts to get the user's posts for the front end.
func (p *Profile) GetProfileInfo() error {
	Query := `
	SELECT
		id,
    	profile_status,
    	avatar,
    	nickname,
    	first_name,
    	last_name,
    	about_me,
    	email,
    	date_of_birth,
    	created_at,
    	(SELECT COUNT(id) FROM followers WHERE status = 'accept' AND followed_id = $1) AS follower,
    	(SELECT COUNT(id) FROM followers WHERE status = 'accept' AND follower_id = $1) AS followed
	FROM users
	WHERE id = $1;`

	Row, err := database.SelectOneRow(Query, p.Id)
	if err != nil {
		return err
	}

	var Nickname *string
	var Aboutme *string
	var Avatar *string
	err = Row.Scan(
		&p.ProfileData.Id,
		&p.ProfileData.ProfileStatus,
		&Avatar,
		&Nickname,
		&p.ProfileData.First_Name,
		&p.ProfileData.Last_Name,
		&Aboutme,
		&p.ProfileData.Email,
		&p.ProfileData.DOB,
		&p.ProfileData.Created_at,
		&p.ProfileData.Follower,
		&p.ProfileData.Follwoed,
	)
	p.ProfileData.Nickname, p.ProfileData.Avatar, p.ProfileData.AboutMe = PointerValidation(Nickname), PointerValidation(Avatar), PointerValidation(Aboutme)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func PointerValidation(str *string) string {
	if str == nil {
		return ""
	}
	return *str
}

// Return True If the Field Is Allowed And The Data is valid
func (p *Profile) UpdateProfileInfo(w http.ResponseWriter, r *http.Request, Field, Value string) bool {
	// For Avoid Sql Injection
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
		if !NameValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "first name must be between 3 and 20 characters"})
			return false
		}
	case "last_name":
		if !NameValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "last name must be between 3 and 20 characters"})
			return false
		}
	case "email":
		if !EmailValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "invalid email format"})
			return false
		}
	case "password":
		if !PasswordValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "password must be between 5 and 35 characters"})
			return false
		}
	case "date_of_birth":
		if err := auth.IsValidDate(Value, "2006-01-02"); err != nil {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": err.Error()})
			return false
		}
	case "nickname":
		if !NameValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "nickname must be 3 to 20 characters"})
			return false
		}
	case "about_me":
		if !BioValidatiob(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "about me must be under 200 characters"})
			return false
		}
	case "profile_status":
		if !ProfileStatusValidation(Value) {
			global.JsonResponse(w, http.StatusBadRequest, map[string]string{"Error": "undefinded Profile Status"})
			return false
		}
	case "avatar":
		Data, err := p.GetUserField("avatar")
		if err != nil {
			global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
			return false
		}
		if str, ok := Data.(string); ok {
			os.Remove(ImagesUrl + str)
		}
		resultPath := auth.UploadImage(Field, w, r)
		if resultPath == nil {
			return false
		}
		Value = *resultPath
	}
	query := fmt.Sprintf("UPDATE users SET %s = ? WHERE id = ?", Field)
	if Field == "password" {
		hashPass, errHash := bcrypt.GenerateFromPassword([]byte(Value), bcrypt.DefaultCost)
		if errHash != nil {
			global.JsonResponse(w, http.StatusInternalServerError, "failed to hash password")
			return false
		}
		Value = string(hashPass)
	}
	if _, err := database.ExecQuery(query, Value, p.Id); err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, map[string]string{"Error": global.ErrServer.Error()})
		return false
	}

	if Field == "avatar" {
		global.JsonResponse(w, http.StatusOK, Value)
		return false
	}

	return true
}
