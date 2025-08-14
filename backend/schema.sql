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
(1, 'Meninas Malvadas', 2004, 97, 'Mark Waters', 'Comédia', 'Uma adolescente criada na África volta aos EUA e precisa navegar pela hierarquia social tóxica de seu novo colégio, liderado por um grupo de garotas populares.', '/images/meninas-malvadas-poster.jpg'),
(1, 'KPop Demon Hunters', 2025, 112, 'Maggie Kang', 'Fantasia', 'Quando não estão lotando estádios, as estrelas do K-pop Rumi, Mira e Zoey usam seus poderes secretos para proteger os fãs de ameaças sobrenaturais.', 'https://a.ltrbxd.com/resized/film-poster/7/2/0/9/5/3/720953-kpop-demon-hunters-0-1000-0-1500-crop.jpg'),
(1, 'Anora', 2024, 220, 'Sean Baker', 'Drama', 'A young sex worker from Brooklyn gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as his parents set out to get the marriage annulled.', 'https://a.ltrbxd.com/resized/film-poster/9/5/9/5/4/0/959540-anora-0-1000-0-1500-crop.jpg'),
(1, 'Wicked', 2024, 260, 'Jon M. Chu', 'Musical', 'Na Terra de Oz, uma jovem chamada Elphaba forma uma improvável amizade com uma estudante popular chamada Glinda. Após um encontro com o Mágico de Oz, o relacionamento delas logo chega a uma encruzilhada.', 'https://a.ltrbxd.com/resized/film-poster/3/3/7/0/3/6/337036-wicked-2024-0-1000-0-1500-crop.jpg'),
(1, 'Wicked: For Good', 2025, 230, 'Jon M. Chu', 'Musical', 'Demonizada como a Bruxa Má do Oeste, Elphaba vive no exílio, enquanto Glinda reside na Cidade Esmeralda. Quando uma multidão furiosa se levanta contra a Bruxa Má, ela precisa se unir com Glinda para transformar a si mesma e todo o Oz, para o bem.', 'https://a.ltrbxd.com/resized/film-poster/8/7/1/1/4/8/871148-wicked-for-good-0-1000-0-1500-crop.jpg'),
(1, 'A Substância', 2024, 217, 'Coralie Fargeat', 'Drama', 'Elisabeth Sparkle, renomada por um programa de aeróbica, enfrenta um golpe devastador quando seu chefe a demite. Em meio ao seu desespero, um laboratório lhe oferece uma substância que promete transformá-la em uma versão aprimorada.', 'https://a.ltrbxd.com/resized/film-poster/8/3/8/1/4/0/838140-the-substance-0-1000-0-1500-crop.jpg'),
(1, 'Traga Ela De Volta', 2025, 104, 'Danni Philippou, Michael Philippou', 'Terror', 'Traga Ela de Volta (Bring Her Back) é um filme de terror psicológico sobrenatural, dirigido por Danny e Michael Philippou, que acompanha dois meio-irmãos, Andy e Piper, que após a morte do pai, são adotados por Laura. A nova lar, uma casa isolada, esconde segredos e rituais ocultos que ameaçam a relação dos irmãos e a sanidade de todos.', 'https://a.ltrbxd.com/resized/film-poster/1/0/3/7/6/2/7/1037627-bring-her-back-0-1000-0-1500-crop.jpg'),
(1, 'Quarteto Fantástico: Primeiros Passos', 2025, 115, 'Matt Shakman', 'Ação, Ficção Cientifica', 'Um grupo de astronautas passa por uma tempestade cósmica durante seu voo experimental. Ao retornar à Terra, os tripulantes descobrem que possuem novas e bizarras habilidades. Reed Richards pode esticar seu corpo. Sua noiva, Susan Storm, ganha a habilidade de se tornar invisível. Seu irmão mais novo, Johnny Storm, adquiriu o poder de controlar o fogo e voar. Já o piloto Ben Grimm foi transformado em um monstro rochoso. Ao tentar compreender seus poderes, eles têm que lidar com novas ameaças.', 'https://a.ltrbxd.com/resized/film-poster/5/4/3/9/6/7/543967-the-fantastic-four-first-steps-0-1000-0-1500-crop.jpg');