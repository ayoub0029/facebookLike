package notifications

import (
	"database/sql"

	database "socialNetwork/Database"
)

type DataNotif struct {
	Id        uint64 `json:"id"`
	Sender    string `json:"seneder"`
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

func selectNotifications(user, lastNotif string) ([]DataNotif, error) {
	var rows *sql.Rows
	var err error

	query := `SELECT
    	notifications.id,
    	users.nickname,
    	notifications.content,
    	notifications.type,
    	notifications.created_at
	FROM
    	notifications
    	LEFT JOIN users ON notifications.sender_id = users.id
	WHERE
    	user_id = ?`

	if lastNotif != "" {
		query += " AND notifications.id > ?"
		rows, err = database.SelectQuery(query, user, lastNotif)
	} else {
		rows, err = database.SelectQuery(query, user)
	}

	query += ` ORDER BY id DESC LIMIT 10;`

	if err != nil {
		return nil, err
	}

	var nf DataNotif
	var notifications []DataNotif

	for rows.Next() {
		err = rows.Scan(
			&nf.Id,
			&nf.Sender,
			&nf.Message,
			&nf.Type,
			&nf.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		notifications = append(notifications, nf)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return notifications, nil
}

func GetFullNameById(id uint) (string, error) {
	row, err := database.SelectOneRow("SELECT first_name, last_name FROM users WHERE id = ?", id)
	if err != nil {
		return "", err
	}
	var fn string
	var ln string
	if err := row.Scan(&fn, &ln); err != nil {
		return "", err
	}
	return fn + " " + ln, nil
}
func GetNameOfGroupById(id uint) (string, error) {
	row, err := database.SelectOneRow("SELECT name FROM groups WHERE id = ?", id)
	if err != nil {
		return "", err
	}
	var nm string
	if err := row.Scan(&nm); err != nil {
		return "", err
	}
	return nm, nil
}