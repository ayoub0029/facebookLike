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

type groupApplication struct {
	ID       int    `json:"id"`
	GroupID  int    `json:"groupID"`
	Name     string `json:"name"`
	UserID   int    `json:"userID"`
	FullName string `json:"fullName"`
	State    string `json:"state"`
}

func getGroupsOwnerApplications(OwnerID, page int) []groupApplication {
	query := `SELECT gm.id, g.id AS groupID,g.name,u.id AS userID,concat(u.first_name ," ",u.last_name) AS fullName,gm.status FROM groups g
			JOIN group_members gm ON g.id = gm.group_id JOIN users u ON u.id = gm.user_id
			WHERE (g.owner_id = ? OR gm.user_id = ?) AND gm.status = "request" OR (gm.status = "pending" AND gm.user_id = ?)
			LIMIT 10 OFFSET ?;`
	data_Rows, err := d.SelectQuery(query, OwnerID, OwnerID, OwnerID, page)
	if err != nil {
		return nil
	}
	Applications_lists := make([]groupApplication, 0)
	for data_Rows.Next() {
		Application := groupApplication{}
		_ = data_Rows.Scan(&Application.ID, &Application.GroupID, &Application.Name, &Application.UserID, &Application.FullName, &Application.State)
		Applications_lists = append(Applications_lists, Application)
	}
	fmt.Println(Applications_lists)
	return Applications_lists
}

func getGroupInfo(UserId, groupID int) *group {
	query := `SELECT g.id,g.name,g.description,g.owner_id,g.created_at,(SELECT count(*) from group_members gm
			WHERE gm.group_id = g.id AND gm.status = 'accept') AS members, (select COALESCE((SELECT gm.status from group_members gm WHERE gm.group_id = g.id and gm.user_id = ?),'nothing')) as status
			FROM groups g  WHERE g.id = ?;`
	res, err := d.SelectOneRow(query, UserId, groupID)
	if err != nil {
		return nil
	}
	MyGroup := &group{}
	err = res.Scan(&MyGroup.ID, &MyGroup.Name, &MyGroup.Description, &MyGroup.Owner, &MyGroup.CreatedAt, &MyGroup.Members, &MyGroup.Status)
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
	query := `
    SELECT
        COALESCE(
            (
                SELECT gm.user_id
                FROM group_members gm
                INNER JOIN groups g ON gm.group_id = g.id
                WHERE g.owner_id = $1
                OR (gm.status = 'accept' AND gm.group_id = $2 AND gm.user_id = $1)
                LIMIT 1
            ),
            0
        ) AS id;`
	res, err := d.SelectOneRow(query, userId, groupId)
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
				WHERE gm.group_id = ? AND gm.status = 'accept' LIMIT 5 OFFSET ?;`
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
	query := `UPDATE group_members  SET status = 'accept' 
			  WHERE group_id = ? AND user_id = ?`
	_, err := d.ExecQuery(query, groupId, memberId)
	return err == nil
}

func requestToJoin(groupId, memberId int, state string) bool {
	query := `INSERT INTO group_members (group_id,user_id) VALUES(?,?);`
	if state != "" {
		query = `INSERT INTO group_members (group_id,user_id,status) VALUES(?,?,?);`
	}
	_, err := d.ExecQuery(query, groupId, memberId, state)
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
	return groupsList
}

func getAllGroupsJoinedBy(userID, page int) []group {
	query := `SELECT g.id,g.name,g.description,g.owner_id,g.created_at FROM groups g
				INNER JOIN group_members gm on gm.group_id = g.id
			WHERE gm.user_id = ? AND gm.status = 'accept' LIMIT 5 OFFSET ?;`
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

func getAllGroupRequets(group, page int) []profiles.Profile {
	query := `SELECT u.id,u.first_name,u.last_name,u.avatar
				FROM users u INNER JOIN group_members gm
				on u.id = gm.user_id
				WHERE gm.group_id = ? AND gm.status = 'request' LIMIT 5 OFFSET ?;`
	data_Rows, err := d.SelectQuery(query, group, page)
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

func getPeopleToInvite(userID, groupID, page int) []profiles.Profile {
	query := `SELECT u.id, u.first_name, u.last_name, u.avatar
			FROM users u JOIN followers f ON u.id = f.follower_id  OR u.id = f.followed_id
			WHERE (f.followed_id = ? OR f.follower_id = ?) AND f.status = 'accept' AND u.id != ? 
			AND u.id NOT in (SELECT gm.user_id AS UserID FROM group_members gm
			WHERE gm.group_id = ?) AND u.id != (SELECT g.owner_id FROM groups g 
			WHERE g.id = ?) GROUP BY u.id LIMIT 10 OFFSET ?;`;
	data_Rows, err := d.SelectQuery(query, userID,userID,userID,groupID,groupID, page);
	if err != nil {
		return nil
	}
	users_lists := make([]profiles.Profile, 0)
	for data_Rows.Next() {
		user := profiles.Profile{}
		_ = data_Rows.Scan(&user.Id, &user.ProfileData.First_Name, &user.ProfileData.Last_Name, &user.ProfileData.Avatar)
		users_lists = append(users_lists, user)
	}
	return users_lists
}
