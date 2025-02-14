package Profiles

import (
	"database/sql"
	"errors"
	"fmt"

	"socialNetwork/database"
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

	var FollowId int
	Query := `SELECT id FROM followers WHERE follower_id = ? AND followed_id = ? AND status = 'accept'`
	row, err := database.SelectOneRow(Query, a, b)
	if err != nil {
		return -1, err
	}
	if err := row.Scan(&FollowId); err != nil {
		if err == sql.ErrNoRows {
			return -1, ErrCantFindFollowID
		}
		return -1, err
	}

	return FollowId, nil
}
