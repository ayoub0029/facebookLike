package middleware

import (
	"context"
	"net/http"

	auth "socialNetwork/Authentication"
	global "socialNetwork/Global"
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
const userContextKey contextKey = "userKey"

type User struct {
	Name string
	ID   uint64
}

// how to use
//
//	user, ok := r.Context().Value(userContextKey).(User)
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		// CORS headers
		res.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		res.Header().Set("Access-Control-Allow-Credentials", "true")
		res.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		res.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		id, err := auth.IsLoggedIn(req, "token")
		if err != nil {
			logger.Error("[%v]", err)
			global.JsonResponse(res, http.StatusInternalServerError, "server side error")
			return
		}
		if id == 0 {
			if auth.CheckIsNotNeedLogin(req.URL.Path) {
				next.ServeHTTP(res, req)
				return
			}
			global.JsonResponse(res, http.StatusUnauthorized, "you need to login")
			return
		}

		user := User{Name: "", ID: uint64(id)}
		ctx := context.WithValue(req.Context(), userContextKey, user)
		req = req.WithContext(ctx)
		next.ServeHTTP(res, req)
	})
}
