package posts

import (
	"database/sql"
	"fmt"
	"html"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	global "socialNetwork/Global"
	"socialNetwork/database"
	"strings"
	"time"

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
		global.JsonResponse(w, http.StatusConflict, "Type not supported only : (jpeg, gif, png)")
		return "", err
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
	imagePath := "./website/img/" + imgName

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
func InsertPost(userID string, content string, image string, groupID int, privacy string) error {
	content = html.EscapeString(content)

	_, err := database.ExecQuery("INSERT INTO post (user_id, content, media, created_at, group_id, pricacy) VALUES (?, ?, ? ,?, ?, ?)", userID, content, image, time.Now(), groupID, privacy)
	if err != nil {
		return err
	}

	return nil
}

// get user id from the token
func get_userID(r *http.Request) (int, error) {
	uuid, err := r.Cookie("token")
	if err != nil {
		return 0, err
	}
	query := "SELECT id FROM users WHERE uuid = ?"
	row, err := database.SelectQuery(query, uuid)
	if err != nil {
		return 0, err
	}
	var userID int
	row.Scan(&userID)
	return userID, nil

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
	return -1, nil
}
