package groups

import (
	"fmt"
	"net/http"
	"strconv"

	global "socialNetwork/Global"
	middleware "socialNetwork/Middlewares"
)

func CreateGroup_handler(res http.ResponseWriter, req *http.Request) {
	name := req.FormValue("name")
	description := req.FormValue("description")
	user, ok := req.Context().Value(middleware.UserContextKey).(middleware.User)
	if !ok {
		return
	}
	fmt.Println(name, description, user)
	/* if err != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	} */
	myGroup := NewGroup(name, description, int(user.ID))
	status := myGroup.Create()
	if !status {
		global.JsonResponse(res, 500, "Enternal Server 500")
		return
	}
	global.JsonResponse(res, 200, "Mrigla")
}

func GetAllGroups_handler(res http.ResponseWriter, req *http.Request) {
	page, err := strconv.Atoi(req.FormValue("page"))
	if err != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	groupsArray := GetGroups(page)
	if groupsArray == nil {
		global.JsonResponse(res, 404, "data Not Found")
		return
	}
	global.JsonResponse(res, 200, groupsArray)
}

func GetGroupsCreatedBy_handler(res http.ResponseWriter, req *http.Request) {
	user, ok := req.Context().Value(middleware.UserContextKey).(middleware.User)
	if !ok {
		return
	}
	page, err2 := strconv.Atoi(req.FormValue("page"))

	if err2 != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	groupsArray := GetGroupsCreatedBy(int(user.ID), page)
	if groupsArray == nil {
		global.JsonResponse(res, 404, "data Not Found")
		return
	}
	global.JsonResponse(res, 200, groupsArray)
}

func GetGroupsJoinedBy_handler(res http.ResponseWriter, req *http.Request) {
	user, ok := req.Context().Value(middleware.UserContextKey).(middleware.User)
	if !ok {
		return
	}
	page, err2 := strconv.Atoi(req.FormValue("page"))

	if err2 != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	groupsArray := GetGroupsJoinedBy(int(user.ID), page)
	if groupsArray == nil {
		global.JsonResponse(res, 404, "data Not Found")
		return
	}
	global.JsonResponse(res, 200, groupsArray)
}

func GetGroupMembers_handler(res http.ResponseWriter, req *http.Request) {
	page, err := strconv.Atoi(req.FormValue("page"))
	groupId, err2 := strconv.Atoi(req.FormValue("group"))
	if err != nil || err2 != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	groupMembersArray := GetMembers(groupId, page)
	if groupMembersArray == nil {
		global.JsonResponse(res, 404, "data Not Found")
		return
	}
	global.JsonResponse(res, 200, groupMembersArray)
}

func CreateEvent_handler(res http.ResponseWriter, req *http.Request) {
	group, err2 := strconv.Atoi(req.FormValue("group"))
	owner, err := strconv.Atoi(req.FormValue("owner"))
	title := req.FormValue("title")
	description := req.FormValue("description")
	start := req.FormValue("start")
	end := req.FormValue("end")
	if err != nil || err2 != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	myevent := NewEvent(group, owner, title, description, start, end, "")
	myevent.Create()
	global.JsonResponse(res, 200, "event created succesfuly")
}

func GetEvent_handler(res http.ResponseWriter, req *http.Request) {
	group, err := strconv.Atoi(req.FormValue("group"))
	page, err2 := strconv.Atoi(req.FormValue("page"))

	if err != nil || err2 != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	events := GetEvents(group, page)
	if events == nil {
		global.JsonResponse(res, 404, "events not found")
	}
	global.JsonResponse(res, 200, events)
}

/*func JoinGroup_handler(res http.ResponseWriter,req *http.Request)  {
	member,err := strconv.Atoi(req.FormValue("member"));
	groupId,err2 := strconv.Atoi(req.FormValue("group"));
	if err != nil || err2 != nil {
		global.JsonResponse(res,400,"data Error");
		return;
	}

}*/

func GetGroupInfo_handler(res http.ResponseWriter, req *http.Request) {
	group, err := strconv.Atoi(req.FormValue("group"))
	if err != nil {
		global.JsonResponse(res, 400, "data Error")
		return
	}
	groupInfo := GetGroupInfo(group)
	if groupInfo == nil {
		global.JsonResponse(res, 404, "data Not Found")
		return
	}
	global.JsonResponse(res, 200, *groupInfo)
}
