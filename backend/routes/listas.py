# src/routes/listas.py

from flask import Blueprint, request, jsonify
import sqlite3
from db import get_db_connection

listas_bp = Blueprint('listas', __name__)

@listas_bp.route('/<int:usuario_id>/vistos', methods=['GET'])
def get_lista_vistos(usuario_id):
    try:
        conn = get_db_connection()
        filmes_vistos = conn.execute(
            'SELECT f.* FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista JOIN Filme f ON fl.id_filme = f.id_filme WHERE l.id_usuario = ? AND l.nome_lista = ? COLLATE NOCASE',
            (usuario_id, 'Vistos')
        ).fetchall()
        conn.close()
        filmes = [dict(filme) for filme in filmes_vistos]
        return jsonify(filmes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@listas_bp.route('/<int:usuario_id>/watchlist', methods=['GET'])
def get_watchlist(usuario_id):
    try:
        conn = get_db_connection()
        watchlist = conn.execute(
            'SELECT f.* FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista JOIN Filme f ON fl.id_filme = f.id_filme WHERE l.id_usuario = ? AND l.nome_lista = ? COLLATE NOCASE',
            (usuario_id, 'Desejo Ver')
        ).fetchall()
        conn.close()
        filmes = [dict(filme) for filme in watchlist]
        return jsonify(filmes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
# Rotas de POST corrigidas
@listas_bp.route('/adicionar_filme', methods=['POST'])
def adicionar_filme_a_lista():
    data = request.get_json()

    print("DEBUG: Requisição POST para adicionar_filme recebida.")
    print(f"DEBUG: Dados recebidos: {data}")


    filme_id = data.get('filme_id')
    nome_lista = data.get('nome_lista')
    id_usuario = data.get('id_usuario')

    if not filme_id or not nome_lista or not id_usuario:
        return jsonify({"message": "ID do filme, nome da lista e ID do usuário são obrigatórios"}), 400

    conn = get_db_connection()
    lista = conn.execute(
        'SELECT * FROM Lista WHERE id_usuario = ? AND nome_lista = ?',
        (id_usuario, nome_lista)
    ).fetchone()

    if lista is None:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO Lista (id_usuario, nome_lista) VALUES (?, ?)',
            (id_usuario, nome_lista)
        )
        conn.commit()
        id_lista = cursor.lastrowid
    else:
        id_lista = lista['id_lista']

    try:
        conn.execute(
            'INSERT INTO Filme_Lista (id_lista, id_filme) VALUES (?, ?)',
            (id_lista, filme_id)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Este filme já está nesta lista"}), 409
    finally:
        conn.close()

    return jsonify({"message": f"Filme adicionado à lista '{nome_lista}' com sucesso!"}), 201

@listas_bp.route('/remover_filme', methods=['POST'])
def remover_filme_da_lista():
    data = request.get_json()
    filme_id = data.get('filme_id')
    nome_lista = data.get('nome_lista')
    id_usuario = data.get('id_usuario') 

    if not filme_id or not nome_lista or not id_usuario:
        return jsonify({"message": "ID do filme, nome da lista e ID do usuário são obrigatórios"}), 400

    conn = get_db_connection()
    conn.execute(
        'DELETE FROM Filme_Lista WHERE id_filme = ? AND id_lista = (SELECT id_lista FROM Lista WHERE nome_lista = ? AND id_usuario = ?)',
        (filme_id, nome_lista, id_usuario)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": f"Filme removido da lista '{nome_lista}' com sucesso!"}), 200

@listas_bp.route('/status-filme/<int:filme_id>', methods=['GET'])
def get_status_filme(filme_id):
    id_usuario = request.args.get('usuario_id', type=int)

    if not id_usuario:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

    conn = get_db_connection()
    visto = conn.execute(
        'SELECT 1 FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista WHERE fl.id_filme = ? AND l.id_usuario = ? AND l.nome_lista = ?',
        (filme_id, id_usuario, 'Vistos')
    ).fetchone()
    desejo_ver = conn.execute(
        'SELECT 1 FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista WHERE fl.id_filme = ? AND l.id_usuario = ? AND l.nome_lista = ?',
        (filme_id, id_usuario, 'Desejo Ver')
    ).fetchone()
    conn.close()
    return jsonify({"visto": bool(visto), "desejoVer": bool(desejo_ver)})