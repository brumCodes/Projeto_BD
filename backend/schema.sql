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
(1, 'Pulp Fiction: Tempo de Violência', 1994, 154, 'Quentin Tarantino', 'Crime, Drama', 'As vidas de dois assassinos, um boxeador e a esposa de um gângster se cruzam em uma série de contos violentos e cômicos.', 'https://a.ltrbxd.com/resized/film-poster/5/1/4/4/4/51444-pulp-fiction-0-1000-0-1500-crop.jpg'),
(1, 'Polar', 2019, 118, 'Jonas Åkerlund', 'Ação, Crime', 'Um assassino prestes a se aposentar se torna o alvo de um grupo de matadores mais jovens e impiedosos, enviados por seu antigo chefe.', '/images/polar-poster.jpg'),
(1, 'Meninas Malvadas', 2004, 97, 'Mark Waters', 'Comédia', 'Uma adolescente criada na África volta aos EUA e precisa navegar pela hierarquia social tóxica de seu novo colégio, liderado por um grupo de garotas populares.', '/images/meninas-malvadas-poster.jpg'),
(1, 'KPop Demon Hunters', 2025, 112, 'Maggie Kang', 'Fantasia', 'Quando não estão lotando estádios, as estrelas do K-pop Rumi, Mira e Zoey usam seus poderes secretos para proteger os fãs de ameaças sobrenaturais.', 'https://a.ltrbxd.com/resized/film-poster/7/2/0/9/5/3/720953-kpop-demon-hunters-0-1000-0-1500-crop.jpg'),
(1, 'Anora', 2024, 220, 'Sean Baker', 'Drama', 'A young sex worker from Brooklyn gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as his parents set out to get the marriage annulled.', 'https://a.ltrbxd.com/resized/film-poster/9/5/9/5/4/0/959540-anora-0-1000-0-1500-crop.jpg'),
(1, 'Wicked', 2024, 260, 'Jon M. Chu', 'Musical', 'Na Terra de Oz, uma jovem chamada Elphaba forma uma improvável amizade com uma estudante popular chamada Glinda. Após um encontro com o Mágico de Oz, o relacionamento delas logo chega a uma encruzilhada.', 'https://a.ltrbxd.com/resized/film-poster/3/3/7/0/3/6/337036-wicked-2024-0-1000-0-1500-crop.jpg'),
(1, 'Wicked: For Good', 2025, 230, 'Jon M. Chu', 'Musical', 'Demonizada como a Bruxa Má do Oeste, Elphaba vive no exílio, enquanto Glinda reside na Cidade Esmeralda. Quando uma multidão furiosa se levanta contra a Bruxa Má, ela precisa se unir com Glinda para transformar a si mesma e todo o Oz, para o bem.', 'https://a.ltrbxd.com/resized/film-poster/8/7/1/1/4/8/871148-wicked-for-good-0-1000-0-1500-crop.jpg'),
(1, 'A Substância', 2024, 217, 'Coralie Fargeat', 'Drama', 'Elisabeth Sparkle, renomada por um programa de aeróbica, enfrenta um golpe devastador quando seu chefe a demite. Em meio ao seu desespero, um laboratório lhe oferece uma substância que promete transformá-la em uma versão aprimorada.', 'https://a.ltrbxd.com/resized/film-poster/8/3/8/1/4/0/838140-the-substance-0-1000-0-1500-crop.jpg'),
(1, 'Traga Ela De Volta', 2025, 104, 'Danni Philippou, Michael Philippou', 'Terror', 'Traga Ela de Volta (Bring Her Back) é um filme de terror psicológico sobrenatural, dirigido por Danny e Michael Philippou, que acompanha dois meio-irmãos, Andy e Piper, que após a morte do pai, são adotados por Laura. A nova lar, uma casa isolada, esconde segredos e rituais ocultos que ameaçam a relação dos irmãos e a sanidade de todos.', 'https://a.ltrbxd.com/resized/film-poster/1/0/3/7/6/2/7/1037627-bring-her-back-0-1000-0-1500-crop.jpg'),
(1, 'Quarteto Fantástico: Primeiros Passos', 2025, 115, 'Matt Shakman', 'Ação, Ficção Cientifica', 'Um grupo de astronautas passa por uma tempestade cósmica durante seu voo experimental. Ao retornar à Terra, os tripulantes descobrem que possuem novas e bizarras habilidades. Reed Richards pode esticar seu corpo. Sua noiva, Susan Storm, ganha a habilidade de se tornar invisível. Seu irmão mais novo, Johnny Storm, adquiriu o poder de controlar o fogo e voar. Já o piloto Ben Grimm foi transformado em um monstro rochoso. Ao tentar compreender seus poderes, eles têm que lidar com novas ameaças.', 'https://a.ltrbxd.com/resized/film-poster/5/4/3/9/6/7/543967-the-fantastic-four-first-steps-0-1000-0-1500-crop.jpg'),
(1, 'Bottoms', 2023, 93, 'Emma Seligman', 'Comédia', 'Duas alunas não populares do último ano do ensino médio criam um clube da luta para tentar impressionar e conquistar líderes de torcida.', 'https://a.ltrbxd.com/resized/film-poster/7/3/1/2/2/2/731222-bottoms-0-1000-0-1500-crop.jpg'),
(1, 'O segredo de Brokeback Mountain', 2005, 134, 'Ang Lee', 'Romance', 'Jack e Ennis se conheceram em Wyoming, no verão de 1963, quando foram trabalhar para um rancheiro que criava ovelhas. Naquele ambiente solitário nas montanhas, eles acabam tendo um rápido contato sexual. Quando o trabalho no rancho acaba, cada um segue seu caminho. Ambos casaram e vivem com suas respectivas esposas. Por muitos anos, não se veem até que um dia, eles começam a marcar encontros esporádicos e mantêm um caso amoroso durante uns vinte anos.', 'https://a.ltrbxd.com/resized/film-poster/5/1/9/0/9/51909-brokeback-mountain-0-1000-0-1500-crop.jpg'),
(1, 'Superman', 2025, 129, 'James Gunn', 'Ação, Ficção Cientifica', 'Superman embarca em uma jornada para reconciliar sua herança kryptoniana com sua criação humana.', 'https://a.ltrbxd.com/resized/film-poster/9/5/7/0/5/0/957050-superman-2025-0-1000-0-1500-crop.jpg'),
(1, 'Acompanhante Perfeita', 2025, 97, 'Drew Hancock', 'Thriller', 'Uma viagem de fim de semana se torna sangrenta e violenta quando uma androide subserviente, criada para a companhia humana, simplesmente enlouquece.', 'https://a.ltrbxd.com/resized/film-poster/9/7/7/1/7/2/977172-companion-2025-0-1000-0-1500-crop.jpg'),
(1, 'Ainda Estou Aqui', 2024, 135, 'Wallter Sales', 'Drama', 'No início da década de 1970, o Brasil enfrenta o endurecimento da ditadura militar. No Rio de Janeiro, a família Paiva, formada pelo casal Rubens e Eunice e seus cinco filhos, vive à beira da praia em uma casa de portas abertas para os amigos. Um dia, Rubens é levado por militares à paisana e desaparece. Sua esposa é então obrigada a se reinventar e traçar um novo futuro para si e seus filhos enquanto tenta descobrir a verdade sobre o destino do marido, uma busca que se estenderia por décadas.', 'https://a.ltrbxd.com/resized/film-poster/9/0/1/6/7/1/901671-im-still-here-2024-0-1000-0-1500-crop.jpg'),
(1, 'Duna', 2021, 255, 'Denis Villeneuve', 'Aventura, Ficção Cientifica', 'Paul Atreides é um jovem brilhante, dono de um destino além de sua compreensão. Ele deve viajar para o planeta mais perigoso do universo para garantir o futuro de seu povo.', 'https://a.ltrbxd.com/resized/sm/upload/nx/8b/vs/gc/cDbNAY0KM84cxXhmj8f0dLWza3t-0-1000-0-1500-crop.jpg'),
(1, 'Vidas Passadas', 2023, 206, 'Celine Song', 'Drama, Romance', 'Nora e Hae Sung, duas amigas de infância profundamente conectadas, se separam depois de uma mudança. Duas décadas depois, elas se reencontram na cidade de Nova York para uma semana fatídica enquanto confrontam noções de destino, amor e escolhas.', 'https://a.ltrbxd.com/resized/film-poster/5/9/1/0/5/3/591053-past-lives-0-1000-0-1500-crop.jpg'),
(1, 'Pearl', 2022, 102, 'Ti West', 'Terror, Suspense', 'Seduzida pela magia do cinema, Pearl deseja uma vida glamourosa e de liberdade, o que entra em conflito direto com a realidade em que vive, resultando em uma catarse de ambições, tentações e repressões que despertam nela a vilã que sempre temeu se tornar.', 'https://a.ltrbxd.com/resized/film-poster/8/5/3/8/2/2/853822-pearl-0-1000-0-1500-crop.jpg'),
(1, 'Rivais', 2024, 131, 'Luca Guadagnino', 'Romance, Drama', 'Um campeão de tênis do Grand Slam se vê do outro lado da rede do outrora promissor e agora esgotado Patrick, seu ex-melhor amigo e ex-namorado de sua esposa.', 'https://a.ltrbxd.com/resized/film-poster/8/4/2/3/0/1/842301-challengers-0-1000-0-1500-crop.jpg'),
(1, 'Kill Bill: Vol. 1', 2003, 91, 'Quentin Tarantino', 'Ação', 'A ex-assassina conhecida apenas como Noiva acorda de um coma de quatro anos decidida a se vingar de Bill, seu ex-amante e chefe, que tentou matá-la no dia do casamento. Ela está motivada a acertar as contas com cada uma das pessoas envolvidas com a perda da filha, da festa de casamento e dos quatro anos de sua vida. Na jornada, a Noiva é submetida a dores físicas agonizantes ao enfrentar a inescrupulosa gangue de Bill, o Esquadrão Assassino de Víboras Mortais.', 'https://a.ltrbxd.com/resized/sm/upload/sw/w2/ep/v4/9O50TVszkz0dcP5g6Ej33UhR7vw-0-1000-0-1500-crop.jpg'),
(1, 'Midsommar', 2019, 171, 'Ari Aster', 'Terror', 'Após vivenciar uma tragédia pessoal, Dani vai com o namorado Christian e um grupo de amigos até a Suécia para participar de um festival local de verão. Mas, ao invés das férias tranquilas com a qual todos sonhavam, o grupo se depara com rituais bizarros de uma adoração pagã.', 'https://a.ltrbxd.com/resized/film-poster/4/5/9/5/6/4/459564-midsommar-0-1000-0-1500-crop.jpg'),
(1, 'Flow', 2024, 85, 'Gints Zilbalodis', 'Animação, Aventura', 'Gato é um animal solitário, mas quando seu lar é devastado por uma grande inundação, ele encontra refúgio em um barco povoado por várias espécies, e tem que se unir a elas apesar de suas diferenças.', 'https://a.ltrbxd.com/resized/film-poster/7/3/9/4/5/1/739451-flow-2024-0-1000-0-1500-crop.jpg'),
(1, 'Saltburn', 2023, 131, 'Emerald Fennell', 'Comédia, Drama', 'Felix Catton convida o amigo Oliver Quick para passar as férias de verão na mansão de sua família, na região de Saltburn. Com a chegada do garoto, uma série de eventos perturbadores atinge os Cattons.', 'https://a.ltrbxd.com/resized/film-poster/8/3/5/7/7/4/835774-saltburn-0-1000-0-1500-crop.jpg'),
(1, 'M3GAN', 2022, 102, 'Gerard Johnstone', 'Terror, Ficção Cientifica', 'M3GAN é uma maravilha da inteligência artificial, uma boneca realista programada para ser a melhor amiga de uma criança. Uma robótica brilhante dá a sua jovem sobrinha um protótipo M3GAN, mas a máquina logo se torna violenta.', 'https://a.ltrbxd.com/resized/film-poster/4/6/5/6/4/9/465649-m3gan-0-1000-0-1500-crop.jpg'),
(1, 'O Batman', 2022, 174, 'Matt Reeves', 'Crime, Mistério, Thriller', 'Após dois anos espreitando as ruas como Batman, Bruce Wayne se encontra nas profundezas mais sombrias de Gotham City. Com poucos aliados confiáveis, o vigilante solitário se estabelece como a personificação da vingança para a população.', 'https://a.ltrbxd.com/resized/film-poster/3/4/8/9/1/4/348914-the-batman-0-1000-0-1500-crop.jpg');