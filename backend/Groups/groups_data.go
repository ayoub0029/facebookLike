package groups

import (
	//"fmt"
	"fmt"
	d "socialNetwork/Database"
	profiles "socialNetwork/Profiles"
)

type group_data struct {
	ID          int
	Name        string
	Description string
	Owner       int
	Created_At  string
}

func getGroupInfo(UserId,groupID int) *group {
	query := `SELECT g.id,g.name,g.description,g.owner_id,g.created_at,(SELECT count(*) from group_members gm
			WHERE gm.group_id = g.id AND gm.status = 'accepted') AS members, (select COALESCE((SELECT gm.status from group_members gm WHERE gm.group_id = g.id and gm.user_id = ?),'nothing')) as status
			FROM groups g  WHERE g.id = ?;`
	res, err := d.SelectOneRow(query,UserId,groupID)
	if err != nil {
		return nil
	}
	MyGroup := &group{}
	err = res.Scan(&MyGroup.ID, &MyGroup.Name, &MyGroup.Description, &MyGroup.Owner, &MyGroup.CreatedAt, &MyGroup.Members,&MyGroup.Status);
	if err != nil {
		return nil
	}
	return MyGroup
}

func createGroup(name, description string, owner int) int {
	query := "INSERT INTO groups (name,description,owner_id) VALUES(?,?,?);"
	res, err := d.ExecQuery(query, name, description, owner)
	if err != nil {
		return -1
	} else {
		id, _ := res.LastInsertId()
		return int(id)
	}
}

func getAllGroups(page int) []group_data {
	groupsList := make([]group_data, 0)
	query := "select * from groups  LIMIT 5 OFFSET ?;"
	data_Rows, err := d.SelectQuery(query, page)
	if err != nil {
		return nil
	}
	for data_Rows.Next() {
		MyGroup := group_data{}
		_ = data_Rows.Scan(&MyGroup.ID, &MyGroup.Name, &MyGroup.Description, &MyGroup.Owner, &MyGroup.Created_At)
		groupsList = append(groupsList, MyGroup)
	}
	return groupsList
}

func isMember(groupId, userId int) bool {
	query := `SELECT COALESCE((SELECT  gm.user_id
	 			FROM group_members gm
				WHERE gm.group_id = ? AND gm.user_id = ?), 0) AS id`
	res, err := d.SelectOneRow(query, groupId, userId)
	if err != nil {
		return false
	} else {
		id := -1
		_ = res.Scan(&id)
		if id == 0 {
			return false
		} else {
			return true
		}
	}
}

func getAllMembers(groupID, page int) []profiles.Profile {
	query := `SELECT u.id,u.first_name,u.last_name,u.avatar
				FROM users u INNER JOIN group_members gm
				on u.id = gm.user_id
				WHERE gm.group_id = ? LIMIT 5 OFFSET ?;`
	data_Rows, err := d.SelectQuery(query, groupID, page)
	if err != nil {
		return nil
	}
	members_lists := make([]profiles.Profile, 0)
	for data_Rows.Next() {
		Member := profiles.Profile{}
		_ = data_Rows.Scan(&Member.Id, &Member.ProfileData.First_Name, &Member.ProfileData.Last_Name, &Member.ProfileData.Avatar)
		members_lists = append(members_lists, Member)
	}
	return members_lists
}

func join(groupId, memberId int) bool {
	query := `UPDATE group_members  SET status = 'accepted' 
			  WHERE group_id = ? AND user_id = ?`
	_, err := d.ExecQuery(query, groupId, memberId)
	return err == nil
}

func requestToJoin(groupId, memberId int) bool {
	query := `INSERT INTO group_members (group_id,user_id) VALUES(?,?);`
	_, err := d.ExecQuery(query, groupId, memberId)
	return err == nil
}

func leaveGroup(groupId, memberId int) bool {
	query := `DELETE FROM group_members 
			  WHERE user_id = ? AND group_id = ?;`
	_, err := d.ExecQuery(query, memberId, groupId)
	return err == nil
}

func getAllGroupsCreatedBy(userID, page int) []group {
	groupsList := make([]group, 0)
	query := "select * from groups g WHERE g.owner_id = ?  LIMIT 5 OFFSET ?;"
	data_Rows, err := d.SelectQuery(query, userID, page)
	if err != nil {
		return nil
	}
	for data_Rows.Next() {
		MyGroup := group{}
		_ = data_Rows.Scan(&MyGroup.ID, &MyGroup.Name, &MyGroup.Description, &MyGroup.Owner, &MyGroup.CreatedAt)
		groupsList = append(groupsList, MyGroup)
	}
	for i := 0; i < len(groupsList); i++ {
		fmt.Println(groupsList[i].ID, page)
	}
	return groupsList
}

func getAllGroupsJoinedBy(userID, page int) []group {
	query := `SELECT g.id,g.name,g.description,g.owner_id,g.created_at FROM groups g
				INNER JOIN group_members gm on gm.group_id = g.id
			WHERE gm.user_id = ? AND gm.status = 'accepted' LIMIT 5 OFFSET ?;`
	groupsList := make([]group, 0)
	data_Rows, err := d.SelectQuery(query, userID, page)
	if err != nil {
		return nil
	}
	for data_Rows.Next() {
		MyGroup := group{}
		_ = data_Rows.Scan(&MyGroup.ID, &MyGroup.Name, &MyGroup.Description, &MyGroup.Owner, &MyGroup.CreatedAt)
		groupsList = append(groupsList, MyGroup)
	}
	return groupsList
}


