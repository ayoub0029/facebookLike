FROM golang:1.22.0
WORKDIR /backend
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
RUN chmod +x ./main
RUN ls -la
EXPOSE 8080
CMD ["./main"]  
