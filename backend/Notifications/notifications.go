package notifications

import socket "socialNetwork/Socket"

type NotifService struct {
	Message, Type                 string
	SenderID, ReceiverID, GroupID uint64
}

const (
	Following        = "following"
	RequestFollowing = "request_following"
	GroupInvitation  = "group_invitation"
	AcceptRequest    = "accept_request"
	Event            = "event"
)

func NewNotification(message string, senderID, receiverID, groupID uint64) *NotifService {
	return &NotifService{
		Message:    message,
		SenderID:   senderID,
		ReceiverID: receiverID,
		GroupID:    groupID,
	}
}

func (nf *NotifService) Following(isRequest bool) error {
	if isRequest {
		nf.Type = RequestFollowing
	} else {
		nf.Type = Following
	}
	return nf.sendNotificationWithSenderName()
}

func (nf *NotifService) GroupInvitation() error {
	nf.Type = GroupInvitation
	return nf.sendNotificationWithSenderAndGroupName()
}

func (nf *NotifService) RequestJoinGroupToLeader() error {
	nf.Type = AcceptRequest
	leaderID, err := getLaderbyIdGroup(nf.GroupID)
	if err != nil {
		return err
	}
	nf.ReceiverID = leaderID
	return nf.sendNotificationWithSenderAndGroupName()
}

func (nf *NotifService) Event() error {
	nf.Type = Event
	userIDs, err := getIdsUsersOfGroup(nf.GroupID)
	if err != nil {
		logger.Error("Error getting user IDs of group: %v", err)
		return err
	}
	for _, userID := range userIDs {
		nf.ReceiverID = userID
		if err := nf.sendNotificationWithSenderAndGroupName(); err != nil {
			return err
		}
	}
	return nil
}

func (nf *NotifService) sendNotificationWithSenderName() error {
	senderName, err := GetFullNameById(uint(nf.SenderID))
	if err != nil {
		return err
	}
	dataSend := struct {
		Type    string
		Sender  string
		Message string
	}{
		Type:    nf.Type,
		Sender:  senderName,
		Message: nf.Message,
	}
	return sendAndSave(*nf, dataSend)
}

func (nf *NotifService) sendNotificationWithSenderAndGroupName() error {
	senderName, err := GetFullNameById(uint(nf.SenderID))
	if err != nil {
		return err
	}
	groupName, err := GetNameOfGroupById(uint(nf.GroupID))
	if err != nil {
		return err
	}
	dataSend := struct {
		Type    string
		Sender  string
		Group   string
		Message string
	}{
		Type:    nf.Type,
		Sender:  senderName,
		Group:   groupName,
		Message: nf.Message,
	}
	return sendAndSave(*nf, dataSend)
}

func sendAndSave(nf NotifService, dataSend interface{}) error {
	sent := false
	client, ok := socket.Clients[nf.ReceiverID]
	if ok {
		if err := socket.SendMessage(client, dataSend); err != nil {
			logger.Error("Error sending notification: %v", err)
			return err
		}
		sent = true
	}
	if err := Savenotifications(nf, sent); err != nil {
		logger.Error("Error saving notification: %v", err)
		return err
	}
	return nil
}
