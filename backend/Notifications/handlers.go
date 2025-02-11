package notifications

import "net/http"

func Routes(mux *http.ServeMux){
	mux.HandleFunc("GET /notifications", getNotifications)
}

// ?user_id=123&page=1
func getNotifications(res http.ResponseWriter, req *http.Request)  {
	user := req.FormValue("user_id")
	lastNotif := req.FormValue("last_notif_id")

	selectNotifas(user, lastNotif)

}