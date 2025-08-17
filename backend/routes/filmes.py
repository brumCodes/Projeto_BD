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
    usuario_id = request.args.get('usuario_id', type=int)

    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

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
    
    params = [usuario_id, usuario_id]
    
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


#rota para adicionar um novo filme

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


#rota para obter detalhes de um filme

@filmes_bp.route('/filmes/<int:filme_id>/status', methods=['GET'])
def get_filme_status(filme_id):

    usuario_id = request.args.get('usuario_id', type=int)
    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

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

# rota para salvar a avaliação de um filme
@filmes_bp.route('/filmes/<int:filme_id>/avaliacao', methods=['POST'])
def add_avaliacao(filme_id):
    data = request.json
    nota = data.get('nota')
    resenha = data.get('resenha')
    usuario_id = data.get('usuario_id')

    if not nota:
        return jsonify({"error": "Nota é obrigatória"}), 400
    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE Avaliacao SET nota = ?, comentario = ? WHERE id_filme = ? AND id_usuario = ?",
            (nota, resenha, filme_id, usuario_id)
        )
        if cursor.rowcount == 0:
            cursor.execute(
                "INSERT INTO Avaliacao (id_filme, id_usuario, nota, comentario) VALUES (?, ?, ?, ?)",
                (filme_id, usuario_id, nota, resenha)
            )

        avg_result = conn.execute(
            "SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?",
            (filme_id,)
        ).fetchone()

        nova_media = round(avg_result[0], 2) if avg_result[0] is not None else 0

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

# rota para obter filmes populares pra pagina inicial
@filmes_bp.route('/filmes/populares', methods=['GET'])
def get_popular_filmes():
    usuario_id = request.args.get('usuario_id', type=int)

    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

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
        ORDER BY
            f.media_avaliacao DESC
        LIMIT 5
    """
    
    params = [usuario_id, usuario_id]
    
    try:
        popular_filmes_db = conn.execute(query, tuple(params)).fetchall()
        popular_filmes = [dict(filme) for filme in popular_filmes_db]
        return jsonify(popular_filmes), 200
    except Exception as e:
        print(f"Erro ao buscar filmes populares: {e}")
        return jsonify({"message": "Erro ao buscar filmes populares"}), 500
    finally:
        conn.close()

#rota para obter as reviews de um filme
@filmes_bp.route('/filmes/<int:filme_id>/reviews', methods=['GET'])
def get_movie_reviews(filme_id):
    usuario_id = request.args.get('usuario_id', type=int)

    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        reviews_query = """
            SELECT
                a.id_filme,
                a.id_usuario,
                a.nota, 
                a.comentario,
                a.data_avaliacao,
                u.nome_usuario,
                u.url_avatar,
                COUNT(c.id_filme) AS curtidas_contagem 
            FROM Avaliacao a
            LEFT JOIN Usuario u ON a.id_usuario = u.id
            LEFT JOIN CurtidasAvaliacao c ON a.id_filme = c.id_filme AND a.id_usuario = c.id_usuario
            WHERE a.id_filme = ?
            GROUP BY a.id_filme, a.id_usuario
            ORDER BY a.data_avaliacao DESC
        """
        cursor.execute(reviews_query, (filme_id,))
        reviews_data = cursor.fetchall()
        
        likes_do_usuario = set()
        if usuario_id:
            likes_query = """
                SELECT id_filme, id_usuario
                FROM CurtidasAvaliacao
                WHERE id_usuario = ?
            """
            cursor.execute(likes_query, (usuario_id,))
            likes_do_usuario = {(row['id_filme'], row['id_usuario']) for row in cursor.fetchall()}

        reviews_list = []
        for review in reviews_data:
            review_dict = dict(review)
            review_key = (review_dict['id_filme'], review_dict['id_usuario'])
            review_dict['curtido_por_voce'] = review_key in likes_do_usuario
            reviews_list.append(review_dict)

        return jsonify(reviews_list), 200

    except Exception as e:
        print(f"ERRO AO BUSCAR REVIEWS: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500
    finally:
        conn.close()

# Rota para curtir um filme
@filmes_bp.route('/reviews/like', methods=['POST'])
def like_review():
    data = request.json
    id_filme = data.get('id_filme')
    usuario_id_avaliacao = data.get('id_usuario_avaliacao')
    usuario_id_curtindo = data.get('usuario_id_curtindo')

    if not id_filme or not usuario_id_avaliacao or not usuario_id_curtindo:
        return jsonify({"error": "Dados incompletos"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        
        cursor.execute(
            "SELECT COUNT(*) FROM CurtidasAvaliacao WHERE id_filme = ? AND id_usuario = ?",
            (id_filme, usuario_id_curtindo)
        )
        existing_like = cursor.fetchone()[0]

        if existing_like > 0:
            # Se a curtida existe remove
            cursor.execute(
                "DELETE FROM CurtidasAvaliacao WHERE id_filme = ? AND id_usuario = ?",
                (id_filme, usuario_id_curtindo)
            )
            conn.commit()
            return jsonify({"message": "Curtida removida com sucesso!"}), 200
        else:
            # Se a curtida não existe curte
            cursor.execute(
                "INSERT INTO CurtidasAvaliacao (id_filme, id_usuario) VALUES (?, ?)",
                (id_filme, usuario_id_curtindo)
            )
            conn.commit()
            return jsonify({"message": "Curtida adicionada com sucesso!"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Erro ao processar curtida: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()