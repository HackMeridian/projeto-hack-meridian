# Makefile para a API de Debêntures em Rust

.PHONY: help build run test clean dev install

# Variáveis
CARGO = cargo
RUST_LOG = debentures_api=debug,tower_http=debug

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências
	$(CARGO) build

build: ## Compila o projeto
	$(CARGO) build --release

run: ## Executa a API
	RUST_LOG=$(RUST_LOG) $(CARGO) run

dev: ## Executa em modo desenvolvimento
	RUST_LOG=$(RUST_LOG) $(CARGO) run

test: ## Executa os testes
	$(CARGO) test

clean: ## Limpa arquivos de build
	$(CARGO) clean

check: ## Verifica o código sem compilar
	$(CARGO) check

clippy: ## Executa o clippy para verificar o código
	$(CARGO) clippy -- -D warnings

fmt: ## Formata o código
	$(CARGO) fmt

docker-build: ## Constrói a imagem Docker
	docker build -t debentures-api .

docker-run: ## Executa a API no Docker
	docker run -p 3000:3000 --env-file .env debentures-api

# Comandos de desenvolvimento
watch: ## Executa com watch para desenvolvimento
	$(CARGO) watch -x run

# Comandos de deploy
deploy-staging: ## Deploy para staging
	@echo "Deploy para staging não implementado"

deploy-prod: ## Deploy para produção
	@echo "Deploy para produção não implementado"
