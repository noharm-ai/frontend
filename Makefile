COMPOSE = docker compose -f docker-compose.test.yml

.PHONY: e2e-up e2e-down e2e-rebuild e2e e2e-ui e2e-logs e2e-logs-backend e2e-db-reset

## Start the test infrastructure (postgres + backend)
e2e-up:
	$(COMPOSE) up -d

## Stop and remove test containers
e2e-down:
	$(COMPOSE) down

## Rebuild the backend image (after upstream changes)
e2e-rebuild:
	$(COMPOSE) build backend

## Show all service logs
e2e-logs:
	$(COMPOSE) logs -f

## Show backend logs only
e2e-logs-backend:
	$(COMPOSE) logs -f backend

## Reset the database (drop + recreate + re-seed)
e2e-db-reset:
	$(COMPOSE) stop backend
	$(COMPOSE) exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS noharm;"
	$(COMPOSE) exec -T postgres psql -U postgres -c "DROP OWNED BY demo_user;"
	$(COMPOSE) exec -T postgres psql -U postgres -c "DROP ROLE IF EXISTS demo_user;"
	$(COMPOSE) exec -T postgres psql -U postgres -c "DROP ROLE IF EXISTS api_user;"
	$(COMPOSE) exec -T postgres psql -U postgres -c "DROP ROLE IF EXISTS noharmcare;"
	$(COMPOSE) exec -T postgres psql -U postgres -c "CREATE DATABASE noharm;"
	$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d noharm -f /docker-entrypoint-initdb.d/db/noharm-public.sql
	$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d noharm -f /docker-entrypoint-initdb.d/db/noharm-create.sql
	$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d noharm -f /docker-entrypoint-initdb.d/db/noharm-newuser.sql
	$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d noharm -f /docker-entrypoint-initdb.d/db/noharm-triggers.sql
	$(COMPOSE) exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d noharm -f /docker-entrypoint-initdb.d/db/noharm-insert.sql
	$(COMPOSE) start backend

## Run e2e tests (headless) — resets DB first
e2e: e2e-db-reset
	VITE_APP_API_URL=http://localhost:5001 npx playwright test

## Run e2e tests in interactive UI mode (no auto-reset)
e2e-ui:
	VITE_APP_API_URL=http://localhost:5001 npx playwright test --ui
