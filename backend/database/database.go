package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func CreateDatabase() {
	db, err := sql.Open("sqlite3", "./database/socialNetwork.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// all tables
	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first_name TEXT,
			last_name TEXT,
			email TEXT UNIQUE,
			password TEXT,
			date_of_birth DATE,
			avatar TEXT,
			nickname TEXT,
			about_me TEXT,
			profile_status TEXT DEFAULT 'private',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			github_id TEXT UNIQUE,
			uuid TEXT,
			exp DATETIME NOT NULL
		);`,

		`CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			content TEXT,
			media TEXT,
			privacy TEXT DEFAULT 'public',
			group_id INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (group_id) REFERENCES groups(id)
		);`,

		`CREATE TABLE IF NOT EXISTS post_visibility (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			post_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			FOREIGN KEY (post_id) REFERENCES posts(id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS followers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			follower_id INTEGER NOT NULL,
			followed_id INTEGER NOT NULL,
			status TEXT DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (follower_id) REFERENCES users(id),
			FOREIGN KEY (followed_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS groups (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			description TEXT,
			owner_id INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (owner_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS group_members (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			group_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			status TEXT DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (group_id) REFERENCES groups(id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			group_id INTEGER,
			owner_id INTEGER NOT NULL,
			title TEXT,
			description TEXT,
			start_date DATETIME,
			end_date DATETIME,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (group_id) REFERENCES groups(id),
			FOREIGN KEY (owner_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS event_options (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			event_id INTEGER NOT NULL,
			option_text TEXT,
			FOREIGN KEY (event_id) REFERENCES events(id)
		);`,

		`CREATE TABLE IF NOT EXISTS event_votes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			event_id INTEGER NOT NULL,
			option_id INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (event_id) REFERENCES events(id),
			FOREIGN KEY (option_id) REFERENCES event_options(id)
		);`,

		`CREATE TABLE IF NOT EXISTS group_chat (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			group_id INTEGER NOT NULL,
			sender_id INTEGER NOT NULL,
			message TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (group_id) REFERENCES groups(id),
			FOREIGN KEY (sender_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS private_chat (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			message TEXT,
			seen BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(id),
			FOREIGN KEY (receiver_id) REFERENCES users(id)
		);`,

		`CREATE TABLE IF NOT EXISTS post_reactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			post_id INTEGER NOT NULL,
			reaction_type TEXT,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (post_id) REFERENCES posts(id)
		);`,

		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			post_id INTEGER NOT NULL,
			comment_text TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (post_id) REFERENCES posts(id)
		);`,

		`CREATE TABLE IF NOT EXISTS notifications (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			sender_id INTEGER NOT NULL,
			type TEXT,
			reference_id INTEGER,
			content TEXT,
			action TEXT DEFAULT 'view',
			seen BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (sender_id) REFERENCES users(id)
		);`,
	}
	// ------------------------------------------------------------------------------
	for _, table := range tables {
		_, err := db.Exec(table);
		if err != nil {
			fmt.Printf("Error creating table: %s\n", err);
		}
	}
	fmt.Println("Database and tables created successfully");
}
//for to many rows
func SelectQuery(query string, args ...any) (*sql.Rows, error) {
	db, err := sql.Open("sqlite3", "./database/socialNetwork.db");
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err);
	}
	rows, er := db.Query(query, args...);
	if er != nil {
		return nil, fmt.Errorf("QUERY ERROR: %v", er);
	}
	db.Close();
	return rows, nil;
}

// for single row
func SelectOneRow(query string, args ...any) (*sql.Row, error) {
	db, err := sql.Open("sqlite3", "./database/socialNetwork.db");
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err);
	}
	row := db.QueryRow(query, args...);
	db.Close();
	return row, nil;
}

// for run query
func ExecQuery(query string, args ...any) (sql.Result, error) {
	db, err := sql.Open("sqlite3", "./database/socialNetwork.db");
	if err != nil {
		return nil, fmt.Errorf("OPEN ERROR: %v", err);
	}
	defer db.Close();
	rs, err := db.Exec(query, args...);
	if err != nil {
		return nil, fmt.Errorf("EXEC ERROR: %v", err);
	}
	return rs, nil;
}
