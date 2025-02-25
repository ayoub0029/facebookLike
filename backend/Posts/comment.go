package posts

import (
	"fmt"
	database "socialNetwork/Database"
	profiles "socialNetwork/Profiles"
)

// get the post id and return the id of post creator
func post_owner(postID int) (int, error) {
	row, err := database.SelectOneRow(`SELECT user_id FROM posts WHERE id = ?`, postID)

	if err != nil {
		return 0, err
	}
	var owner int

	if err := row.Scan(&owner); err != nil {
		return 0, err
	}
	return owner, err
}

// it's check if user A is can see and interact with user B posts
func isAuthorized(post_id, user_id int) (bool, error) {
	post_owner_id, err := post_owner(post_id)
	if err != nil {
		return false, err
	}
	isFollow := 0
	isPublic := true
	var err2 error
	if user_id != post_owner_id{

		isFollow, err = profiles.IsFollowed(user_id, post_owner_id)
		isPublic, err2 = profiles.IsPublic(post_owner_id)
	}
	fmt.Println(err,err2)
	if err != nil || err2 != nil {
		return false, err
	}
	if isFollow != -1 || isPublic {
		return true, nil
	}
	return false, nil
}

// this func check if the user if he is the owner of the item (comment of post)
func is_user_authorized(user_id int, item_id int, item_type string) (bool, error) {

	var tableName string
	if item_type == "comments" {
		tableName = "comments"
	} else if item_type == "posts" {
		tableName = "posts"
	}

	cmd := fmt.Sprintf(`SELECT user_id FROM %s WHERE id = ?`, tableName)

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
