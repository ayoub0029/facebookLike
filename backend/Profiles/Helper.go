package profiles

import (
	"errors"
	"fmt"

	"socialNetwork/database"
)

var (
	ErrUserNotExist    = errors.New("user does not exist")
	ErrInvalidParams   = errors.New("invalid parameters provided")
	ErrUserIdMustBeInt = errors.New("user ID must be an integer")
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
	Row.Scan(&Exist)
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
	Row.Scan(&Profile_Status)

	return Profile_Status == ProfileStatus[Profile_Public], nil
}

// check if A if follow user B
func IsFollowed(a, b int) (bool, error) {
	if !UserExists(a) || !UserExists(b) {
		return false, ErrUserNotExist
	}
	var Exist bool
	Query := `
	SELECT
	 	COUNT(1)
	FROM
	 	followers
	WHERE 
		follower_id = ? 
	AND
	 	followed_id = ?
	AND 
		status = ?"`

	row, err := database.SelectOneRow(Query, a, b, Follower_Accept)
	if err != nil {
		return false, err
	}

	row.Scan(&Exist)

	return Exist, nil
}
