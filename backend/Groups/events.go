package groups

type event struct {
	ID          int    `json:"id"`
	GroupID     int    `json:"groupid"`
	OwnerID     int    `json:"ownerid"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartDate   string `json:"startdate"`
	EndDate     string `json:"enddate"`
	CreatedAt   string `json:"createdat"`
}

type NumberOfVotes struct {
	Going    int `json:"going"`
	NotGoing int `json:"notgoing"`
}
type eventVote struct {
	ID     int `json:"id"`
	User   int `json:"user"`
	Event  int `json:"event"`
	Option int `json:"option"`
}

func NewEvent(_groupID, _ownerID int, _title, _description, _startdate, _enddate, _createdat string) *event {
	return &event{
		ID:          -1,
		GroupID:     _groupID,
		OwnerID:     _ownerID,
		Title:       _title,
		Description: _description,
		StartDate:   _startdate,
		EndDate:     _enddate,
		CreatedAt:   _createdat,
	}
}

func (e *event) Create() bool {
	return createEvent(e)
}

func GetEvents(group, page int) []event {
	return getAllEvents(group, page)
}

func Vote(member, event, option int) bool {
	return vote(member, event, option)
}

func GetHowManyVotesForEvent(eventId int) *NumberOfVotes {
	return getHowManyVotesForEvent(eventId)
}
