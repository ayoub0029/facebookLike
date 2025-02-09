package posts

import (
	"encoding/json"
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
	"socialNetwork/database"
	"strings"
	"time"

	"github.com/gofrs/uuid"
)

func jsonResponse(w http.ResponseWriter, status int, message any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(message)
	if err != nil {
		fmt.Println("ERROR ENCODE DATA : ", err)
		return
	}
}
// recive image as img multipart.File an return the path to it
func image_handler(w http.ResponseWriter, img multipart.File) (string, error) {
	imgBytes := make([]byte, 512)
	_, err := img.Read(imgBytes)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "Error reading img")
		return "", err
	}

	imgType := http.DetectContentType(imgBytes)

	if imgType != "image/jpeg" && imgType != "image/gif" && imgType != "image/png" {
		jsonResponse(w, http.StatusConflict, "Type not supported only : (jpeg, gif, png)")
		return "", err
	}

	// Standard packages have limited image format support only (gif/jpg/png)
	img.Seek(0, 0)

	config, _, errConf := image.DecodeConfig(img)
	if errConf != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error decoding image")
		return "", err
	}

	width := config.Width
	height := config.Height

	if width < 200 || height < 200 || width*5 < height || height*10 < width {
		jsonResponse(w, http.StatusConflict, "Image dimensions must be at least 200px by 200px or max WIDTH[5:1] or HEIGHT[1:10]")
		return "", err
	}

	uuid, err := uuid.NewV4()

	imgName := fmt.Sprintf("%s.%s", uuid, strings.Split(imgType, "/")[1]) // example uuid.jpg
	imagePath := "./website/img/" + imgName

	dest, errCreate := os.Create(imagePath)
	if errCreate != nil {
		jsonResponse(w, http.StatusInternalServerError, "Something wrong")
		return "", err
	}

	defer dest.Close()

	img.Seek(0, 0)

	_, err = io.Copy(dest, img)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error copying img")
		return "", err
	}

	defer img.Close()
	return imgName, nil
}

// add post to database with the provided params
func InsertPost(userID string, content string, image string, createdAt time.Time, groupID int) error {
	content = html.EscapeString(content)

	_, err := database.ExecQuery("INSERT INTO post (user_id, content, media, created_at, group_id) VALUES (?, ?, ? ,?, ?, ?)", userID, content, image, time.Now(), groupID)
	if err != nil {
		return err
	}

	return nil
}

func get_userID(r *http.Request) (int, error) {
	uuid,err  := r.Cookie("token")
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