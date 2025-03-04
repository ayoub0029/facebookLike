package profiles

import (
	"errors"
	"fmt"
	"net/http"

	database "socialNetwork/Database"
)

type Follow_Request struct {
	followerId int
	followedId int
}

type Following struct {
	Id int
	FirstName string
	LastName  string
	Avatar    string
}

type Followers struct {
	Id int
	FirstName string
	LastName  string
	Avatar    string
}

type FollowersParams struct {
	UserID  int
	Page    int
	PerPage uint8
}

var (
	FollowerStatus        = [2]string{"pending", "accept"}
	Follower_Pending int8 = 0 // Index Of pending in FollowerStatus Array
	Follower_Accept  int8 = 1 // Index Of Accept in FollowerStatus Array
)

var (
	ErrAlreadyFollowed        = errors.New("you have already followed this user")
	ErrUnfollowed             = errors.New("you must follow the user before you can unfollow them")
	ErrCantFindRelationId     = errors.New("follow relationship not found")
	ErrUserAlreadyFollowedYou = errors.New("you have already accepted this user’s follow request")
)

// Define a new user struct to manage follow, unfollow, and other user-related functions.
// Accept a followerID and followedID, and return a pointer to the follow_request struct.
func NewFollowRequest(FollowerId, FollowedId int) *Follow_Request {
	return &Follow_Request{
		followerId: FollowerId,
		followedId: FollowedId,
	}
}

// Check if the user is already following you.
// Verify if the user's account is private and if a follow request needs to be sent.
// Return the status code and any relevant error code.
func (req *Follow_Request) Follow() (int, error) {
	// Check If The user Already Followed The target User
	Id, err := IsFollowed(req.followerId, req.followedId)

	if err == ErrFollowYourself || err == ErrUserNotExist {
		return http.StatusBadRequest, err
	}

	if err != nil && err != ErrCantFindRelationId {
		return http.StatusInternalServerError, err
	}

	Public, err := IsPublic(req.followedId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	// If Id != -1, it means this user has already followed the target user.
	if Id != -1 {
		return http.StatusBadRequest, ErrAlreadyFollowed
	}

	// If the account is public, set the follow status to "accepted". Otherwise, set it to "pending".
	if Public {
		Query := "INSERT INTO followers (follower_id, followed_id , status) VALUES (?, ?, ?)"
		_, err = database.ExecQuery(Query, req.followerId, req.followedId, FollowerStatus[Follower_Accept])
		if err != nil {
			return http.StatusInternalServerError, err
		}
		return http.StatusOK, nil
	}

	// For a private profile, insert the follow request with the default status (pending).
	// The follow status is set to pending by default, so we don't need to specify it explicitly.
	Query := "INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)"
	_, err = database.ExecQuery(Query, req.followerId, req.followedId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// Unfollow the user by checking if they are already following you, and remove them from the database.
// Return the status code and any relevant error code.
func (req *Follow_Request) Unfollow() (int, error) {
	// Check if the user is following the target user.
	Id, err := IsFollowed(req.followerId, req.followedId)

	if err == ErrFollowYourself || err == ErrUserNotExist || err == ErrCantFindRelationId {
		return http.StatusBadRequest, err
	}

	if err != nil {
		return http.StatusInternalServerError, err
	}

	Query := "DELETE FROM followers WHERE id = ?"
	_, err = database.ExecQuery(Query, Id)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// Check if there is a relationship between the user and the follower.
// Return the status, status code, and any error encountered.
func (req *Follow_Request) CheckFollowStatus() (string, int, error) {
	_, err := IsFollowed(req.followedId, req.followerId)

	if err == ErrFollowYourself || err == ErrUserNotExist || err == ErrCantFindRelationId {
		return "", http.StatusBadRequest, err
	}
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	Query := "SELECT status FROM followers WHERE follower_id = ? AND followed_id = ?"
	Row, err := database.SelectOneRow(Query, req.followedId, req.followerId)
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	var Status string

	if err := Row.Scan(&Status); err != nil {
		return "", http.StatusInternalServerError, err
	}

	return Status, http.StatusOK, nil
}

// Accept the follow request and return the status code, along with any errors encountered.
func (req *Follow_Request) AccepteRequest() (int, error) {
	_, err := IsFollowed(req.followedId, req.followerId)
	if err == ErrFollowYourself || err == ErrUserNotExist || err == ErrCantFindRelationId {
		return http.StatusBadRequest, err
	}
	if err != nil {
		return http.StatusInternalServerError, err
	}

	Status, StatusCode, err := req.CheckFollowStatus()
	if err != nil {
		return StatusCode, err
	}

	if Status != FollowerStatus[Follower_Pending] {
		return http.StatusBadRequest, ErrUserAlreadyFollowedYou
	}

	Query := `
	UPDATE followers
	SET status = ?
	WHERE follower_id = ?
	AND followed_id = ?`

	if _, err := database.ExecQuery(Query, FollowerStatus[Follower_Accept], req.followedId, req.followerId); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// Reject the follow request and Remove them From the database
// return the status code, along with any errors encountered.
func (req *Follow_Request) RejectRequest() (int, error) {
	Id, err := IsFollowed(req.followedId, req.followerId)

	if err == ErrFollowYourself || err == ErrUserNotExist || err == ErrCantFindRelationId {
		return http.StatusBadRequest, err
	}

	if err != nil {
		return http.StatusInternalServerError, err
	}

	// Reverse the followerID and followedID to check the follow status and determine if the user has followed you.
	NewRequest := &Follow_Request{req.followedId, req.followerId}
	Status, StatusCode, err := NewRequest.CheckFollowStatus()
	if err != nil {
		return StatusCode, err
	}

	if Status != FollowerStatus[Follower_Pending] {
		return http.StatusBadRequest, ErrAlreadyFollowed
	}

	Query := `DELETE FROM followers WHERE id = ?`

	if _, err := database.ExecQuery(Query, Id); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (Params *FollowersParams) GetFollowing() ([]Following, error) {
	if Params.Page < 1 {
		Params.Page = 1
	}

	offset := (Params.Page - 1) * int(Params.PerPage)
	query := `
	SELECT u.id, u.first_name, u.last_name, u.avatar
	FROM users u
	JOIN followers f ON u.id = f.followed_id
	WHERE f.follower_id = ? AND f.status = 'accept'
	LIMIT ? OFFSET ?;
	`

	rows, err := database.SelectQuery(query, Params.UserID, Params.PerPage, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch following: %w", err)
	}
	defer rows.Close()

	var followings []Following

	for rows.Next() {
		var following Following
		if err := rows.Scan(&following.Id, &following.FirstName, &following.LastName, &following.Avatar); err != nil {
			return nil, fmt.Errorf("failed to scan following user: %w", err)
		}
		followings = append(followings, following)
	}

	return followings, nil
}

func (Params *FollowersParams) GetFollowers() ([]Followers, error) {
	if Params.Page < 1 {
		Params.Page = 1
	}

	offset := (Params.Page - 1) * int(Params.PerPage)
	query := `
	SELECT u.id, u.first_name, u.last_name, u.avatar
	FROM users u
	JOIN followers f ON u.id = f.follower_id
	WHERE f.followed_id = ? AND f.status = 'accept'
	LIMIT ? OFFSET ?;
	`

	rows, err := database.SelectQuery(query, Params.UserID, Params.PerPage, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch followers: %w", err)
	}
	defer rows.Close()

	var followers []Followers
	for rows.Next() {
		var follower Followers
		if err := rows.Scan(&follower.Id, &follower.FirstName, &follower.LastName, &follower.Avatar); err != nil {
			return nil, fmt.Errorf("failed to scan follower user: %w", err)
		}
		followers = append(followers, follower)
	}

	return followers, nil
}
