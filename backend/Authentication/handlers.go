package auth

import (
	"errors"
	"fmt"
	"html"
	"net/http"
	"net/url"
	global "socialNetwork/Global"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// signUp handles user registration by validating input, hashing passwords,
// storing user data, and handling avatar uploads.
func signUp(w http.ResponseWriter, r *http.Request) {
	if err := ParseFormSize(w, r); err != nil {
		return
	}

	githubID, _ := strconv.Atoi(r.FormValue("githubid"))
	var gitID *int
	if githubID == 0 {
		gitID = nil
	} else {
		gitID = &githubID
	}

	newUser := User{
		Email:     r.FormValue("email"),
		Password:  r.FormValue("password"), // in completing Oauth generate random pass
		FirstName: html.EscapeString(r.FormValue("firstName")),
		LastName:  html.EscapeString(r.FormValue("lastName")),
		Avatar:    r.FormValue("avatar"), // for completing Oauth
		DateOB:    html.EscapeString(r.FormValue("dateob")),
		Nickname:  html.EscapeString(r.FormValue("nickname")),
		AboutMe:   html.EscapeString(r.FormValue("aboutMe")),
		GithubID:  gitID, // for completing Oauth
	}

	if err := ValidateUser(newUser); err != nil {
		global.JsonResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	hashPass, errHash := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if errHash != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "failed to hash password")
		return
	}
	newUser.Password = string(hashPass)

	if newUser.Avatar == "" {
		resultPath := UploadImage("avatar", w, r)
		if resultPath == nil {
			return
		}
		newUser.Avatar = *resultPath
	}

	if err := InsertUser(newUser, w); err != nil {
		return
	}

	global.JsonResponse(w, http.StatusOK, "")
}

// logIn authenticates users by validating credentials,
// checking the database, and setting a session token.
func logIn(w http.ResponseWriter, r *http.Request) {
	login := Login{
		Email:    r.FormValue("email"),
		Password: r.FormValue("password"),
	}

	if len(login.Email) < 5 || len(login.Password) < 5 || len(login.Email) > 50 || len(login.Password) > 50 {
		global.JsonResponse(w, http.StatusBadRequest, "invalid email or password")
		return
	}

	if httpStatus, err := LoginCheck(login); err != nil {
		global.JsonResponse(w, httpStatus, err.Error())
		return
	}

	if httpStatus, err := AddUuidAndCookie(login.Email, w); err != nil {
		global.JsonResponse(w, httpStatus, err.Error())
		return
	}

	global.JsonResponse(w, http.StatusOK, "Login successful")
}

// logOut logs out the user by clearing session cookies
// and resetting the uuid token in the database.
func logOut(w http.ResponseWriter, r *http.Request) {
	uuidCookie, err := r.Cookie("token")
	if errors.Is(err, http.ErrNoCookie) {
		global.JsonResponse(w, http.StatusUnauthorized, "You must be logged in to log out")
		return
	} else if err != nil {
		global.JsonResponse(w, http.StatusBadRequest, "Invalid authentication token")
		return
	}

	if resetErr := ResetUuidToNull(uuidCookie.Value); resetErr != nil {
		global.JsonResponse(w, http.StatusInternalServerError, "An error occurred while logging out")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   "",
		Expires: time.Unix(0, 0),
		Path:    "/",
	})

	global.JsonResponse(w, http.StatusOK, "You have been logged out successfully")
}

// status checks if a user is logged in by verifying their session token
// and returns the user's ID or NULL or an authentication failure message.
func status(w http.ResponseWriter, r *http.Request) {
	userID, errLogin := IsLoggedIn(r, "token")

	if errLogin != nil && userID <= 0 {
		global.JsonResponse(w, http.StatusUnauthorized, "Authentication failed")
		return
	}

	global.JsonResponse(w, http.StatusOK, userID)
}

// GithubLogin redirects users to GitHub's OAuth login page
// to authenticate via their GitHub account.
func GithubLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")

	authURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s",
		clientID,
		redirectURI,
	)

	http.Redirect(w, r, authURL, http.StatusSeeOther)
}

// githubCallBack handles the OAuth callback from GitHub,
// retrieves user info, and completes or logs in the user.
func githubCallBack(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")

	if errWeb := r.URL.Query().Get("error"); errWeb == "access_denied" {
		http.Redirect(w, r, "/", http.StatusPermanentRedirect)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing authorization code", http.StatusBadRequest)
		return
	}

	accessToken, err := getGitHubAccessToken(code)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get access token: %v", err), http.StatusInternalServerError)
		return
	}

	userInfo, err := fetchGitHubUserInfo(accessToken)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch user info: %v", err), http.StatusInternalServerError)
		return
	}

	exist, err := FindUserByOAuthID(fmt.Sprintf("%d", userInfo.ID))
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to find user: %v", err), http.StatusInternalServerError)
		return
	}

	// first time github oauth signup redirect to complete registration
	if !exist {
		newUser := User{
			Email:     userInfo.Email,
			FirstName: userInfo.Name,
			Avatar:    userInfo.AvatarURL,
			Nickname:  userInfo.Login,
			AboutMe:   userInfo.Bio,
			GithubID:  &userInfo.ID,
		}

		fullName := strings.Fields(userInfo.Name)
		if len(fullName) > 1 {
			newUser.FirstName = fullName[0]
			newUser.LastName = strings.Join(fullName[1:], " ")
		}

		data := url.Values{
			"email":     {newUser.Email},
			"firstName": {newUser.FirstName},
			"lastName":  {newUser.LastName},
			"avatar":    {newUser.Avatar},
			"nickname":  {newUser.Nickname},
			"aboutMe":   {newUser.AboutMe},
			"githubid":  {fmt.Sprintf("%d", *newUser.GithubID)},
		}

		redirectURL := "/complete-registration?" + data.Encode()
		http.Redirect(w, r, redirectURL, http.StatusSeeOther)
		return
	}

	// login with oauth after register
	if httpStatus, err := AddUuidAndCookie(fmt.Sprintf("%d", userInfo.ID), w); err != nil {
		http.Error(w, fmt.Sprintf("Failed to add uuid and cookie: %v", err), httpStatus)
		return
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
