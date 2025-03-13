package chats

import (
	"fmt"
	"fmt"
	"log"
	"net/http"


	database "socialNetwork/Database"
	middleware "socialNetwork/Middlewares"
	middleware "socialNetwork/Middlewares"
)

// function return message from database
func GetMsgFromPrvChatDB(receiverID, page int, r *http.Request) ([]privateMsg, error) {
	var msgs []privateMsg
	user, ok := r.Context().Value(middleware.UserContextKey).(middleware.User)
	if !ok {
		return nil, fmt.Errorf("user not login")
	}
	query := `SELECT * from (SELECT COALESCE((SELECT u.avatar
FROM users u WHERE u.id = pch.sender_id), './images/profile.jpeg') AS avatar ,(SELECT CONCAT(u.first_name, ' ', u.last_name) 
FROM users u WHERE u.id = pch.sender_id) AS full_name,pch.id,pch.sender_id,pch.receiver_id,pch.message,pch.created_at
FROM private_chat pch
WHERE (pch.sender_id = ? AND pch.receiver_id = ?)
or (pch.sender_id = ? AND pch.receiver_id = ?)
ORDER BY pch.created_at DESC LIMIT 15 OFFSET ?) AS t
ORDER BY t.created_at ASC; `
	rows, err := database.SelectQuery(query, user.ID, receiverID, receiverID, user.ID, page)
	if err != nil {
		log.Println("Getting data from db error: ", err)
		return nil, err
		return nil, err
	}
	msg := privateMsg{}
	for rows.Next() {
		err := rows.Scan(&msg.Avatar, &msg.FullName, &msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedDate)
		err := rows.Scan(&msg.Avatar, &msg.FullName, &msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedDate)
		if err != nil {
			log.Println("Scan error: ", err)
			return nil, err
			return nil, err
		}

		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return nil, nil
		return nil, nil
	}
	return msgs, nil
}

func GetMsgFromGrpChatDB(groupID, page int, r *http.Request) ([]groupMsg, error) {
	var msgs []groupMsg
	query := `SELECT u.avatar, CONCAT(u.first_name, ' ', u.last_name) AS full_name,m.id, m.sender_id, m.group_id, m.message, m.created_at FROM group_chat m
			  join users u
			  on m.sender_id = u.id
			  WHERE m.group_id = ? LIMIT 10 OFFSET ?;`
	query := `SELECT u.avatar, CONCAT(u.first_name, ' ', u.last_name) AS full_name,m.id, m.sender_id, m.group_id, m.message, m.created_at FROM group_chat m
			  join users u
			  on m.sender_id = u.id
			  WHERE m.group_id = ? LIMIT 10 OFFSET ?;`
	rows, err := database.SelectQuery(query, groupID, page)
	if err != nil {
		log.Println("Getting data from db error: ", err)
		return nil, err
		return nil, err
	}
	msg := groupMsg{}
	for rows.Next() {
		err := rows.Scan(&msg.Avatar, &msg.FullName, &msg.MessageID, &msg.SenderID, &msg.GroupId, &msg.Message, &msg.CreatedDate)
		if err != nil {
			log.Println("Scan error: ", err)
			return nil, err
			return nil, err
		}
		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return nil, nil
		return nil, nil
	}
	return msgs, nil
}

func AddmessageToPrvDB(senderId uint64, message string, receiverId uint64) error {
	query := `INSERT INTO private_chat (sender_id, receiver_id, message, created_at)
			  VALUES (?,?,?,datetime('now', 'localtime'))`
	_, err := database.ExecQuery(query, senderId, receiverId, message)
	if err != nil {
		log.Println("Exection error: ", err)
		return err
	}
	return nil
}

func AddmessageGrpToDB(senderId uint64, groupid uint64, message string) error {
	query := `INSERT INTO group_chat (group_id, sender_id, message, created_at)
			  VALUES (?,?,?,datetime('now', 'localtime'))`
	_, err := database.ExecQuery(query, groupid, senderId, message)
	if err != nil {
		log.Println("Exection error: ", err)
		return err
	}
	return nil
}
