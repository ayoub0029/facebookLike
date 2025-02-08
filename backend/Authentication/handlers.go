package auth

import (
	"errors"
	"html"
	"net/http"
	global "socialNetwork/Global"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func signUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.JsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	ParseFormSize(w, r)

	newUser := User{
		Email:     r.FormValue("email"),
		Password:  r.FormValue("password"),
		FirstName: html.EscapeString(r.FormValue("firstName")),
		LastName:  html.EscapeString(r.FormValue("lastName")),
		DateOB:    html.EscapeString(r.FormValue("dob")),
		Avatar:    "",
		Nickname:  html.EscapeString(r.FormValue("nickname")),
		AboutMe:   html.EscapeString(r.FormValue("aboutMe")),
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

	resultPath := UploadImage("avatar", w, r)
	// return nil pointer if fail upload otherwise return path
	if resultPath == nil {
		return
	}
	newUser.Avatar = *resultPath

	if err := InsertUser(newUser, w); err != nil {
		return
	}

	global.JsonResponse(w, http.StatusOK, "")
}

func logIn(w http.ResponseWriter, r *http.Request) {
}

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

func status(w http.ResponseWriter, r *http.Request) {
	userID, errLogin := IsLoggedIn(r, "token")

	if errLogin != nil {
		global.JsonResponse(w, http.StatusUnauthorized, "Authentication failed")
		return
	}

	if userID == 0 {
		global.JsonResponse(w, http.StatusOK, nil)
		return
	}

	global.JsonResponse(w, http.StatusOK, userID)
}

func callBack(w http.ResponseWriter, r *http.Request) {
}

func githubCallBack(w http.ResponseWriter, r *http.Request) {
}
