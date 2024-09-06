
web: | close build-web run-web ## Performs all commands necessary to run all backend+web projects (db, api, app) in docker

## ------------------------------------------------------------------------------
## Setup/Cleanup Commands
## ------------------------------------------------------------------------------

# setup: ## Prepares the environment variables used by all project docker containers
# 	@echo "==============================================="
# 	@echo "Make: setup - copying env.docker to .env"
# 	@echo "==============================================="
# 	@cp -i env_config/env.docker .env

close: ## Closes all project containers
	@echo "==============================================="
	@echo "Make: close - closing Docker containers"
	@echo "==============================================="
	@docker compose -f docker-compose.yml down

clean: ## Closes and cleans (removes) all project containers
	@echo "==============================================="
	@echo "Make: clean - closing and cleaning Docker containers"
	@echo "==============================================="
	@docker compose -f docker-compose.yml down -v --rmi all --remove-orphans

## ------------------------------------------------------------------------------
## Build/Run 
## ------------------------------------------------------------------------------

build-web: ## Builds all backend+web containers
	@echo "==============================================="
	@echo "Make: build-web - building web images"
	@echo "==============================================="
	@docker compose -f docker-compose.yml build dev

run-web: ## Runs all backend+web containers
	@echo "==============================================="
	@echo "Make: run-web - running web images"
	@echo "==============================================="
	@docker compose -f docker-compose.yml up -d dev