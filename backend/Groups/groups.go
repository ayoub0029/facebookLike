package groups

import (
	"fmt"

	profiles "socialNetwork/Profiles"
)

type group struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Owner       int    `json:"owner"`
	CreatedAt   string `json:"createdAt"`
	Members     int    `json:"members"`
	Status      string  `json:"status"`

}

func NewGroup(_name, _description string, _owner int) *group {
	return &group{
		ID:          -1,
		Name:        _name,
		Description: _description,
		Owner:       _owner,
		Members : 0,
		Status : "nothing",
	}
}

func IsMember(groupId, userId int) bool {
	return isMember(groupId, userId)
}

func GetMembers(groupID, page int) []profiles.Profile {
	members := getAllMembers(groupID, page)
	return members
}

func GetGroups(page int) []group {
	groupsLists := make([]group, 0)
	groups_dataLists := getAllGroups(page)
	for _, g_data := range groups_dataLists {
		groupsLists = append(groupsLists, *convert(g_data))
	}
	return groupsLists
}

func PrintGroupsData() {
	groups := GetGroups(0)
	for _, g := range groups {
		fmt.Printf("ID 			: %d\n", g.ID)
		fmt.Printf("Name 		: %s\n", g.Name)
		fmt.Printf("Description : %s\n", g.Description)
		fmt.Printf("Owner		: %d\n", g.Owner)
	}
}

// this function will call createGroup function
// you can add any condition in this function without changing the 'createGroup' function
// example :
// if you want One user can only create five groups at most you can update just in function bellow
func (g *group) Create() bool {
	g.ID = createGroup(g.Name, g.Description, g.Owner)
	return g.ID != -1
}

// this is a private function that convert group_data received from database to busnnes group
func convert(g_data group_data) *group {
	return &group{
		ID:          g_data.ID,
		Name:        g_data.Name,
		Description: g_data.Description,
		Owner:       g_data.Owner,
	}
}

func RequestToJoin(groupId, memberId int) bool {
	if requestToJoin(groupId, memberId) {
		// Sending Notification code ...
		return true
	}
	return false
}

func Join(groupId, memberId int) bool {
	return join(groupId, memberId)
}


func Leave(groupId, memberId int) bool {
	if leaveGroup(groupId, memberId) {
		// notification to group members
		return true;
	}
	return false;
}

func GetGroupsCreatedBy(userID, page int) []group {
	return getAllGroupsCreatedBy(userID, page)
}

func GetGroupsJoinedBy(userID, page int) []group {
	return getAllGroupsJoinedBy(userID, page)
}

func GetGroupInfo(UserId,groupID int) *group {
	return getGroupInfo(UserId,groupID);
}

func Invite(groupID,inviterID int) bool {
	if requestToJoin(groupID, inviterID) {
		// Sending Notification code ...
		return true
	}
	return false
}