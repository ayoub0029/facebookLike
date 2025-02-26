package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	database "socialNetwork/Database"
	global "socialNetwork/Global"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

// ----------------------------------------------------------------------------------
// -------------------------------signup---------------------------------------------

// ValidateUser checks if the provided user details meet the required constraints.
// It takes a User struct and validates fields like name, password, email, and date of birth.
// Returns an error if validation fails, otherwise nil.
func ValidateUser(u User) error {
	if u.FirstName == "" || u.LastName == "" || u.Password == "" || u.Email == "" || u.DateOB == "" {
		return fmt.Errorf("all* fields are required")
	}

	if len(u.Password) < 5 || len(u.Password) > 35 {
		return fmt.Errorf("password must be between 5 and 35 characters")
	}

	if len(u.FirstName) < 2 || len(u.FirstName) > 20 || len(u.LastName) < 2 || len(u.LastName) > 20 {
		return fmt.Errorf("first and last name must be between 2 and 20 characters")
	}

	if err := IsValidDate(u.DateOB, "2006-01-02"); err != nil {
		return err
	}

	if u.Nickname != "" && (len(u.Nickname) < 3 || len(u.Nickname) > 20) {
		return fmt.Errorf("nickname must be 3 to 20 characters")
	}

	if u.AboutMe != "" && len(u.AboutMe) > 200 {
		return fmt.Errorf("about me must be under 200 characters")
	}

	validEmail, err := regexp.MatchString(`^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,40}$`, u.Email)
	if err != nil {
		return fmt.Errorf("error validating email")
	}
	if !validEmail {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

// IsValidDate checks if the given date string is between 1 and 100 years from today.
func IsValidDate(date string, layout string) error {
	inputDate, err := time.Parse(layout, date)
	if err != nil {
		return fmt.Errorf("invalid date format")
	}

	today := time.Now()

	minDate := today.AddDate(-100, 0, 0)
	maxDate := today.AddDate(-1, 0, 0)

	if inputDate.After(minDate) && inputDate.Before(maxDate) {
		return nil
	}

	return fmt.Errorf("date must be between 1 and 100 years ago")
}

// ParseFormSize parses a multipart form with a 10MB size limit.
func ParseFormSize(w http.ResponseWriter, r *http.Request) error {
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		if strings.Contains(err.Error(), "request body too large") {
			global.JsonResponse(w, http.StatusRequestEntityTooLarge, "File size exceeds limit (10MB)")
		} else {
			global.JsonResponse(w, http.StatusBadRequest, "Failed to parse form")
		}
		return fmt.Errorf("")
	}
	return nil
}

// UploadImage processes an optional file upload, validates image types (JPEG, PNG, GIF), and stores the file.
// It accepts a form field name (string), an http.ResponseWriter, and an *http.Request.
// Returns a pointer to the file's database path or an empty string if no file is uploaded.
// Ensures the image meets minimum size requirements (200x200) and adheres to aspect ratio constraints (1:5 to 10:1).
// Uses a UUID for unique filenames and saves the file in `./website/img/`.
func UploadImage(formFieldName string, w http.ResponseWriter, r *http.Request) *string {
	file, _, err := r.FormFile(formFieldName)
	imgName := ""

	if err == http.ErrMissingFile {
		return &imgName
	}

	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Failed to upload file")
		return nil
	}
	defer file.Close()

	readSeeker, ok := file.(io.ReadSeeker)
	if !ok {
		global.JsonResponse(w, http.StatusInternalServerError, "Error handling file input")
		return nil
	}

	imgBytes := make([]byte, 512)
	_, err = readSeeker.Read(imgBytes)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Error reading image")
		return nil
	}

	imgType := http.DetectContentType(imgBytes)
	allowedTypes := map[string]bool{
		"image/jpeg": true, "image/png": true, "image/gif": true,
	}

	if !allowedTypes[imgType] {
		global.JsonResponse(w, http.StatusUnsupportedMediaType, "Supported types: jpeg, gif, png")
		return nil
	}

	_, err = readSeeker.Seek(0, 0)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error resetting file position")
		return nil
	}

	img, _, err := image.DecodeConfig(readSeeker)
	if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid image file")
		return nil
	}

	width, height := img.Width, img.Height

	if width < 200 || height < 200 {
		global.JsonResponse(w, http.StatusBadRequest, "Image must be at least 200x200 pixels")
		return nil
	}

	if width > height*10 || height > width*5 {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid aspect ratio (width must be at most 10x height, height must be at most 5x width)")
		return nil
	}

	uuidStr, err := uuid.NewV4()
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error generating UUID")
		return nil
	}

	imgExt := strings.Split(imgType, "/")[1]
	imgName = fmt.Sprintf("%s.%s", uuidStr, imgExt)
	imagePath := "./Assets/" + imgName

	dest, err := os.Create(imagePath)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Failed to create file")
		return nil
	}
	defer dest.Close()

	_, err = readSeeker.Seek(0, 0)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error resetting file position")
		return nil
	}

	_, err = io.Copy(dest, readSeeker)
	if err != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "Error saving file")
		return nil
	}

	return &imgName
}

// simple insert new user with check if email already exists.
func InsertUser(u User, w http.ResponseWriter) error {
	Query := `
	INSERT INTO
    users (
        first_name,
        last_name,
        email,
        password,
        date_of_birth,
        avatar,
        nickname,
        about_me,
		github_id
    )
	VALUES
		(?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := database.ExecQuery(Query,
		u.FirstName,
		u.LastName,
		u.Email,
		u.Password,
		u.DateOB,
		u.Avatar,
		u.Nickname,
		u.AboutMe,
		u.GithubID)
	if err != nil {
		if err.Error() == "EXEC ERROR: UNIQUE constraint failed: users.email" {
			global.JsonResponse(w, http.StatusConflict, "Email already exists.")
		} else {
			global.JsonResponse(w, http.StatusInternalServerError, err.Error())
		}
		return err
	}
	return nil
}

// ----------------------------------------------------------------------------------
// -------------------------------Reset / Update UUID -------------------------------

func ResetUuidToNull(uuid string) error {
	_, err := database.ExecQuery("UPDATE users SET uuid = NULL WHERE uuid = ?", uuid)
	return err
}

func UpdateUuidExp(uuid, emailOrGithubID string, exp time.Time) error {
	_, err := database.ExecQuery("UPDATE users SET uuid = $1,exp = $2 WHERE email = $3 OR github_id = $3",
		uuid, exp, emailOrGithubID)
	return err
}

// ----------------------------------------------------------------------------------
// -------------------------------is logged in---------------------------------------

// IsLoggedIn checks if a user is authenticated based on a session cookie.
// It takes an HTTP request and the session cookie name as input.
// Returns the user ID if logged in, or 0 if not authenticated.
// Returns an error if a database or parsing issue occurs.
func IsLoggedIn(req *http.Request, sessionName string) (int, error) {
	cookie, err := req.Cookie(sessionName)
	if errors.Is(err, http.ErrNoCookie) {
		return 0, nil
	} else if err != nil {
		return 0, err
	}
	var userID int
	var exp string
	row, errQuery := database.SelectOneRow("SELECT id, exp FROM users WHERE uuid = ?", cookie.Value)
	if errQuery != nil {
		return 0, errQuery
	}

	if err := row.Scan(&userID, &exp); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}

	// expiration time
	parsedTime, err := time.Parse("2006-01-02T15:04:05.999999999Z", exp)
	if err != nil || parsedTime.Before(time.Now()) {
		ResetUuidToNull(cookie.Value)
		return 0, nil
	}

	return userID, nil
}

// ----------------------------------------------------------------------------------
// -------------------------------check login is correct---------------------------------------

// LoginCheck verifies if the given email and password match a record in the database.
//
// Parameters:
// - l (Login): A struct containing the user's email and password.
//
// Returns:
// - int: HTTP status code (e.g., 200 for success, 401 for unauthorized, 500 for server errors).
// - error: Nil if authentication is successful; otherwise, an error indicating the issue.
func LoginCheck(l Login) (int, error) {
	row, err := database.SelectOneRow("SELECT password FROM users WHERE email = ?", l.Email)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("database error: %v", err)
	}

	var hashPass string
	if err := row.Scan(&hashPass); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return http.StatusUnauthorized, fmt.Errorf("user does not exist")
		}
		return http.StatusInternalServerError, fmt.Errorf("failed to retrieve password: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashPass), []byte(l.Password)); err != nil {
		return http.StatusUnauthorized, fmt.Errorf("incorrect password")
	}

	return http.StatusOK, nil
}

// AddUuidAndCookie generates a UUID, updates it in the database with an expiration, and sets a secure HTTP-only cookie.
// Returns 200 OK on success or 500 Internal Server Error if UUID generation or database update fails.
// Ensures security with HttpOnly, Secure, and SameSiteStrictMode to prevent CSRF.
func AddUuidAndCookie(emailOrGithubID string, w http.ResponseWriter) (int, error) {
	uuid, err := uuid.NewV4()
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to update UUID in database: %v", err)
	}

	exp := time.Now().Add(72 * time.Hour)

	if err := UpdateUuidExp(uuid.String(), emailOrGithubID, exp); err != nil {
		return http.StatusInternalServerError, err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    uuid.String(),
		Expires:  exp,
		HttpOnly: true,
		Path:     "/",
		Secure:   true,
		SameSite: http.SameSiteDefaultMode, // CSRF
	})

	return http.StatusOK, nil
}

// ----------------------------------------------------------------------------------
// -------------------------------OAuth Github---------------------------------------

func getGitHubAccessToken(code string) (string, error) {
	data := url.Values{
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"code":          {code},
	}

	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	req.URL.RawQuery = data.Encode()

	resp, err := (&http.Client{Timeout: 10 * time.Second}).Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var tokenResponse map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", err
	}

	if accessToken, ok := tokenResponse["access_token"].(string); ok {
		return accessToken, nil
	}
	return "", fmt.Errorf("invalid access token response")
}

func fetchGitHubUserInfo(accessToken string) (GitHubUserInfo, error) {
	var gitInfo GitHubUserInfo
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return gitInfo, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return gitInfo, err
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&gitInfo); err != nil {
		return gitInfo, err
	}

	return gitInfo, nil
}

func FindUserByOAuthID(oauthID string) (bool, error) {
	var userID string
	row, err := database.SelectOneRow(`SELECT id FROM users WHERE github_id = ?`, oauthID)
	if err != nil {
		return false, nil
	}

	err = row.Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func CheckIsNotNeedLogin(path string) bool {
	alowd := map[string]bool{
		"/auth/signup":          true,
		"/auth/login":           true,
		"/auth/githublogin":     true,
		"/auth/github/callback": true,
	}
	return alowd[path]
}
