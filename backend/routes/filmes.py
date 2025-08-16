from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import sqlite3
import os
from flask import current_app
from db import get_db_connection
from flask_cors import CORS

filmes_bp = Blueprint('filmes', __name__)
CORS(filmes_bp)

@filmes_bp.route('/filmes', methods=['GET'])
def get_filmes():
    id_usuario = 1

    search_query = request.args.get('q', '')
    ano_filtro = request.args.get('ano', '')
    genero_filtro = request.args.get('genero', '')

    conn = get_db_connection()
    
    query = """
        SELECT
            f.*,
            CASE WHEN vl.id_filme IS NOT NULL THEN 1 ELSE 0 END AS visto,
            CASE WHEN dvl.id_filme IS NOT NULL THEN 1 ELSE 0 END AS desejo_ver
        FROM
            Filme f
        LEFT JOIN (
            SELECT fl.id_filme FROM Filme_Lista fl
            JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos'
        ) vl ON f.id_filme = vl.id_filme
        LEFT JOIN (
            SELECT fl.id_filme FROM Filme_Lista fl
            JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Desejo Ver'
        ) dvl ON f.id_filme = dvl.id_filme
        WHERE 1=1
    """
    
    params = [id_usuario, id_usuario]
    
    if search_query:
        query += " AND f.titulo LIKE ?"
        params.append('%' + search_query + '%')

    if ano_filtro:
        query += " AND f.ano = ?"
        params.append(ano_filtro)
    
    if genero_filtro:
        query += " AND f.genero LIKE ?"
        params.append(genero_filtro)

    filmes_db = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    
    return jsonify(filmes_list)

@filmes_bp.route('/filmes', methods=['POST'])
def add_filme():
    try:
        data = request.form
        titulo = data.get('titulo')
        ano = data.get('ano')
        duracao = data.get('duracao')
        genero = data.get('genero')
        diretor = data.get('diretor')
        sinopse = data.get('sinopse')

        conn = get_db_connection()
        cursor = conn.cursor()

        poster = request.files.get('poster')
        poster_filename = None
        if poster:
            if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
                os.makedirs(current_app.config['UPLOAD_FOLDER'])
            poster_filename = secure_filename(poster.filename)
            poster_path = os.path.join(current_app.config['UPLOAD_FOLDER'], poster_filename)
            poster.save(poster_path)

        cursor.execute(
            "INSERT INTO Filme (titulo, ano, duracao, genero, diretor, sinopse, url_poster) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (titulo, ano, duracao, genero, diretor, sinopse, poster_filename)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Filme adicionado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@filmes_bp.route('/filmes/<int:filme_id>/status', methods=['GET'])
def get_filme_status(filme_id):
    usuario_id = 1
    
    conn = get_db_connection()
    
    visto_query = """
        SELECT 1 FROM Filme_Lista fl
        JOIN Lista l ON fl.id_lista = l.id_lista
        WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos' AND fl.id_filme = ?
    """
    
    desejo_ver_query = """
        SELECT 1 FROM Filme_Lista fl
        JOIN Lista l ON fl.id_lista = l.id_lista
        WHERE l.id_usuario = ? AND l.nome_lista = 'Desejo Ver' AND fl.id_filme = ?
    """
    
    visto_result = conn.execute(visto_query, (usuario_id, filme_id)).fetchone()
    desejo_ver_result = conn.execute(desejo_ver_query, (usuario_id, filme_id)).fetchone()
    
    conn.close()
    
    return jsonify({
        "visto": bool(visto_result),
        "desejo_ver": bool(desejo_ver_result)
    })

# NOVO: Rota para salvar a avaliação de um filme
@filmes_bp.route('/filmes/<int:filme_id>/avaliacao', methods=['POST'])
def add_avaliacao(filme_id):
    data = request.json
    nota = data.get('nota')
    resenha = data.get('resenha') # Continua 'resenha' aqui, pois é o nome enviado do frontend
    usuario_id = 1  # ID do usuário, por enquanto fixo

    if not nota:
        return jsonify({"error": "Nota é obrigatória"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Verifica se já existe uma avaliação do usuário para este filme
        cursor.execute(
            "SELECT COUNT(*) FROM Avaliacao WHERE id_filme = ? AND id_usuario = ?",
            (filme_id, usuario_id)
        )
        existe_avaliacao = cursor.fetchone()[0]

        if existe_avaliacao > 0:
            # Se a avaliação já existe, atualiza
            # Alteração: 'resenha' -> 'comentario'
            cursor.execute(
                "UPDATE Avaliacao SET nota = ?, comentario = ? WHERE id_filme = ? AND id_usuario = ?",
                (nota, resenha, filme_id, usuario_id)
            )
        else:
            # Caso contrário, insere uma nova avaliação
            # Alteração: 'resenha' -> 'comentario'
            cursor.execute(
                "INSERT INTO Avaliacao (id_filme, id_usuario, nota, comentario) VALUES (?, ?, ?, ?)",
                (filme_id, usuario_id, nota, resenha)
            )

        # Recalcular a média de avaliação do filme
        avg_result = conn.execute(
            "SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?",
            (filme_id,)
        ).fetchone()

        nova_media = round(avg_result[0], 2) if avg_result[0] is not None else 0

        # Atualizar a média na tabela Filme
        cursor.execute(
            "UPDATE Filme SET media_avaliacao = ? WHERE id_filme = ?",
            (nova_media, filme_id)
        )

        conn.commit()
        return jsonify({"message": "Resenha e nota salvas com sucesso!", "media_atualizada": nova_media}), 201

    except Exception as e:
        conn.rollback()
        print(f"Erro ao salvar avaliação: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
