package posts

import (
	"fmt"
	"socialNetwork/database"
)

// get the post id and return the id of post creator
func post_owner(postID int) (int, error) {
	row, err := database.SelectQuery(`SELECT user_id FROM post WHERE post.id = ?`, postID)

	if err != nil {
		return 0, err
	}
	var owner int

	if err := row.Scan(&owner); err != nil {
		return 0, err
	}
	return owner, err
}

// check if the user have public account
func isPublic(user_id int) bool {
	return true
}

// check if the usesr member of the group
func isMember(user_id int, group_id int) (bool,error) {
	return true,nil
}

// check if A if follow user B
func isFollowed(A, B int) bool {
	return true
}

// it's check if user A is can see and interact with user B posts
func isAuthorized(post_id, user_id int) (bool, error) {
	post_owner_id, err := post_owner(post_id)
	if err != nil {
		return false, err
	}
	if isPublic(post_owner_id) || isFollowed(user_id, post_owner_id) {
		return true, nil
	}
	return false, nil
}

// this func check if the user if he is the owner of the item (comment of post)
func is_user_authorized(user_id int, item_id int, item_type string) (bool, error) {

	var tableName string
	if item_type == "comment" {
		tableName = "comment"
	} else if item_type == "post" {
		tableName = "post"
	}

	cmd := fmt.Sprintf(`SELECT user.id FROM %v WHERE  %v.id = ? `, tableName, tableName)

	row_creator_id, err := database.SelectOneRow(cmd, item_id)
	if err != nil {
		return false, err
	}
	var creator_id int
	err = row_creator_id.Scan(&creator_id)
	if err != nil {
		return false, err
	}
	return creator_id == user_id, nil
}
