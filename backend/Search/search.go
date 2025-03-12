package search

import (
	database "socialNetwork/Database"
)

type UsersSearch struct {
	Id         int    `json:"id"`
	Nickname   string `json:"nickname"`
	First_name string `json:"firstName"`
	Last_name  string `json:"lastName"`
}

type GroupSearch struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func searchUsersInDb(target, lastId string) ([]UsersSearch, error) {
	if lastId == "" {
		lastId = "-1"
	}
	query := `SELECT
    	id,
    	nickname,
    	first_name,
    	last_name
	FROM
    	users
	WHERE
    	(id > ?) AND (
        	nickname LIKE ?
        	OR first_name LIKE ?
        	OR last_name LIKE ?
    )
	LIMIT 10;`

	rows, err := database.SelectQuery(query, lastId, target+"%", target+"%", target+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usersSearch []UsersSearch

	for rows.Next() {
		var us UsersSearch
		err := rows.Scan(
			&us.Id,
			&us.Nickname,
			&us.First_name,
			&us.Last_name,
		)
		if err != nil {
			return nil, err
		}
		usersSearch = append(usersSearch, us)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return usersSearch, nil
}

func SearchGroupsInDb(target, lastId string) ([]GroupSearch, error) {
	if lastId == "" {
		lastId = "-1"
	}

	query := `SELECT
    	id,
    	name,
    	description
	FROM
    	groups
	WHERE
    	(id > ?) AND (
        		name LIKE ?
        		OR description LIKE ?
    )
	LIMIT 10;`

	rows, err := database.SelectQuery(query, lastId, target+"%", "%"+target+"%")
	if err != nil {
		return nil, err
	}
	var groupSearch []GroupSearch
	for rows.Next() {
		var gs GroupSearch
		err := rows.Scan(
			&gs.Id,
			&gs.Name,
			&gs.Description,
		)
		if err != nil {
			return nil, err
		}
		groupSearch = append(groupSearch, gs)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return groupSearch, nil
}
