package notifications

import (
	"database/sql"
	"net/http"
	"strconv"

	global "socialNetwork/Global"
)

var logger = global.NewLogger()

func Routes(mux *http.ServeMux) {
	mux.HandleFunc("GET /notifications", getNotifications)
	mux.HandleFunc("POST /notifications/seen", SeenNotifications)
}
// get 
func getNotifications(res http.ResponseWriter, req *http.Request) {
	user := req.FormValue("user_id")
	lastNotif := req.FormValue("last_notif_id")

	if user == "" {
		global.JsonResponse(res, http.StatusBadRequest, "data nul")
		return
	}

	data, err := selectNotifications(user, lastNotif)
	if err != nil {
		if err == sql.ErrNoRows {
			global.JsonResponse(res, http.StatusNotFound, "")
		} else {
			logger.Error("%s", err)
			global.JsonResponse(res, http.StatusInternalServerError, "server side error")
		}
		return
	}

	global.JsonResponse(res, http.StatusOK, data)
}

func SeenNotifications(res http.ResponseWriter, req *http.Request) {
	ids := req.FormValue("id")

	id, err := strconv.Atoi(ids)
	if err != nil {
		global.JsonResponse(res, http.StatusBadRequest, "id must be int")
		return
	}
	err = MarkSenn(id)
	if(err != nil){
		global.JsonResponse(res, http.StatusInternalServerError, "server side error")
		return
	}
	global.JsonResponse(res, http.StatusOK, "make sen succeeded")
}
