-- backend/schema.sql

-- Apaga a tabela se ela já existir, para o teste ser repetível
DROP TABLE IF EXISTS teste;

-- Cria uma tabela de teste
CREATE TABLE teste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mensagem TEXT NOT NULL
);

-- Insere uma única mensagem na tabela
INSERT INTO teste (mensagem) VALUES ('O Banco de Dados respondeu!');