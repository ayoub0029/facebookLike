package groups

import (
	"fmt"
	d "socialNetwork/Database"
)

func createEvent(e *event) bool {
	query := `INSERT INTO events (group_id,owner_id,title,description,start_date,end_date)
			  VALUES (?,?,?,?,?,?);`
	res, err := d.ExecQuery(query, e.GroupID, e.OwnerID, e.Title, e.Description, e.StartDate, e.EndDate)
	if err != nil {
		return false
	} else {
		id, _ := res.LastInsertId()
		e.ID = int(id)
		return true
	}
}

func getAllEvents(group, page, member int) []event {
	query := `SELECT *,
  COALESCE((SELECT ev.option FROM event_votes ev 
    WHERE ev.user_id = ? AND ev.event_id = e.id), -1) AS state 
FROM events e
WHERE e.group_id = ? LIMIT 5 OFFSET ?;`
	data_Rows, err := d.SelectQuery(query, member, group, page)
	if err != nil {
		return nil
	}
	events_list := make([]event, 0)
	for data_Rows.Next() {
		myevent := event{}
		_ = data_Rows.Scan(&myevent.ID, &myevent.GroupID, &myevent.OwnerID, &myevent.Title, &myevent.Description,
			&myevent.StartDate, &myevent.EndDate, &myevent.CreatedAt, &myevent.State)
		events_list = append(events_list, myevent)
	}
	fmt.Println(events_list)
	return events_list
}

func vote(member, event, option int) bool {
	query := `INSERT INTO event_votes (user_id,event_id,option) VALUES(?,?,?);`
	_, err := d.ExecQuery(query, member, event, option)
	if err != nil {
		return false
	} else {
		return true
	}
}

func deleteVote(member, event int) bool {
	query := `DELETE FROM event_votes 
			WHERE user_id = ? AND event_id = ?;`
	_, err := d.ExecQuery(query, member, event)
	if err != nil {
		return false
	} else {
		return true
	}
}

func getHowManyVotesForEvent(eventID int) *NumberOfVotes {
	query := `SELECT (SELECT count(*) from event_votes ev
				WHERE ev.option = 1 AND ev.event_id = ?) AS going,(SELECT count(*) from event_votes ev
				WHERE ev.option = 0 AND ev.event_id = ?) AS notgoing;`;
	res, err := d.SelectOneRow(query,eventID,eventID);
	if err != nil {
		return nil
	}
	NumberVotes := &NumberOfVotes{}
	err = res.Scan(&NumberVotes.Going, &NumberVotes.NotGoing)
	if err != nil {
		return nil
	}
	return NumberVotes
}
