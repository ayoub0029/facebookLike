package notifications

import (
	socket "socialNetwork/Socket"
)

type NotifServes struct {
	Message, Type               string
	SederId, ReceverId, GroupId uint64
}

var (
	FOLOWING         = "following"
	GROUP_INVITATION = "group_invitation"
	ACCCEPT_REQUEST  = "accept_equest"
	EVENT            = "event"
)

func NewNotification(message string, senderId, ReceverId, GroupId uint64) *NotifServes {
	return &NotifServes{
		Message:   message,
		SederId:   senderId,
		ReceverId: ReceverId,
		GroupId:   GroupId,
	}
}

// has a private profile and some other user sends him/her a following request
func (Nf *NotifServes) Following() error {
	Nf.Type = FOLOWING
	err := sendAndSave(*Nf)
	return err
}

// receives a group invitation, so he can refuse or accept the request
func (Nf *NotifServes) Groupinvitation() error {
	Nf.Type = GROUP_INVITATION
	err := sendAndSave(*Nf)
	return err
}

// is the creator of a group and another user requests to join the group, so he can refuse or accept the request
func (Nf *NotifServes) AcceptRequest() error {
	Nf.Type = ACCCEPT_REQUEST
	id, err := getLaderbyIdGroup(Nf.GroupId)
	if err != nil {
		return err
	}
	Nf.ReceverId = id
	err = sendAndSave(*Nf)
	return err
}

// is member of a group and an event is created
func (Nf *NotifServes) Event() error {
	Nf.Type = EVENT
	ids, err := getIdsUsersOfGroup(Nf.GroupId)
	if err != nil {
		logger.Error("%s", err)
		// global.ErrorLog.Println(err)
		return err
	}
	for _, id := range ids {
		Nf.ReceverId = id
		err = sendAndSave(*Nf)
		if err != nil {
			return err
		}
	}

	return err
}

func sendAndSave(Nf NotifServes) error {
	sen := false
	val, ok := socket.Clients[Nf.ReceverId]
	if ok {
		err := socket.SendMessage(val, Nf.Message)
		if err != nil {
			logger.Error("send NotifServes %v", err)
			return err
		}
		sen = true
	}
	err := Savenotifications(Nf, sen)
	if err != nil {
		logger.Error("%s", err)
		return err
	}
	return nil
}
