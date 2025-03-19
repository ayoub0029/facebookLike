package posts

import (
	"database/sql"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"

	global "socialNetwork/App/Global"
	database "socialNetwork/Database"

	"github.com/gofrs/uuid"
)

// recive image as img multipart.File an return the path to it
func image_handler(w http.ResponseWriter, img multipart.File) (string, error) {
	imgBytes := make([]byte, 512)
	_, err := img.Read(imgBytes)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Error reading img")
		return "", err
	}

	imgType := http.DetectContentType(imgBytes)

	if imgType != "image/jpeg" && imgType != "image/gif" && imgType != "image/png" {
		global.JsonResponse(w, http.StatusUnsupportedMediaType, "Type not supported only : (jpeg, gif, png)")
		return "", errors.New("type not supported only : (jpeg, gif, png)")
	}

	// Standard packages have limited image format support only (gif/jpg/png)
	img.Seek(0, 0)

	config, _, errConf := image.DecodeConfig(img)
	if errConf != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error decoding image")
		return "", err
	}

	width := config.Width
	height := config.Height

	if width < 200 || height < 200 || width*5 < height || height*10 < width {
		global.JsonResponse(w, http.StatusConflict, "Image dimensions must be at least 200px by 200px or max WIDTH[5:1] or HEIGHT[1:10]")
		return "", err
	}

	uuid, err := uuid.NewV4()

	imgName := fmt.Sprintf("%s.%s", uuid, strings.Split(imgType, "/")[1]) // example uuid.jpg
	imagePath := "./App/Assets/" + imgName
	dest, errCreate := os.Create(imagePath)
	if errCreate != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return "", err
	}
	defer dest.Close()

	img.Seek(0, 0)

	_, err = io.Copy(dest, img)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error copying img")
		return "", err
	}

	defer img.Close()
	return imgName, nil
}

// add post to database with the provided params
func InsertPost(userID string, content string, image string, groupID *int, privacy string) (int, error) {
	var groupIDValue interface{}
	if groupID == nil {
		groupIDValue = nil
	} else {
		groupIDValue = *groupID
	}

	row, err := database.ExecQuery("INSERT INTO posts (user_id, content, media, group_id, privacy) VALUES (?, ?, ?, ?, ?)", userID, content, image, groupIDValue, privacy)
	if err != nil {
		return -1, err
	}

	lastID, err := row.LastInsertId()
	if err != nil {
		return -1, err
	}

	return int(lastID), nil
}

// get group id from post id
func getGroupOfpost(postID int) (int, error) {
	query := `SELECT group_id FROM posts WHERE id = ?`
	var groupID sql.NullInt32
	row, err := database.SelectOneRow(query, postID)
	if err != nil {
		return -1, err
	}
	err = row.Scan(&groupID)
	if err != nil {
		return -1, err
	}
	if groupID.Valid {
		gID := int(groupID.Int32)
		return gID, nil
	}
	return 0, nil
}

// get group id from  group name
func getGroupid(userID int, groupName any) (int, error) {
	query := `
	SELECT
	id
	FROM
	groups
	WHERE
	name = $1
	`
	groups, err := database.SelectQuery(query, groupName)
	if err != nil {
		return 0, err
	}
	groupID := 0
	groups.Scan(&groupID)
	_, err = database.SelectQuery(`SELECT * FROM group_members WHERE user_id = $1
		AND group_id = $2`, userID, groupID)
	if err != nil {
		return 0, err
	}
	return groupID, nil
}

// add the allowed users to the see the private post
func private_post(postID int, allowedUsers []string) error {
	for _, user := range allowedUsers {
		userInt, err := strconv.Atoi(user)
		if userInt <= 0 {
			return err
		}
		_, err = database.ExecQuery("INSERT INTO post_visibility (post_id, user_id) VALUES (?, ?)", postID, userInt)
		if err != nil {
			return err
		}
	}
	return nil
}
