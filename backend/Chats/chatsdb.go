package chats

type message struct {
	SenderID    int    `json:"senderid"`
	ReceiverID  int    `json:"receiverid"`
	Message     string `json:"message"`
	CreatedDate string `json:"createdDate"`
}

// function return message from database
func getMsgFromDB(receiverID, page int) []message {
	var msgs []message
	// i need a function that retrive the user data of the sender user
	// this will happen with a function that retrive data from session
	// usage: isLoggedin, userID, userName, err := userData(session, "token")
	//query := `SELECT m.sender_id, m.receiver_id, m.message, m.created_at FROM message m
	//        	WHERE (m.sender_id = ? or m.sender_id = ?) and (m.receiver_id = ? or m.receiver_id =?)
	//			ORDER BY m.created_at DESC LIMIT 10 OFFSET ?;`
	/* rows, err := SelectQuery(query, senderId, receiverId, senderId, receiverId, page)
	if err != nil {
		return nil
	}
	msg := message{}
	for rows.Next() {
		if err := rows.Scan(&msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedDate); err != nil {
			return nil
		}

		msgs = append(msgs, msg)
	}
	if len(msgs) == 0 {
		return []message{}
	} */
	return msgs
}

func addMsgToDB(receiverID, page int) {

}