package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func CreateDatabase() {
	db, err := sql.Open("sqlite3", "./Database/socialNetwork.db")
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
			exp DATETIME
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
			reaction_type INTEGER,
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

		`INSERT INTO users (first_name, last_name, email, password, date_of_birth, avatar, nickname, about_me, profile_status, github_id, uuid, exp) VALUES
			('Zakaria', 'Dev', 'zakaria.dev@example.com', 'hashedpassword1', '1995-08-12', 'https://example.com/avatar1.png', 'Zak', 'I love coding!', 'public', 'zakariaGH', '550e8400-e29b-41d4-a716-446655440000', '2030-01-01 12:00:00'),
			('Sarah', 'Johnson', 'sarah.j@example.com', 'hashedpassword2', '1992-04-25', 'https://example.com/avatar2.png', 'SarahJ', 'Tech enthusiast', 'private', 'sarahGH', '550e8400-e29b-41d4-a716-446655440001', '2030-01-02 12:00:00'),
			('Liam', 'Brown', 'liam.b@example.com', 'hashedpassword3', '1998-06-14', 'https://example.com/avatar3.png', 'LiamB', 'Full-stack developer', 'public', 'liamGH', '550e8400-e29b-41d4-a716-446655440002', '2030-01-03 12:00:00'),
			('Emma', 'White', 'emma.w@example.com', 'hashedpassword4', '2000-12-30', 'https://example.com/avatar4.png', 'EmmaW', 'Passionate about UI/UX', 'private', 'emmaGH', '550e8400-e29b-41d4-a716-446655440003', '2030-01-04 12:00:00'),
			('Noah', 'Smith', 'noah.s@example.com', 'hashedpassword5', '1993-11-22', 'https://example.com/avatar5.png', 'NoahS', 'Backend specialist', 'public', 'noahGH', '550e8400-e29b-41d4-a716-446655440004', '2030-01-05 12:00:00'),
			('Sophia', 'Davis', 'sophia.d@example.com', 'hashedpassword6', '1997-09-10', 'https://example.com/avatar6.png', 'SophiaD', 'Cybersecurity enthusiast', 'private', 'sophiaGH', '550e8400-e29b-41d4-a716-446655440005', '2030-01-06 12:00:00'),
			('William', 'Miller', 'william.m@example.com', 'hashedpassword7', '1991-07-03', 'https://example.com/avatar7.png', 'WillM', 'Cloud computing geek', 'public', 'williamGH', '550e8400-e29b-41d4-a716-446655440006', '2030-01-07 12:00:00'),
			('Olivia', 'Wilson', 'olivia.w@example.com', 'hashedpassword8', '1996-05-20', 'https://example.com/avatar8.png', 'OliviaW', 'AI and ML researcher', 'private', 'oliviaGH', '550e8400-e29b-41d4-a716-446655440007', '2030-01-08 12:00:00'),
			('James', 'Moore', 'james.m@example.com', 'hashedpassword9', '1994-02-17', 'https://example.com/avatar9.png', 'JamesM', 'Game developer', 'public', 'jamesGH', '550e8400-e29b-41d4-a716-446655440008', '2030-01-09 12:00:00'),
			('Ava', 'Taylor', 'ava.t@example.com', 'hashedpassword10', '1999-03-05', 'https://example.com/avatar10.png', 'AvaT', 'Blockchain enthusiast', 'private', 'avaGH', '550e8400-e29b-41d4-a716-446655440009', '2030-01-10 12:00:00');`,
	}

	// -----
	for _, table := range tables {
		_, err := db.Exec(table)
		if err != nil {
			fmt.Printf("Error creating table: %s\n", err)
		}
	}

	fmt.Println("Database and tables created successfully")
}
