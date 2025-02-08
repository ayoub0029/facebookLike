package posts

import (
	"database/sql"
	"fmt"
	"socialNetwork/database"
)

type Like struct {
	ID        int `json:"id"`
	ItemID    int `json:"item_id"` // post_id or comment_id
	LikeValue int `json:"like"`
}

// status like 1 add like 0 for remove like
func LikePost(postID int, userID int, statuslike int) error {
	if statuslike < 0 || statuslike > 1 {
		return fmt.Errorf("unsupported statuslike")
	}
	var like int
	// get the like of the user on the post
	row, err := database.SelectOneRow("SELECT like FROM post_reactions WHERE post_id = ? AND user_id = ?", postID, userID)
	if err != nil {
		return err
	}
	errlike := row.Scan(&like)

	// this condition will be passed only if i have status like 1 and no rows or if i have status like 0 and row (3amer)
	if (errlike == sql.ErrNoRows && statuslike == 0) || (errlike != nil && errlike != sql.ErrNoRows) {
		return errlike
	}

	if statuslike == 1 {
		_, err = database.ExecQuery("INSERT INTO like (post_id, user_id, like) VALUES (?, ?, ?)", postID, userID, statuslike)
		if err != nil {
			return err
		}
	} else if statuslike == 0 {
		_, err = database.ExecQuery("DELETE FROM like WHERE user_id = ? AND post_id = ?", userID, postID)
		if err != nil {
			return err
		}
	}
	return err
}
