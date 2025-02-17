package global

import (
	"encoding/json"
	"fmt"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"net/http"
	"os"
	"runtime"
)

func JsonResponse(w http.ResponseWriter, status int, message any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(message)
}

func StringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

const (
	colorBlue  = "\033[34m"
	colorRed   = "\033[31m"
	colorReset = "\033[0m"
)

type Logger struct {
	InfoLogger  *log.Logger
	errorLogger *log.Logger
}

// how to use
//
//	var logger = NewLogger()
//	logger.Info("Starting application...")
//	logger.Error("Failed to connect to database: %s", err)
//
// if you want just print number of line you can use "Simplelog" like this
//
//	logger.Simplelog.Println("text")
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
		l.errorLogger.Printf("%s:%d:\n %s", file, line, msg)
	}
}
