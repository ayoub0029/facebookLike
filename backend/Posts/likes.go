package posts

import (
	"database/sql"
	"fmt"
	database "socialNetwork/Database"
)

// status like 1 add like 0 for remove like
func LikePost(postID int, userID int, statuslike int) error {
	if statuslike < 0 || statuslike > 1 {
		return fmt.Errorf("unsupported statuslike")
	}
	var like int
	// get the like of the user on the post
	row, err := database.SelectOneRow("SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?", postID, userID)
	if err != nil {
		return err
	}
	errlike := row.Scan(&like)
	
	// this condition will be passed only if i have status like 1 and no rows or if i have status like 0 and row (3amer)
	if (errlike == sql.ErrNoRows && statuslike == 0) || (errlike != nil && errlike != sql.ErrNoRows) {
		return errlike
	}
	
	if statuslike == 1 {
		_, err = database.ExecQuery("INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)", postID, userID, statuslike)
		if err != nil {
			fmt.Println(err)
			return err
		}
	} else if statuslike == 0 {
		_, err = database.ExecQuery("DELETE FROM post_reactions WHERE user_id = ? AND post_id = ?", userID, postID)
		if err != nil {
			return err
		}
	}
	return err
}

// check if the user like the post or not
func CheckLikePost(postID int, userID int) (int, error) {
	var like sql.NullInt32
	row, err := database.SelectOneRow("SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?", postID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, err
	}
	errlike := row.Scan(&like)
	if errlike != nil {
		if errlike == sql.ErrNoRows {
			return 0, nil
		}
		return 0, errlike
	}
	if like.Valid {
		return 1, nil
	}
	return 0, nil
}
