package middleware

import (
	"context"
	"net/http"

	auth "socialNetwork/App/Authentication"
	global "socialNetwork/App/Global"
)

func Methode_Middleware(next http.HandlerFunc, method string) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			global.JsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"Error": global.ErrMethod.Error()})
			return
		}
		next.ServeHTTP(w, r)
	})
}

var logger = global.NewLogger()

type contextKey string

const UserContextKey contextKey = "userKey"

type User struct {
	Name string
	ID   uint64
}

// how to use
//
//	user, ok := r.Context().Value(userContextKey).(User)
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Allow frontend
		res.Header().Set("Access-Control-Allow-Credentials", "true")             // Allow cookies
		res.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		res.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if req.Method == "OPTIONS" {
			res.WriteHeader(http.StatusNoContent)
			return
		}

		id, fullName, err := auth.IsLoggedIn(req, "token")
		if err != nil {
			logger.Error("Message: %v", err)
			global.JsonResponse(res, http.StatusInternalServerError, "server side error")
			next.ServeHTTP(res, req)
			return
		}
		if id == 0 {
			if auth.CheckIsNotNeedLogin(req.URL.Path) {
				next.ServeHTTP(res, req)
				return
			}
			global.JsonResponse(res, http.StatusUnauthorized, "you need to login")
			return
		} else if auth.CheckIsNotNeedLogin(req.URL.Path) {
			global.JsonResponse(res, http.StatusBadRequest, "you already logged in")
			return
		}

		user := User{Name: fullName, ID: uint64(id)}
		ctx := context.WithValue(req.Context(), UserContextKey, user)
		req = req.WithContext(ctx)
		next.ServeHTTP(res, req)
	})
}
