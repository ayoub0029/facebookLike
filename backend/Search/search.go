package search

import (
	"fmt"

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
	where := ""
	if lastId != "" {
		where = "(id > " + lastId + ") AND"
	}
	query := fmt.Sprintf(`SELECT
    	id,
    	nickname,
    	first_name,
    	last_name
	FROM
    	users
	WHERE
    	%v (
        	nickname LIKE '?%'
        	OR first_name like '?%'
        	OR last_name like '?%'
    )
	LIMIT 10;`, where)

	rows, err := database.SelectQuery(query, target, target, target)
	if err != nil {
		return nil, err
	}
	var us UsersSearch
	var usersSerch []UsersSearch

	for rows.Next() {
		err := rows.Scan(
			&us.Id,
			&us.Nickname,
			&us.First_name,
			&us.Last_name,
		)
		if err != nil {
			return nil, err
		}
		usersSerch = append(usersSerch, us)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return usersSerch, nil
}

func SearchGroupsInDb(target, lastId string) ([]GroupSearch, error) {
	where := ""
	if lastId != "" {
		where = "(id > " + lastId + ") AND"
	}

	auery := fmt.Sprintf(`SELECT
    	id,
    	name,
    	description
	FROM
    	groups
	WHERE
    	%v
    	AND (
        	name like '?%'
        	OR description like '%?%'
    		)
	LIMIT 10;`, where)
	rows, err := database.SelectQuery(auery, target, target)
	if err != nil {
		return nil, err
	}
	var gs GroupSearch
	var groupSearch []GroupSearch

	for rows.Next() {
		err = rows.Scan(
			&gs.Id,
			&gs.Name,
			&gs.Description,
		)
		if err != nil {
			return nil, err
		}
		groupSearch = append(groupSearch, gs)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return groupSearch, nil
}
