package notifications

import (
	"database/sql"
	"net/http"
	global "socialNetwork/Global"
)

func Routes(mux *http.ServeMux){
	mux.HandleFunc("GET /notifications", getNotifications)
}

//
func getNotifications(res http.ResponseWriter, req *http.Request)  {
	user := req.FormValue("user_id")
	lastNotif := req.FormValue("last_notif_id")

	if(user == "" && lastNotif == ""){
		global.JsonResponse(res, http.StatusBadRequest, "data nul")
		return	
	}

	data, err := selectNotifas(user, lastNotif)
	if(err != nil){
		if(err == sql.ErrNoRows){
			global.JsonResponse(res, http.StatusNotFound, "")
		}else{
			global.ErrorLog.Println(err)	
			global.JsonResponse(res, http.StatusInternalServerError, "server side error")
		}
		return
	}

	global.JsonResponse(res, http.StatusOK, data)
}