package database

import (
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func InitializeMigrations() error {
	m, err := migrate.New(
		"file://Database/migrations/sqlite/",
		"sqlite3://Database/socialNetwork.db?cache=shared&_fk=1")
	if err != nil {
		return fmt.Errorf("failed to initialize migrations: %v", err)
	}
	defer m.Close()
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %v", err)
	}

	fmt.Println("Migrations completed successfully")
	return nil
}
