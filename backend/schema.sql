DROP TABLE IF EXISTS Filme_Lista;
DROP TABLE IF EXISTS Avaliacao;
DROP TABLE IF EXISTS Lista;
DROP TABLE IF EXISTS Filme;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS teste;

CREATE TABLE usuario (
    id              INTEGER PRIMARY KEY,
    nome_usuario    TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    senha           TEXT NOT NULL,
    url_avatar      VARCHAR(255)
);

CREATE TABLE Filme (
    id_filme      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario    INTEGER NOT NULL,
    titulo        TEXT    NOT NULL,
    ano           INTEGER NOT NULL,
    duracao       INTEGER,
    diretor       TEXT    NOT NULL,
    genero        TEXT,
    sinopse       TEXT,
    url_poster    TEXT,
    created_at    DATETIME DEFAULT (datetime('now')),
    media_avaliacao REAL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_filme_titulo_ano_diretor ON Filme(titulo, ano, diretor);

CREATE TABLE Avaliacao (
    id_avaliacao    INTEGER PRIMARY KEY AUTOINCREMENT, 
    id_usuario      INTEGER NOT NULL,
    id_filme        INTEGER NOT NULL,
    nota            REAL NOT NULL CHECK (nota >= 0.0 AND nota <= 5.0),
    comentario      TEXT,
    data_avaliacao  DATE NOT NULL DEFAULT (date('now')),
    UNIQUE (id_usuario, id_filme),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_filme) REFERENCES Filme(id_filme)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Lista (
    id_lista      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario    INTEGER NOT NULL,
    nome_lista    TEXT    NOT NULL,
    descricao     TEXT,
    data_criacao  DATE    NOT NULL DEFAULT (date('now')),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Filme_Lista (
  id_lista    INTEGER NOT NULL,
  id_filme    INTEGER NOT NULL,
  ordem       INTEGER, 
  data_adicionado DATETIME NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (id_lista, id_filme),
  FOREIGN KEY (id_lista) REFERENCES Lista(id_lista)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (id_filme) REFERENCES Filme(id_filme)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE CurtidasAvaliacao (
    id_avaliacao    INTEGER NOT NULL,
    id_usuario      INTEGER NOT NULL,
    data_curtida    DATETIME NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (id_avaliacao, id_usuario),
    FOREIGN KEY (id_avaliacao) REFERENCES Avaliacao(id_avaliacao) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);


INSERT INTO usuario (nome_usuario, email, senha) VALUES ('admin', 'admin@email.com', 'admin');

INSERT INTO Filme (id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster, media_avaliacao) VALUES 
(1, 'Pulp Fiction: Tempo de Violência', 1994, 154, 'Quentin Tarantino', 'Drama', 'As vidas de dois assassinos, um boxeador e a esposa de um gângster se cruzam em uma série de contos violentos e cômicos.', 'https://a.ltrbxd.com/resized/film-poster/5/1/4/4/4/51444-pulp-fiction-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Meninas Malvadas', 2004, 97, 'Mark Waters', 'Comédia', 'Uma adolescente criada na África volta aos EUA e precisa navegar pela hierarquia social tóxica de seu novo colégio, liderado por um grupo de garotas populares.', '/images/meninas-malvadas-poster.jpg', 0.0),
(1, 'KPop Demon Hunters', 2025, 112, 'Maggie Kang', 'Animação', 'Quando não estão lotando estádios, as estrelas do K-pop Rumi, Mira e Zoey usam seus poderes secretos para proteger os fãs de ameaças sobrenaturais.', 'https://a.ltrbxd.com/resized/film-poster/7/2/0/9/5/3/720953-kpop-demon-hunters-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Anora', 2024, 220, 'Sean Baker', 'Drama', 'Anora, uma jovem profissional do sexo do Brooklyn, tem a chance de viver sua história de Cinderela quando conhece o filho de um oligarca e se casa impulsivamente com ele. Quando a notícia chega à Rússia, seu conto de fadas é ameaçado, pois os pais dele viajam a Nova York para anular o casamento.', 'https://a.ltrbxd.com/resized/film-poster/9/5/9/5/4/0/959540-anora-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Wicked', 2024, 260, 'Jon M. Chu', 'Musical', 'Na Terra de Oz, uma jovem chamada Elphaba forma uma improvável amizade com uma estudante popular chamada Glinda. Após um encontro com o Mágico de Oz, o relacionamento delas logo chega a uma encruzilhada.', 'https://a.ltrbxd.com/resized/film-poster/3/3/7/0/3/6/337036-wicked-2024-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Ainda Estou Aqui', 2024, 135, 'Wallter Sales', 'Drama', 'No início da década de 1970, o Brasil enfrenta o endurecimento da ditadura militar. No Rio de Janeiro, a família Paiva, formada pelo casal Rubens e Eunice e seus cinco filhos, vive à beira da praia em uma casa de portas abertas para os amigos. Um dia, Rubens é levado por militares à paisana e desaparece. Sua esposa é então obrigada a se reinventar e traçar um novo futuro para si e seus filhos enquanto tenta descobrir a verdade sobre o destino do marido, uma busca que se estenderia por décadas.', 'https://a.ltrbxd.com/resized/film-poster/9/0/1/6/7/1/901671-im-still-here-2024-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Wicked: For Good', 2025, 230, 'Jon M. Chu', 'Musical', 'Demonizada como a Bruxa Má do Oeste, Elphaba vive no exílio, enquanto Glinda reside na Cidade Esmeralda. Quando uma multidão furiosa se levanta contra a Bruxa Má, ela precisa se unir com Glinda para transformar a si mesma e todo o Oz, para o bem.', 'https://a.ltrbxd.com/resized/film-poster/8/7/1/1/4/8/871148-wicked-for-good-0-1000-0-1500-crop.jpg', 0.0),
(1, 'A Substância', 2024, 217, 'Coralie Fargeat', 'Drama', 'Elisabeth Sparkle, renomada por um programa de aeróbica, enfrenta um golpe devastador quando seu chefe a demite. Em meio ao seu desespero, um laboratório lhe oferece uma substância que promete transformá-la em uma versão aprimorada.', 'https://a.ltrbxd.com/resized/film-poster/8/3/8/1/4/0/838140-the-substance-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Traga Ela De Volta', 2025, 104, 'Danni Philippou, Michael Philippou', 'Terror', 'Traga Ela de Volta (Bring Her Back) é um filme de terror psicológico sobrenatural, dirigido por Danny e Michael Philippou, que acompanha dois meio-irmãos, Andy e Piper, que após a morte do pai, são adotados por Laura. A nova lar, uma casa isolada, esconde segredos e rituais ocultos que ameaçam a relação dos irmãos e a sanidade de todos.', 'https://a.ltrbxd.com/resized/film-poster/1/0/3/7/6/2/7/1037627-bring-her-back-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Superman', 2025, 129, 'James Gunn', 'Ficção Cientifica', 'Superman embarca em uma jornada para reconciliar sua herança kryptoniana com sua criação humana.', 'https://a.ltrbxd.com/resized/film-poster/9/5/7/0/5/0/957050-superman-2025-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Pearl', 2022, 102, 'Ti West', 'Terror', 'Seduzida pela magia do cinema, Pearl deseja uma vida glamourosa e de liberdade, o que entra em conflito direto com a realidade em que vive, resultando em uma catarse de ambições, tentações e repressões que despertam nela a vilã que sempre temeu se tornar.', 'https://a.ltrbxd.com/resized/film-poster/8/5/3/8/2/2/853822-pearl-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Polar', 2019, 118, 'Jonas Åkerlund', 'Ação', 'Um assassino prestes a se aposentar se torna o alvo de um grupo de matadores mais jovens e impiedosos, enviados por seu antigo chefe.', 'https://a.ltrbxd.com/resized/film-poster/4/1/4/7/6/3/414763-polar-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Quarteto Fantástico: Primeiros Passos', 2025, 115, 'Matt Shakman', 'Ação, Ficção Cientifica', 'Um grupo de astronautas passa por uma tempestade cósmica durante seu voo experimental. Ao retornar à Terra, os tripulantes descobrem que possuem novas e bizarras habilidades. Reed Richards pode esticar seu corpo. Sua noiva, Susan Storm, ganha a habilidade de se tornar invisível. Seu irmão mais novo, Johnny Storm, adquiriu o poder de controlar o fogo e voar. Já o piloto Ben Grimm foi transformado em um monstro rochoso. Ao tentar compreender seus poderes, eles têm que lidar com novas ameaças.', 'https://a.ltrbxd.com/resized/film-poster/5/4/3/9/6/7/543967-the-fantastic-four-first-steps-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Bottoms', 2023, 93, 'Emma Seligman', 'Comédia', 'Duas alunas não populares do último ano do ensino médio criam um clube da luta para tentar impressionar e conquistar líderes de torcida.', 'https://a.ltrbxd.com/resized/film-poster/7/3/1/2/2/2/731222-bottoms-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Crepúsculo', 2008, 122, 'Catherine Hardwicke', 'Romance', 'Bella Swan se muda para a pequena cidade de Forks e se apaixona por Edward Cullen, um vampiro. Eles enfrentam desafios e perigos enquanto tentam manter seu amor em segredo.', 'https://a.ltrbxd.com/resized/film-poster/4/7/4/6/9/47469-twilight-0-1000-0-1500-crop.jpg', 0.0),
(1, 'O Segredo De Brokeback Mountain', 2005, 134, 'Ang Lee', 'Romance', 'Jack e Ennis se conheceram em Wyoming, no verão de 1963, quando foram trabalhar para um rancheiro que criava ovelhas. Naquele ambiente solitário nas montanhas, eles acabam tendo um rápido contato sexual. Quando o trabalho no rancho acaba, cada um segue seu caminho. Ambos casaram e vivem com suas respectivas esposas. Por muitos anos, não se veem até que um dia, eles começam a marcar encontros esporádicos e mantêm um caso amoroso durante uns vinte anos.', 'https://a.ltrbxd.com/resized/film-poster/5/1/9/0/9/51909-brokeback-mountain-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Acompanhante Perfeita', 2025, 97, 'Drew Hancock', 'Thriller', 'Uma viagem de fim de semana se torna sangrenta e violenta quando uma androide subserviente, criada para a companhia humana, simplesmente enlouquece.', 'https://a.ltrbxd.com/resized/film-poster/9/7/7/1/7/2/977172-companion-2025-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Duna', 2021, 255, 'Denis Villeneuve', 'Ficção Cientifica', 'Paul Atreides é um jovem brilhante, dono de um destino além de sua compreensão. Ele deve viajar para o planeta mais perigoso do universo para garantir o futuro de seu povo.', 'https://a.ltrbxd.com/resized/sm/upload/nx/8b/vs/gc/cDbNAY0KM84cxXhmj8f0dLWza3t-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Vidas Passadas', 2023, 206, 'Celine Song', 'Romance', 'Nora e Hae Sung, duas amigas de infância profundamente conectadas, se separam depois de uma mudança. Duas décadas depois, elas se reencontram na cidade de Nova York para uma semana fatídica enquanto confrontam noções de destino, amor e escolhas.', 'https://a.ltrbxd.com/resized/film-poster/5/9/1/0/5/3/591053-past-lives-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Rivais', 2024, 131, 'Luca Guadagnino', 'Romance, Drama', 'Um campeão de tênis do Grand Slam se vê do outro lado da rede do outrora promissor e agora esgotado Patrick, seu ex-melhor amigo e ex-namorado de sua esposa.', 'https://a.ltrbxd.com/resized/film-poster/8/4/2/3/0/1/842301-challengers-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Kill Bill: Vol. 1', 2003, 91, 'Quentin Tarantino', 'Ação', 'A ex-assassina conhecida apenas como Noiva acorda de um coma de quatro anos decidida a se vingar de Bill, seu ex-amante e chefe, que tentou matá-la no dia do casamento. Ela está motivada a acertar as contas com cada uma das pessoas envolvidas com a perda da filha, da festa de casamento e dos quatro anos de sua vida. Na jornada, a Noiva é submetida a dores físicas agonizantes ao enfrentar a inescrupulosa gangue de Bill, o Esquadrão Assassino de Víboras Mortais.', 'https://a.ltrbxd.com/resized/sm/upload/sw/w2/ep/v4/9O50TVszkz0dcP5g6Ej33UhR7vw-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Midsommar', 2019, 171, 'Ari Aster', 'Terror', 'Após vivenciar uma tragédia pessoal, Dani vai com o namorado Christian e um grupo de amigos até a Suécia para participar de um festival local de verão. Mas, ao invés das férias tranquilas com a qual todos sonhavam, o grupo se depara com rituais bizarros de uma adoração pagã.', 'https://a.ltrbxd.com/resized/film-poster/4/5/9/5/6/4/459564-midsommar-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Flow', 2024, 85, 'Gints Zilbalodis', 'Animação', 'Gato é um animal solitário, mas quando seu lar é devastado por uma grande inundação, ele encontra refúgio em um barco povoado por várias espécies, e tem que se unir a elas apesar de suas diferenças.', 'https://a.ltrbxd.com/resized/film-poster/7/3/9/4/5/1/739451-flow-2024-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Saltburn', 2023, 131, 'Emerald Fennell', 'Comédia', 'Felix Catton convida o amigo Oliver Quick para passar as férias de verão na mansão de sua família, na região de Saltburn. Com a chegada do garoto, uma série de eventos perturbadores atinge os Cattons.', 'https://a.ltrbxd.com/resized/film-poster/8/3/5/7/7/4/835774-saltburn-0-1000-0-1500-crop.jpg', 0.0),
(1, 'M3GAN', 2022, 102, 'Gerard Johnstone', 'Terror', 'M3GAN é uma maravilha da inteligência artificial, uma boneca realista programada para ser a melhor amiga de uma criança. Uma robótica brilhante dá a sua jovem sobrinha um protótipo M3GAN, mas a máquina logo se torna violenta.', 'https://a.ltrbxd.com/resized/film-poster/4/6/5/6/4/9/465649-m3gan-0-1000-0-1500-crop.jpg', 0.0),
(1, 'O Batman', 2022, 174, 'Matt Reeves', 'Ação', 'Após dois anos espreitando as ruas como Batman, Bruce Wayne se encontra nas profundezas mais sombrias de Gotham City. Com poucos aliados confiáveis, o vigilante solitário se estabelece como a personificação da vingança para a população.', 'https://a.ltrbxd.com/resized/film-poster/3/4/8/9/1/4/348914-the-batman-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Coraline', 2009, 100, 'Henry Selick', 'Animação', 'Coraline Jones é uma menina que se muda com seus pais para uma nova casa. Entediada com a vida real, ela descobre uma porta secreta que a leva a um mundo paralelo onde tudo parece perfeito. No entanto, ela logo percebe que esse mundo esconde segredos sombrios.', 'https://a.ltrbxd.com/resized/film-poster/4/2/7/7/9/42779-coraline-0-2000-0-3000-crop.jpg', 0.0),
(1, 'Clube Da Luta', 1999, 139, 'David Fincher', 'Drama', 'Um homem insatisfeito com sua vida encontra um novo propósito ao conhecer Tyler Durden, um vendedor de sabonetes carismático. Juntos, eles fundam o Clube da Luta, um espaço onde homens podem se libertar das pressões sociais e redescobrir sua masculinidade.', 'https://a.ltrbxd.com/resized/film-poster/5/1/5/6/8/51568-fight-club-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Titanic', 1997, 195, 'James Cameron', 'Romance', 'Jack Dawson e Rose DeWitt Bukater se apaixonam a bordo do navio Titanic, que afunda após colidir com um iceberg. A história deles é contada em meio à tragédia do naufrágio.', 'https://a.ltrbxd.com/resized/film-poster/5/1/5/2/4/51524-titanic-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Barbie', 2023, 114, 'Greta Gerwig', 'Comédia', 'Barbie e Ken vivem em Barbieland, um mundo perfeito. Mas quando Barbie começa a questionar sua existência, ela e Ken partem para o mundo real em busca de respostas.', 'https://a.ltrbxd.com/resized/film-poster/2/7/7/0/6/4/277064-barbie-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Vingadores: Endgame', 2019, 181, 'Anthony Russo, Joe Russo', 'Ficção Científica', 'Os Vingadores tentam reverter os danos causados por Thanos em Vingadores: Guerra Infinita. Eles viajam no tempo para coletar as Joias do Infinito e enfrentar o Titã Louco.', 'https://a.ltrbxd.com/resized/film-poster/2/2/6/6/6/0/226660-avengers-endgame-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Harry Potter e a Pedra Filosofal', 2001, 152, 'Chris Columbus', 'Aventura', 'Harry Potter descobre que é um bruxo e é convidado a estudar na Escola de Magia e Bruxaria de Hogwarts. Lá, ele faz amigos e enfrenta desafios mágicos.', 'https://a.ltrbxd.com/resized/sm/upload/5t/cj/6w/6e/harrypotter2-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Frozen', 2013, 102, 'Chris Buck, Jennifer Lee', 'Animação', 'Quando a rainha Elsa acidentalmente lança um feitiço que congela o reino de Arendelle, sua irmã Anna parte em uma jornada para encontrar Elsa e reverter o feitiço.', 'https://a.ltrbxd.com/resized/sm/upload/6w/m8/pw/94/eFnGmj63QPUpK7QUWSOUhypIQOT-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Pânico', 2022, 114, 'Matt Bettinelli-Olpin, Tyler Gillett', 'Terror', 'Vinte e cinco anos após uma série de assassinatos chocantes que abalaram a cidade de Woodsboro, um novo assassino assume a máscara do Ghostface e começa a perseguir um grupo de adolescentes para ressuscitar segredos do passado.', 'https://a.ltrbxd.com/resized/film-poster/5/7/2/1/1/9/572119-scream-0-1000-0-1500-crop.jpg', 0.0),
(1, 'O Diabo Veste Prada', 2006, 109, 'David Frankel', 'Comédia', 'Andrea Sachs, uma jovem jornalista, consegue um emprego como assistente da poderosa editora de moda Miranda Priestly. Apesar de não se interessar por moda, Andrea aprende a lidar com o mundo glamouroso e exigente da indústria.', 'https://a.ltrbxd.com/resized/film-poster/5/1/7/1/2/51712-the-devil-wears-prada-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Jurassic World: Recomeço', 2025, 134, 'Gareth Edwards', 'Aventura', 'Agentes habilidosos viajam para uma instalação de pesquisa em uma ilha para obter DNA que pode salvar vidas de dinossauros. À medida que a missão ultrassecreta se torna cada vez mais perigosa, eles logo fazem uma descoberta sinistra e chocante que tem sido escondida do mundo por décadas.', 'https://a.ltrbxd.com/resized/film-poster/1/1/1/7/9/2/6/1117926-jurassic-world-rebirth-0-2000-0-3000-crop.jpg', 0.0),
(1, 'Avatar', 2009, 162, 'James Cameron', 'Ficção Cientifica', 'Jake Sully é um ex-fuzileiro naval paraplégico que é enviado para Pandora, uma lua habitada por seres azuis chamados Navi. Ele se infiltra na cultura dos Navi usando um corpo avatar, mas acaba se apaixonando por Neytiri, uma princesa Navi.', 'https://a.ltrbxd.com/resized/sm/upload/1p/mh/li/l2/b7nR3eKeTOwHPKmDLUWunIGasKo-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Me Chame Pelo Seu Nome', 2017, 132, 'Luca Guadagnino', 'Romance', 'Durante o verão de 1983, Elio Perlman, um adolescente de 17 anos, se apaixona por Oliver, um estudante americano que vem passar o verão com sua família na Itália. A relação deles evolui em meio a paisagens deslumbrantes e uma trilha sonora inesquecível.', 'https://a.ltrbxd.com/resized/sm/upload/g9/9t/cc/7u/tcNniniS4rfqrLH0oORikJfnIwY-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Tudo em Todo o Lugar ao Mesmo Tempo', 2022, 139, 'Daniel Kwan, Daniel Scheinert', 'Aventura', 'Evelyn Wang é uma mulher chinesa-americana que se vê envolvida em uma aventura interdimensional quando descobre que é a única pessoa capaz de salvar o multiverso. Ela deve enfrentar versões alternativas de si mesma e lutar contra uma entidade maligna.', 'https://a.ltrbxd.com/resized/film-poster/4/7/4/4/7/4/474474-everything-everywhere-all-at-once-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Jogos Vorazes', 2012, 142, 'Gary Ross', 'Aventura', 'Em um futuro distópico, Katniss Everdeen se voluntaria para participar dos Jogos Vorazes, uma competição mortal transmitida ao vivo. Ela deve lutar pela sobrevivência enquanto desafia o regime opressor de Panem.', 'https://a.ltrbxd.com/resized/sm/upload/x3/tw/wu/z4/vAkjFEm76Lu5hSevquxPgQ91OtI-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Meu Amigo Totoro', 1988, 86, 'Hayao Miyazaki', 'Animação', 'Duas irmãs se mudam para o campo e fazem amizade com criaturas mágicas, incluindo Totoro, um espírito da floresta. Juntos, eles vivem aventuras encantadoras e aprendem sobre a natureza e a amizade.', 'https://a.ltrbxd.com/resized/film-poster/4/7/7/5/6/47756-my-neighbor-totoro-0-1000-0-1500-crop.jpg', 0.0),
(1, 'MaXXXine', 2025, 120, 'Ti West', 'Terror', 'MaXXXine é um filme de terror que segue Maxine, uma jovem atriz que se muda para Los Angeles na década de 1980 em busca de fama. No entanto, ela se vê envolvida em uma série de eventos macabros e perturbadores que ameaçam sua vida e carreira.', 'https://a.ltrbxd.com/resized/film-poster/9/2/2/8/5/8/922858-maxxxine-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Pobres Criaturas', 2024, 140, 'Yorgos Lanthimos', 'Fantasia', 'Pobres Criaturas é um filme de fantasia que segue Bella Baxter, uma mulher ressuscitada por um cientista louco. Ela embarca em uma jornada épica para descobrir sua identidade e explorar o mundo ao seu redor.', 'https://a.ltrbxd.com/resized/film-poster/7/1/0/3/5/2/710352-poor-things-0-1000-0-1500-crop.jpg', 0.0),
(1, 'A Caça', 2012, 100, 'Thomas Vinterberg', 'Drama', 'Lucas é um professor de jardim de infância que se torna alvo de uma falsa acusação de abuso sexual por parte de uma criança. A situação rapidamente se transforma em um pesadelo, afetando sua vida pessoal e profissional.', 'https://a.ltrbxd.com/resized/film-poster/8/4/0/5/1/84051-the-hunt-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Five Nights At Freddys', 2023, 110, 'Emma Tammi', 'Terror', 'Mike Schmidt, um ex-guarda noturno traumatizado, é contratado para trabalhar em uma pizzaria onde animatrônicos ganham vida à noite. Ele deve enfrentar seus medos e descobrir os segredos sombrios por trás dos animatrônicos.', 'https://a.ltrbxd.com/resized/film-poster/4/3/6/9/4/8/436948-five-nights-at-freddy-s-0-1000-0-1500-crop.jpg', 0.0),
(1, 'O Silêncio dos Inocentes', 1991, 118, 'Jonathan Demme', 'Suspense', 'Clarice Starling, uma jovem agente do FBI, busca a ajuda do Dr. Hannibal Lecter, um assassino canibal encarcerado, para capturar outro serial killer conhecido como Buffalo Bill.', 'https://a.ltrbxd.com/resized/film-poster/5/1/7/8/2/51782-the-silence-of-the-lambs-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Pecadores', 2025, 138, 'Ryan Coogler', 'Suspense', 'Dois irmãos gêmeos tentam deixar suas vidas problemáticas para trás e retornam à sua cidade natal para recomeçar. Lá, eles descobrem que um mal ainda maior está à espreita para recebê-los de volta.', 'https://a.ltrbxd.com/resized/film-poster/1/1/1/6/6/0/0/1116600-sinners-2025-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Cisne Negro', 2010, 108, 'Darren Aronofsky', 'Drama', 'Nina Sayers é uma bailarina dedicada que luta para conseguir o papel principal no balé "O Lago dos Cisnes". À medida que a competição aumenta, Nina se vê consumida pela pressão e pela obsessão, levando-a a um estado de paranoia e loucura.', 'https://a.ltrbxd.com/resized/sm/upload/yt/ae/iz/kj/bIjkE9Og0nulRycj144sCcQcsZ6-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Parasita', 2019, 133, 'Bong Joon Ho', 'Suspense', 'Toda a família de Ki-taek está desempregada, vivendo em um porão sujo e apertado. Por obra do acaso, ele começa a dar aulas de inglês para uma garota de família rica. Fascinados com a vida luxuosa destas pessoas, pai, mãe e filhos bolam um plano para se infiltrar também na abastada família, um a um. No entanto, os segredos e mentiras necessários à ascensão social cobram o seu preço.', 'https://a.ltrbxd.com/resized/film-poster/4/2/6/4/0/6/426406-parasite-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Psicopata Americano', 2000, 102, 'Mary Harron', 'Suspense', 'Patrick Bateman é um jovem executivo de Wall Street que leva uma vida dupla como serial killer. Ele se torna obcecado por status e aparência, enquanto comete assassinatos brutais.', 'https://a.ltrbxd.com/resized/sm/upload/5b/u9/av/il/ecoY7zJL6Ub3URP1oPhPfGflEjV-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Bebê de Rosemary', 1968, 136, 'Roman Polanski', 'Terror', 'Rosemary Woodhouse e seu marido Guy se mudam para um novo apartamento em Nova York. Rosemary engravida, mas começa a suspeitar que seus vizinhos e seu marido estão envolvidos em um culto satânico que planeja usar seu filho para rituais obscuros.', 'https://a.ltrbxd.com/resized/sm/upload/ea/vc/su/y2/fdLOXB8AysEGRL44I1RvoKiWDcW-0-1000-0-1500-crop.jpg', 0.0),
(1, 'O Iluminado', 1980, 146, 'Stanley Kubrick', 'Terror', 'Jack Torrance, um escritor em crise, aceita um emprego como zelador de um hotel isolado nas montanhas. Ele se muda com sua esposa Wendy e seu filho Danny, que possui habilidades psíquicas. À medida que o inverno avança, Jack sucumbe à influência sobrenatural do hotel e se torna violento.', 'https://a.ltrbxd.com/resized/sm/upload/7s/m2/bw/d0/caoYMcjUamGoBVy65i1AHJBvdzw-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Nosferatu', 2024, 120, 'Robert Eggers', 'Terror', 'Nosferatu é uma adaptação do clássico filme de terror mudo de 1922. A história segue o Conde Orlok, um vampiro que se muda para uma cidade alemã e espalha o caos e a morte. O filme explora temas de medo, solidão e a natureza do mal.', 'https://a.ltrbxd.com/resized/film-poster/3/5/9/5/0/5/359505-nosferatu-2024-0-1000-0-1500-crop.jpg', 0.0),
(1, 'Como Perder Um Homem em 10 Dias', 2003, 116, 'Donald Petrie', 'Romance', 'Andie Anderson é uma jornalista que escreve uma coluna sobre relacionamentos. Para provar que pode fazer um homem se apaixonar por ela em 10 dias, ela conhece Ben Barry, um publicitário que aposta que pode fazer uma mulher se apaixonar por ele no mesmo período. O que começa como um jogo logo se transforma em algo mais sério.', 'https://a.ltrbxd.com/resized/sm/upload/t0/2v/iy/9c/aiB7u6xZ9RWeDTQ7c92J8AoiHj3-0-1000-0-1500-crop.jpg', 0.0);