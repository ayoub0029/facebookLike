package notifications

import (
	"fmt"

	database "socialNetwork/Database"
)

type DataNotif struct{
	Id uint64 `json:"id"`
	Sender string `json:"seneder"`
	Type string `json:"type"`
	Message string `json:"message"`
}

func Savenotifications(nf NotifServes) error {
	_, err := database.ExecQuery(`INSERT INTO notifications(
					user_id,
					sender_id,
					type,
					content)
					VALUES(?,?,?,?)`,
		nf.SederId,
		nf.ReceverId,
		nf.Type,
		nf.Message)
	return err
}

func getLaderbyIdGroup(GroupId uint64) (uint64, error) {
	row, err := database.SelectOneRow("SELECT owner_id FROM groups WHERE id = ?", GroupId)
	if err != nil {
		return 0, err
	}
	var ownerId uint64
	if err := row.Scan(&ownerId); err != nil {
		return 0, err
	}
	return ownerId, nil
}

func getIdsUsersOfGroup(groupId uint64) ([]uint64, error) {
	rows, err := database.SelectQuery("SELECT user_id FROM group_members WHERE group_id = ?", groupId)
	if err != nil {
		return nil, err
	}
	var id uint64
	var ids []uint64
	for rows.Next() {
		err = rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return ids, nil
}

func selectNotifas(user, lastNotif string) error {
	where := ""
	if lastNotif != "" {
		where = "AND id > ?"
	}

	query := fmt.Sprintf(`SELECT
    	id,
    	sender_id,
    	content,
    	type,
    	created_at
	FROM
    	notifications
	WHERE
    	user_id = ?
    	%v
	ORDER BY
    	id DESC;`,where)

// 		SELECT
//     notifications.id,
//     users.nickname,
//     notifications.content,
//     notifications.type,
//     notifications.created_at
// FROM
//     notifications
//     LEFT JOIN users ON notifications.sender_id = users.id
// WHERE
//     user_id = 1
// ORDER BY
//     notifications.id DESC
// LIMIT 10;
	rows, err := database.SelectQuery(query,user,lastNotif)
	if(err != nil){
		return nil
	}
	for rows.Next(){

	}

	if err = rows.Err(); err != nil {
		return err
	}
	return nil
}
