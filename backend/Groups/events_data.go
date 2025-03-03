package groups

import (
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

func getAllEvents(group, page int) []event {
	query := `SELECT * FROM events e 
	WHERE e.group_id = ? LIMIT 5 OFFSET ?;`
	data_Rows, err := d.SelectQuery(query, group, page)
	if err != nil {
		return nil
	}
	events_list := make([]event, 0)
	for data_Rows.Next() {
		myevent := event{}
		_ = data_Rows.Scan(&myevent.ID, &myevent.GroupID, &myevent.OwnerID, &myevent.Title, &myevent.Description,
			&myevent.StartDate, &myevent.EndDate, &myevent.CreatedAt)
		events_list = append(events_list, myevent)
	}
	return events_list
}

func vote(member,event int)  {
	query := `INSERT INTO event_votes (user_id,event_id,option_id) VALUES(?,?,?);`;

}