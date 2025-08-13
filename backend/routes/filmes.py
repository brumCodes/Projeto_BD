from flask import Blueprint, jsonify, request
import sqlite3

filmes_bp = Blueprint('filmes', __name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@filmes_bp.route('/filmes', methods=['GET'])
def get_filmes():
    conn = get_db_connection()
    filmes_db = conn.execute('SELECT * FROM Filme').fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    
    return jsonify(filmes_list)


@filmes_bp.route('/filmes/pesquisa', methods=['GET'])
def pesquisar_filmes():
    termo_pesquisa = request.args.get('q', '')
    
    conn = get_db_connection()
    filmes_db = conn.execute(
        '''SELECT * FROM Filme 
           WHERE LOWER(titulo) LIKE LOWER(?) 
           OR LOWER(diretor) LIKE LOWER(?) 
           OR LOWER(genero) LIKE LOWER(?)''',
        (f'%{termo_pesquisa}%', f'%{termo_pesquisa}%', f'%{termo_pesquisa}%')
    ).fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    return jsonify(filmes_list)

@filmes_bp.route('/filmes', methods=['POST'])
def add_filme():
    #pega os dados que o formulário enviou
    data = request.get_json()

    #separa cada informação em uma variável
    titulo = data.get('titulo')
    ano = data.get('ano')
    diretor = data.get('diretor')
    genero = data.get('genero')
    duracao = data.get('duracao')
    sinopse = data.get('sinopse')
    url_poster = data.get('url_poster')

    id_usuario = 1
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO Filme (id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster)
    )
    conn.commit()
    conn.close()


    return jsonify({"message": "Filme adicionado com sucesso!"}), 201