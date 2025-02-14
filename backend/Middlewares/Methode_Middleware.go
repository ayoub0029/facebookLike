package middleware

import (
	"net/http"
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
