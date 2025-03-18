package notifications

import (
	"database/sql"

	database "socialNetwork/Database"
)

type DataNotif struct {
	Id        uint64 `json:"id"`
	UserID    uint64
	RefId     string
	FirstName string
	LastName  string
	Avatar    string
	Type      string `json:"type"`
	Message   string `json:"message"`
	CreatedAt string `json:"creatat"`
}

func Savenotifications(nf NotifService, sen bool) error {
	var reference any
	if nf.GroupID != 0 {
		reference = nf.GroupID
	} else {
		reference = nil
	}
	_, err := database.ExecQuery(`INSERT INTO notifications(
					user_id,
					sender_id,
					type,
					reference_id,
					content,
					seen)
					VALUES(?,?,?,?,?,?)`,
		nf.SenderID,
		nf.ReceiverID,
		nf.Type,
		reference,
		nf.Message,
		sen)
	return err
}

// _, err := ExecQuery("UPDATE chat SET last_send = ? WHERE id = ?", lastmessage, chatID)

func MarkSenn(id int) error {
	_, err := database.ExecQuery("UPDATE notifications SET seen = 1 WHERE id = ?", id)
	return err
}

/* func GetIdsUsersOfGroup(groupId uint64) ([]uint64, error) {
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
} */

func selectNotifications(user, lastNotif string) ([]DataNotif, error) {

	var rows *sql.Rows
	var err error
	query := `
	SELECT
    	notifications.id,
		notifications.reference_id,
		users.id,
    	users.first_name,
    	users.last_name,
    	users.avatar,
    	notifications.content,
    	notifications.type,
    	notifications.created_at
	FROM
    	notifications
    	LEFT JOIN users ON notifications.user_id = users.id
	WHERE
    	notifications.sender_id = ?
    	AND notifications.id < ?
	ORDER BY
    	notifications.id DESC
	LIMIT 15;
	`

	if lastNotif != "" {
		rows, err = database.SelectQuery(query, user, lastNotif)
	} else {
		var lastid int64
		row, _ := database.SelectOneRow("SELECT id FROM notifications ORDER BY id DESC LIMIT 1")
		if err := row.Scan(&lastid); err != nil {
			return nil, err
		}
		rows, err = database.SelectQuery(query, user, lastid-1)
	}

	if err != nil {
		return nil, err
	}

	var nf DataNotif
	var notifications []DataNotif
	var RefID *string
	for rows.Next() {
		err = rows.Scan(
			&nf.Id,
			&RefID,
			&nf.UserID,
			&nf.FirstName,
			&nf.LastName,
			&nf.Avatar,
			&nf.Message,
			&nf.Type,
			&nf.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		nf.RefId = PointerValidation(RefID)
		notifications = append(notifications, nf)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return notifications, nil
}


func PointerValidation(str *string) string {
	if str == nil {
		return ""
	}
	return *str
}
