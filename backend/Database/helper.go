package database

import (
	"database/sql"
	"fmt"
)

func SelectQuery(query string, args ...any) (*sql.Rows, error) {
	db, err := sql.Open("sqlite3", "./Database/socialNetwork.db?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err)
	}
	rows, er := db.Query(query, args...)
	if er != nil {
		return nil, fmt.Errorf("QUERY ERROR: %v", er)
	}
	db.Close()
	return rows, nil
}

func SelectOneRow(query string, args ...any) (*sql.Row, error) {
	db, err := sql.Open("sqlite3", "./Database/socialNetwork.db?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err)
	}
	row := db.QueryRow(query, args...)
	db.Close()
	return row, nil
}

func ExecQuery(query string, args ...any) (sql.Result, error) {
	db, err := sql.Open("sqlite3", "./Database/socialNetwork.db?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err)
	}

	rs, err := db.Exec(query, args...)
	if err != nil {
		fmt.Println("EXEC ERROR:", err) // Log error to debug
		return nil, fmt.Errorf("EXEC ERROR: %v", err)
	}
	db.Close()
	return rs, nil
}
