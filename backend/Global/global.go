package global

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	database "socialNetwork/Database"

	"github.com/gorilla/websocket"
)

var (
	ErrMethod         = errors.New("method not allowed")
	ErrServer         = errors.New("an unexpected error occurred. please try again later")
	ErrInvalidRequest = errors.New("invalid request")
	ErrUnauthorized   = errors.New("unauthorized access")
)

func JsonResponse(w http.ResponseWriter, status int, message any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(message)
}

func CheckEmpty(args ...string) bool {
	for _, arg := range args {
		if arg == "" {
			return true
		}
	}
	return false
}

type Client struct {
	UserId uint64 `json:"userid"`
	State  bool   `json:"state"`
	Conn   *websocket.Conn
}

// ----------------------------------------------------------- logger
const (
	colorBlue  = "\033[34m"
	colorRed   = "\033[31m"
	colorReset = "\033[0m"
)

type Logger struct {
	InfoLogger  *log.Logger
	errorLogger *log.Logger
}

func GetIdsUsersOfGroup(groupId uint64) ([]uint64, error) {
	rows, err := database.SelectQuery("SELECT user_id FROM group_members WHERE group_id = ?", groupId)
	if err != nil {
		return nil, err
	}
	var id uint64
	var ids []uint64
	for rows.Next() {
		err = rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return ids, nil
}


func GetFullNameById(id uint) (string, error) {
	row, err := database.SelectOneRow("SELECT first_name, last_name FROM users WHERE id = ?", id)
	if err != nil {
		return "", err
	}
	var fn string
	var ln string
	if err := row.Scan(&fn, &ln); err != nil {
		return "", err
	}
	return fn + " " + ln, nil
}

// how to use
//
//	var logger = NewLogger()
//	logger.Error("Failed to connect to database: %s", err)
//
// this func print path of file and number of line and time
//
// if you want just print number of line you can use "InfoLogger" like this
//
//	logger.InfoLogger.Println("text")
func NewLogger() *Logger {
	return &Logger{
		InfoLogger:  log.New(os.Stdout, colorBlue+"INFO\t"+colorReset, log.Ldate|log.Ltime|log.Lshortfile),
		errorLogger: log.New(os.Stderr, colorRed+"ERROR\t"+colorReset, log.Ldate|log.Ltime),
	}
}

func (l *Logger) Error(format string, v ...interface{}) {
	_, file, line, ok := runtime.Caller(1)
	if ok {
		msg := fmt.Sprintf(format, v...)
		l.errorLogger.Printf("%s:%d\n\t: %s", file, line, msg)
	}
}

// -------------------------------------------------------------------------end logger
