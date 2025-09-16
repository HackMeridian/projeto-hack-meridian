# Dockerfile para a API de Debêntures em Rust

# Usa a imagem oficial do Rust para build
FROM rust:1.75-slim as builder

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY Cargo.toml Cargo.lock ./

# Cria um projeto dummy para cache das dependências
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copia o código fonte
COPY src ./src

# Build da aplicação
RUN cargo build --release

# Imagem final
FROM debian:bookworm-slim

# Instala dependências de runtime
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root
RUN useradd -r -s /bin/false appuser

# Define o diretório de trabalho
WORKDIR /app

# Copia o binário compilado
COPY --from=builder /app/target/release/debentures-api /app/debentures-api

# Muda a propriedade para o usuário não-root
RUN chown -R appuser:appuser /app

# Muda para o usuário não-root
USER appuser

# Expõe a porta
EXPOSE 3000

# Define variáveis de ambiente padrão
ENV RUST_LOG=info
ENV PORT=3000

# Comando para executar a aplicação
CMD ["./debentures-api"]
