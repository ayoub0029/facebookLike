package search

import (
	"database/sql"
	"net/http"

	global "socialNetwork/Global"
)

// GET /search/Groups
func Routes(mux *http.ServeMux) {
	// mux.HandleFunc("GET /search/Groups", SearchGroups)
	mux.HandleFunc("GET /search/users", SearchUsers)
}

func SearchUsers(res http.ResponseWriter, req *http.Request) {
	target := req.FormValue("target")
	lastId := req.FormValue("lastId")

	if target == "" {
		global.JsonResponse(res, http.StatusBadRequest, "argemont is nul")
		return
	}

	data, err := searchUsersInDb(target, lastId)
	if err != nil {
		if err == sql.ErrNoRows {
			global.JsonResponse(res, http.StatusMethodNotAllowed, "not found any data")
		} else {
			global.JsonResponse(res, http.StatusInternalServerError, "server side error")
		}
		return
	}
	global.JsonResponse(res, http.StatusOK, data)
}

func SearchGroups(res http.ResponseWriter, req *http.Request) {
	target := req.FormValue("target")
	lastId := req.FormValue("lastId")

	if target == "" {
		global.JsonResponse(res, http.StatusBadRequest, "argemont is nul")
		return
	}

	data, err := SearchGroupsInDb(target, lastId)
	if err != nil {
		if err == sql.ErrNoRows {
			global.ErrorLog.Println(err)
			global.JsonResponse(

			)
			return
		}
	}
}
