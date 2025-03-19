package posts

import (
	"fmt"
	database "socialNetwork/Database"
	groups "socialNetwork/App/Groups"
	profiles "socialNetwork/App/Profiles"
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
func isAuthorized(post_id, user_id, group_id int) (bool, error) {
    post_owner_id, err := post_owner(post_id)
    if err != nil {
        return false, err
    }
    
    if group_id != 0 {
        isMember := groups.IsMember(group_id, user_id)
        if !isMember {
            return false, fmt.Errorf("not member")
        }
        if isMember {
            return true, nil
        }
    }
    
    if user_id == post_owner_id {
        return true, nil
    }
    
	isPublic, err := profiles.IsPublic(post_owner_id)
	if err != nil {
		return false, err
	}

    isFollow, err := profiles.IsFollowed(user_id, post_owner_id)
    if err != nil && err != profiles.ErrCantFindRelationId{
        return false, err
    }
    
    
    return isFollow != -1 || isPublic, nil
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
