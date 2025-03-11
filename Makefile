.PHONY: run-backend run-frontend run free

run-backend:
	cd backend && go run main.go &

run-frontend:
	cd frontend/social-network && npm run dev &

run: run-backend run-frontend

free:
	pkill -f node
	pkill -f main
