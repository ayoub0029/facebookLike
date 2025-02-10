package chats

import (
	"log"
	"net/http"
	auth "socialNetwork/Authentication"
	database "socialNetwork/Database"
)

// function return message from database
func getMsgFromDB(receiverID, page int, r *http.Request) ([]message, error) {
	var msgs []message
	userID, err := auth.IsLoggedIn(r, "token")
	if err != nil {
		log.Fatal(err) // ma3rftch wach n exiter wlla chii 7aja ukhra
		return []message{}, err
	}
	query := `SELECT m.sender_id, m.receiver_id, m.message, m.created_at FROM message m
	        	WHERE (m.sender_id = ? or m.sender_id = ?) and (m.receiver_id = ? or m.receiver_id =?)
				ORDER BY m.created_at DESC LIMIT 10 OFFSET ?;`
	rows, err := database.SelectQuery(query, userID, receiverID, userID, receiverID, page)
	if err != nil {
		log.Println("Getting data from db error: ", err)
		return []message{}, err
	}
	msg := message{}
	for rows.Next() {
		err := rows.Scan(&msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedDate)
		if err != nil {
			log.Println("Scan error: ", err)
			return []message{}, err
		}

		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return []message{}, nil
	}
	return msgs, nil
}

func AddmessageToDB(senderId uint64, message string, receiverId uint64) error {
	query := `INSERT INTO private_chat (sender_id, receiver_id, message, created_at)
			  VALUES (?,?,?,datetime('now', 'localtime'))`
	_, err := database.ExecQuery(query, senderId, receiverId, message)
	if err != nil {
		log.Println("Exection error: ", err)
		return err
	}
	return nil
}
