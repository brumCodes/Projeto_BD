# CINETRACK: A rede social para amantes do cinema

> Um hub social para entusiastas de cinema. Descubra, organize e avalie filmes, tudo em um só lugar.

CineTrack é uma aplicação web completa que permite aos usuários explorar um vasto catálogo de filmes, manter listas personalizadas de "Filmes Vistos" e "Watchlist", além de compartilhar e interagir com avaliações de outros membros da comunidade.

## 🎬 Demonstração

[![Demonstração do CineTrack](https://i.ibb.co/TfLm645/cinetrack-screenshot1.png)](https://vimeo.com/1112433756)


## ✨ Funcionalidades

  - **Autenticação de Usuários:** Sistema completo de registro e login.
  - **Catálogo de Filmes:** Navegue, pesquise e filtre por um extenso catálogo de filmes.
  - **Sistema de Avaliação (Reviews):** Dê notas e escreva resenhas detalhadas para os filmes que assistiu.
  - **Listas Pessoais:** Adicione filmes à sua "Watchlist" ou marque-os como "Vistos".
  - **Perfis de Usuário:** Visualize perfis, atividades recentes e listas de outros usuários.
  - **Interação Social:** Curta as avaliações de outros usuários.
  - **Painel de Controle do Admin:** Usuários administradores podem adicionar novos filmes ao catálogo e moderar reviews.
  - **Páginas Detalhadas:** Cada filme possui uma página com sinopse, diretor, ano e outras informações, além das reviews da comunidade.

## 🚀 Tecnologias Utilizadas

O projeto é dividido em duas partes principais: o frontend e o backend.

### Frontend

  - **React:** Biblioteca para a construção da interface de usuário.
  - **React Router:** Para gerenciamento de rotas na aplicação.
  - **Material-UI (MUI):** Biblioteca de componentes React para um design mais rápido e fácil.
  - **Axios:** Cliente HTTP para realizar requisições à API do backend.
  - **Vite:** Ferramenta de build para um desenvolvimento frontend moderno e rápido.

### Backend

  - **Flask:** Microframework web em Python para construir a API.
  - **SQLite:** Banco de dados relacional leve e baseado em arquivo.
  - **CORS:** Para permitir requisições de origens diferentes entre o frontend e o backend.

## 🏁 Como Começar

Siga estas instruções para configurar e rodar o projeto em sua máquina local.

### Pré-requisitos

  - Node.js (versão 18 ou superior) e npm ou yarn.
  - Python (versão 3.8 ou superior) e pip.

### Instalação e Execução

#### 1\. Backend (API com Flask)

Primeiro, clone o repositório:

```
git clone https://github.com/brumCodes/Projeto_BD.git
cd Projeto_BD/backend
```

Crie e ative um ambiente virtual:

```
# Para Windows
python -m venv venv
.\venv\Scripts\activate

# Para macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Instale as dependências:

```
pip install -r requirements.txt
```

Para inicializar o banco de dados pela primeira vez (isso criará o arquivo `database.db` com o schema e os dados iniciais):

```
python -c "from db import get_db_connection; import sqlite3; conn = get_db_connection(); f = open('schema.sql','r'); sql = f.read(); conn.cursor().executescript(sql); conn.commit(); conn.close()"
```

Inicie o servidor backend:

```
flask run
# ou
python app.py
```

O servidor estará rodando em `http://127.0.0.1:5000`.

#### 2\. Frontend (Interface com React)

Abra um novo terminal e navegue até a pasta do frontend:

```
cd ../frontend
```

Instale as dependências:

```
npm install
```

Inicie a aplicação React:

```
npm run dev
```

A aplicação estará acessível em `http://localhost:5173` (ou outra porta indicada no terminal). Abra este endereço no seu navegador\!

## 🤝 Como Contribuir

Contribuições são o que fazem a comunidade open source um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1.  Faça um **Fork** do projeto.
2.  Crie uma **Branch** para sua feature (`git checkout -b feature/funcionalidadeBacana`).
3.  Adicione suas mudanças (`git add .`).
4.  Comite suas mudanças (`git commit -m 'Adicionando uma funcionalidade bacana'`).
5.  Faça o **Push** da Branch (`git push origin feature/funcionalidadeBacana`).
6.  Abra um **Pull Request**.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📬 Contato

**Rafael Araújo** - rafaelaraujosouza3333@gmail.com
**Larissa Brum** - larissa.brum@aluno.ufop.edu.br




