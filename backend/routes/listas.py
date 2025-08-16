from flask import Blueprint, request, jsonify
import sqlite3
from db import get_db_connection

listas_bp = Blueprint('listas', __name__)

@listas_bp.route('/listas/adicionar_filme', methods=['POST'])
def adicionar_filme_a_lista():
    data = request.get_json()
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

@listas_bp.route('/listas/remover_filme', methods=['POST'])
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

@listas_bp.route('/listas/status-filme/<int:filme_id>', methods=['GET'])
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