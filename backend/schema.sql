-- backend/schema.sql

DROP TABLE IF EXISTS teste;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id INTEGER PRIMARY KEY,
    nome_usuario TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Filme (
  id_filme      INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario    INTEGER NOT NULL, -- quem cadastrou
  titulo        TEXT    NOT NULL,
  ano           INTEGER NOT NULL,
  duracao       INTEGER,           -- em minutos
  diretor       TEXT    NOT NULL,
  genero        TEXT,
  sinopse       TEXT,
  url_poster    TEXT,
  created_at    DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- evitar duplicação exata (mesmo título + ano + diretor)
CREATE UNIQUE INDEX IF NOT EXISTS ux_filme_titulo_ano_diretor ON Filme(titulo, ano, diretor);

-- ===============================
-- TABELA AVALIACAO
-- PK composta (id_usuario, id_filme) garante 1 avaliação por usuário por filme
-- ===============================
CREATE TABLE IF NOT EXISTS Avaliacao (
  id_usuario     INTEGER NOT NULL,
  id_filme       INTEGER NOT NULL,
  nota           REAL    NOT NULL CHECK (nota >= 0.0 AND nota <= 5.0),
  comentario     TEXT,
  data_avaliacao DATE    NOT NULL DEFAULT (date('now')),
  PRIMARY KEY (id_usuario, id_filme),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (id_filme) REFERENCES Filme(id_filme)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


-- TABELA LISTA

CREATE TABLE IF NOT EXISTS Lista (
  id_lista      INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario    INTEGER NOT NULL,
  nome_lista    TEXT    NOT NULL,
  descricao     TEXT,
  data_criacao  DATE    NOT NULL DEFAULT (date('now')),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- TABELA FILME_LISTA (associativa)
-- PK composta (id_lista, id_filme) evita duplicação do mesmo filme na mesma lista

CREATE TABLE IF NOT EXISTS Filme_Lista (
  id_lista    INTEGER NOT NULL,
  id_filme    INTEGER NOT NULL,
  ordem       INTEGER, -- opcional: posição do filme na lista
  PRIMARY KEY (id_lista, id_filme),
  FOREIGN KEY (id_lista) REFERENCES Lista(id_lista)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (id_filme) REFERENCES Filme(id_filme)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO usuario (nome_usuario, email, senha) VALUES ('admin', 'admin@email.com', 'admin');

INSERT INTO Filme (id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster) VALUES 
(1, 'Pulp Fiction: Tempo de Violência', 1994, 154, 'Quentin Tarantino', 'Crime, Drama', 'As vidas de dois assassinos, um boxeador e a esposa de um gângster se cruzam em uma série de contos violentos e cômicos.', '/images/pulp-fiction-poster.jpg'),
(1, 'Polar', 2019, 118, 'Jonas Åkerlund', 'Ação, Crime', 'Um assassino prestes a se aposentar se torna o alvo de um grupo de matadores mais jovens e impiedosos, enviados por seu antigo chefe.', '/images/polar-poster.jpg'),
(1, 'Meninas Malvadas', 2004, 97, 'Mark Waters', 'Comédia', 'Uma adolescente criada na África volta aos EUA e precisa navegar pela hierarquia social tóxica de seu novo colégio, liderado por um grupo de garotas populares.', '/images/meninas-malvadas-poster.jpg');