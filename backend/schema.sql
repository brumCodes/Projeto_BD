-- backend/schema.sql

DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id INTEGER PRIMARY KEY,
    nome_usuario TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

INSERT INTO usuario (nome_usuario, senha) VALUES ('admin', 'admin');