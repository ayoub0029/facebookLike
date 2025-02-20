package Profiles

import (
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	database "socialNetwork/Database"
)

var (
	ErrUserNotExist    = errors.New("user does not exist")
	ErrInvalidParams   = errors.New("invalid parameters provided")
	ErrUserIdMustBeInt = errors.New("user ID must be an integer")
	ErrUnauthorized    = errors.New("unauthorized access")
	ErrFollowYourself  = errors.New("you cant follow or unfollow youself")
)

// Check if the user Exist
func UserExists(userID int) bool {
	var Exist bool
	Query := "SELECT COUNT(1) FROM users WHERE id = ?"

	Row, err := database.SelectOneRow(Query, userID)
	if err != nil {
		fmt.Println(err)
		return false
	}
	if err := Row.Scan(&Exist); err != nil {
		return false
	}
	return Exist
}

// check if the user have public account
func IsPublic(UserID int) (bool, error) {
	if !UserExists(UserID) {
		return false, ErrUserNotExist
	}

	var Profile_Status string
	Query := "SELECT profile_status FROM users WHERE id = ?"

	Row, err := database.SelectOneRow(Query, UserID)
	if err != nil {
		return false, err
	}
	if err := Row.Scan(&Profile_Status); err != nil {
		return false, err
	}

	return Profile_Status == ProfileStatus[Profile_Public], nil
}

// check if A if follow user B
// If This function return -1 That mean false
func IsFollowed(a, b int) (int, error) {
	if a == b {
		return -1, ErrFollowYourself
	}

	if !UserExists(a) || !UserExists(b) {
		return -1, ErrUserNotExist
	}

	var RelationID int

	Query := `SELECT id FROM followers WHERE follower_id = ? AND followed_id = ? AND status = 'accept'`
	row, err := database.SelectOneRow(Query, a, b)
	if err != nil {
		return -1, err
	}
	if err := row.Scan(&RelationID); err != nil {
		if err == sql.ErrNoRows {
			return -1, ErrCantFindRelationId
		}
		return -1, err
	}

	return RelationID, nil
}

func NameValidation(Value string) bool {
	if len(Value) < 3 || len(Value) > 20 {
		return false
	}
	return true
}

func EmailValidation(Value string) bool {
	validEmail, err := regexp.MatchString(`^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,40}$`, Value)
	if !validEmail || err != nil {
		return false
	}
	return true
}

func PasswordValidation(Value string) bool {
	if len(Value) < 5 || len(Value) > 35 {
		return false
	}
	return true
}

func BioValidatiob(Value string) bool {
	if len(Value) < 5 || len(Value) > 200 {
		return false
	}
	return true
}

func ProfileStatusValidation(Value string) bool {
	if Value != ProfileStatus[Profile_Private] && Value != ProfileStatus[Profile_Public] {
		return false
	}
	return true
}
