### Creating a Logger
Use the NewLogger() function to initialize a logger:

```go
var logger = global.NewLogger()
```
### Logging Information
To log informational messages, use InfoLogger :

```go
logger.InfoLogger.Println("some info here")
```
output
```
INFO    2025/02/17 18:23:30 main.go:20: some info here
```
### Logging Errors
To log errors with file and line number details, use the Error method:

```go
logger.Error("error: %v", SomeError)
```
output
```
ERROR   2025/02/17 18:23:30 /home/rserraf/Desktop/facebookLike/backend/main.go:21
        : error error text
```
### Additional Methods
Since InfoLogger is based on os.Stdout, it supports various functions:

```go
logger.InfoLogger.Fatal("fatal error") // Exits the program
logger.InfoLogger.Panic("panic error") // Panics with message
logger.InfoLogger.Writer()             // Returns the logger's writer
logger.InfoLogger.Prefix()             // Retrieves the log prefix
```





