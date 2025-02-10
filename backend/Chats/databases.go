package chats

import (
	"log"
	"net/http"
	auth "socialNetwork/Authentication"
	database "socialNetwork/Database"
)

// function return message from database
func GetMsgFromPrvChatDB(receiverID, page int, r *http.Request) ([]privateMsg, error) {
	var msgs []privateMsg
	userID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		log.Fatal(err) // ma3rftch wach n exiter wlla chii 7aja ukhra
		return []privateMsg{}, err
	}
	query := `SELECT m.sender_id, m.receiver_id, m.message, m.created_at FROM private_chat m
	        	WHERE (m.sender_id = ? or m.sender_id = ?) and (m.receiver_id = ? or m.receiver_id =?)
				ORDER BY m.created_at DESC LIMIT 10 OFFSET ?;`
	rows, err := database.SelectQuery(query, userID, receiverID, userID, receiverID, page)
	if err != nil {
		log.Println("Getting data from db error: ", err)
		return []privateMsg{}, err
	}
	msg := privateMsg{}
	for rows.Next() {
		err := rows.Scan(&msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedDate)
		if err != nil {
			log.Println("Scan error: ", err)
			return []privateMsg{}, err
		}

		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return []privateMsg{}, nil
	}
	return msgs, nil
}

func GetMsgFromGrpChatDB(groupID, page int, r *http.Request) ([]groupMsg, error) {
	var msgs []groupMsg
	userID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		log.Fatal(err) // ma3rftch wach n exiter wlla chii 7aja ukhra
		return []groupMsg{}, err
	}
	query := `SELECT m.sender_id, m.group_id, m.message, m.created_at FROM group_chat m
			  WHERE m.group_id = ?
	          ORDER BY m.created_at DESC LIMIT 10 OFFSET ?;`
	rows, err := database.SelectQuery(query, userID, groupID, page)
	if err != nil {
		log.Println("Getting data from db error: ", err)
		return []groupMsg{}, err
	}
	msg := groupMsg{}
	for rows.Next() {
		err := rows.Scan(&msg.SenderID, &msg.GroupId, &msg.Message, &msg.CreatedDate)
		if err != nil {
			log.Println("Scan error: ", err)
			return []groupMsg{}, err
		}
		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return []groupMsg{}, nil
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
