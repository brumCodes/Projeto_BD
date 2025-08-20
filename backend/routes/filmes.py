from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import sqlite3
import os
from flask import current_app
from db import get_db_connection
from flask_cors import CORS
from datetime import datetime

filmes_bp = Blueprint('filmes', __name__)
CORS(filmes_bp)

# rota para obter todos os filmes ou filtrar
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
        params.append(f'%{genero_filtro}%')

    filmes_db = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    
    return jsonify(filmes_list)

#rota para adicionar um novo filme
@filmes_bp.route('/filmes', methods=['POST'])
def add_filme():
    conn = None
    try:
        data = request.json
        
        campos_obrigatorios = ['titulo', 'ano', 'diretor', 'id_usuario']
        for campo in campos_obrigatorios:
            if campo not in data or not data.get(campo):
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400
        
        titulo = data['titulo']
        diretor = data['diretor']
        ano = int(data['ano'])
        id_usuario = data['id_usuario']

        duracao = data.get('duracao')
        genero = data.get('genero')
        sinopse = data.get('sinopse')
        url_poster = data.get('url_poster')

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO Filme (titulo, ano, duracao, genero, diretor, sinopse, url_poster, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (titulo, ano, duracao, genero, diretor, sinopse, url_poster, id_usuario)
        )
        conn.commit()
        
        return jsonify({"message": "Filme adicionado com sucesso!"}), 201

    except (ValueError, TypeError):
        if conn: conn.rollback()
        return jsonify({"error": "Dados inválidos. O ano ou a duração devem ser números inteiros."}), 400
    except sqlite3.IntegrityError as e:
        if conn: conn.rollback()
        return jsonify({"error": f"Erro de integridade do banco de dados: {e}"}), 400
    except Exception as e:
        if conn: conn.rollback()
        print(f"Erro inesperado ao adicionar filme: {e}")
        return jsonify({"error": "Erro interno do servidor. Por favor, tente novamente mais tarde."}), 500
    finally:
        if conn: conn.close()

# rota para obter o status do filme
@filmes_bp.route('/filmes/<int:filme_id>/status', methods=['GET'])
def get_filme_status(filme_id):
    usuario_id = request.args.get('usuario_id', type=int)
    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

    conn = get_db_connection()
    
    visto_query = "SELECT 1 FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos' AND fl.id_filme = ?"
    desejo_ver_query = "SELECT 1 FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista WHERE l.id_usuario = ? AND l.nome_lista = 'Desejo Ver' AND fl.id_filme = ?"
    
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
    comentario = data.get('comentario')
    usuario_id = data.get('usuario_id')
    
    if not nota or not usuario_id:
        return jsonify({"error": "Nota e ID do usuário são obrigatórios."}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        avaliacao_existente = cursor.execute(
            "SELECT id_avaliacao FROM Avaliacao WHERE id_filme = ? AND id_usuario = ?", (filme_id, usuario_id)
        ).fetchone()

        if avaliacao_existente:
            return jsonify({"error": "Avaliação já existe para este filme e usuário. Use a rota de PUT para atualizar."}), 409
        
        cursor.execute(
            "INSERT INTO Avaliacao (id_filme, id_usuario, nota, comentario, data_avaliacao) VALUES (?, ?, ?, ?, ?)",
            (filme_id, usuario_id, nota, comentario, datetime.now())
        )
        id_avaliacao = cursor.lastrowid

        avg_result = conn.execute("SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?", (filme_id,)).fetchone()
        nova_media = round(avg_result[0], 1) if avg_result[0] is not None else 0
        cursor.execute("UPDATE Filme SET media_avaliacao = ? WHERE id_filme = ?", (nova_media, filme_id))

        vistos_lista_id = conn.execute(
            "SELECT id_lista FROM Lista WHERE id_usuario = ? AND nome_lista = 'Vistos'", (usuario_id,)
        ).fetchone()
        
        visto_adicionado = False
        if vistos_lista_id:
            filme_ja_visto = conn.execute(
                "SELECT 1 FROM Filme_Lista WHERE id_filme = ? AND id_lista = ?", (filme_id, vistos_lista_id[0])
            ).fetchone()
            
            if not filme_ja_visto:
                cursor.execute(
                    "INSERT INTO Filme_Lista (id_filme, id_lista) VALUES (?, ?)", (filme_id, vistos_lista_id[0])
                )
                visto_adicionado = True
        
        conn.commit()
        return jsonify({
            "message": "Resenha e nota salvas com sucesso!", 
            "media_atualizada": nova_media, 
            "visto_adicionado": visto_adicionado, 
            "id_avaliacao": id_avaliacao
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# rota para ATUALIZAR uma resenha existente
@filmes_bp.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    conn = None
    try:
        data = request.json
        nota = data.get('nota')
        comentario = data.get('comentario')
        
        conn = get_db_connection()
        cursor = conn.cursor()

        avaliacao_info = cursor.execute(
            "SELECT id_usuario, id_filme FROM Avaliacao WHERE id_avaliacao = ?", (review_id,)
        ).fetchone()
        
        if not avaliacao_info:
            return jsonify({'error': 'Resenha não encontrada'}), 404
            
        filme_id = avaliacao_info['id_filme']

        cursor.execute(
            "UPDATE Avaliacao SET nota = ?, comentario = ?, data_avaliacao = ? WHERE id_avaliacao = ?",
            (nota, comentario, datetime.now(), review_id)
        )
        
        avg_result = conn.execute("SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?", (filme_id,)).fetchone()
        nova_media = round(avg_result[0], 1) if avg_result[0] is not None else 0
        
        cursor.execute("UPDATE Filme SET media_avaliacao = ? WHERE id_filme = ?", (nova_media, filme_id))
        
        conn.commit()
        
        return jsonify({
            'message': f'Resenha {review_id} atualizada com sucesso!',
            'id_avaliacao': review_id,
            'media_atualizada': nova_media
        }), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'error': 'Ocorreu um erro interno no servidor'}), 500
    finally:
        if conn: conn.close()

# rota para filtrar os mais bem avaliados do catalogo
@filmes_bp.route('/filmes/populares', methods=['GET'])
def get_popular_filmes():
    usuario_id = request.args.get('usuario_id', type=int)
    if not usuario_id:
        return jsonify({"error": "ID do usuário não fornecido"}), 400

    conn = get_db_connection()
    query = """
        SELECT f.*,
            CASE WHEN vl.id_filme IS NOT NULL THEN 1 ELSE 0 END AS visto,
            CASE WHEN dvl.id_filme IS NOT NULL THEN 1 ELSE 0 END AS desejo_ver
        FROM Filme f
        LEFT JOIN (
            SELECT fl.id_filme FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos'
        ) vl ON f.id_filme = vl.id_filme
        LEFT JOIN (
            SELECT fl.id_filme FROM Filme_Lista fl JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Desejo Ver'
        ) dvl ON f.id_filme = dvl.id_filme
        ORDER BY f.media_avaliacao DESC LIMIT 5
    """
    try:
        popular_filmes_db = conn.execute(query, (usuario_id, usuario_id)).fetchall()
        popular_filmes = [dict(filme) for filme in popular_filmes_db]
        return jsonify(popular_filmes), 200
    except Exception as e:
        return jsonify({"message": "Erro ao buscar filmes populares"}), 500
    finally:
        conn.close()

# rota para obter as reviews de um filme
@filmes_bp.route('/filmes/<int:filme_id>/reviews', methods=['GET'])
def get_movie_reviews(filme_id):
    usuario_id = request.args.get('usuario_id', type=int)
    conn = get_db_connection()
    try:
        reviews_query = """
            SELECT
                a.id_avaliacao, a.id_filme, a.id_usuario, a.nota, a.comentario, a.data_avaliacao,
                u.nome_usuario, u.url_avatar,
                (SELECT COUNT(*) FROM CurtidasAvaliacao ca WHERE ca.id_avaliacao = a.id_avaliacao) AS curtidas_contagem,
                CASE WHEN ? IS NOT NULL AND (SELECT 1 FROM CurtidasAvaliacao ca WHERE ca.id_avaliacao = a.id_avaliacao AND ca.id_usuario = ?) THEN 1 ELSE 0 END AS curtido_por_voce
            FROM Avaliacao a
            JOIN Usuario u ON a.id_usuario = u.id
            WHERE a.id_filme = ?
            ORDER BY a.data_avaliacao DESC
        """
        reviews_data = conn.execute(reviews_query, (usuario_id, usuario_id, filme_id)).fetchall()
        reviews_list = [dict(row) for row in reviews_data]
        return jsonify(reviews_list), 200
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500
    finally:
        conn.close()

# Rota para curtir uma review
# Rota para curtir uma review
@filmes_bp.route('/reviews/like', methods=['POST'])
def like_review():
    data = request.json
    id_avaliacao = data.get('id_avaliacao')
    usuario_id = data.get('usuario_id')

    if not id_avaliacao or not usuario_id:
        return jsonify({"error": "Dados incompletos"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        existing_like = cursor.execute(
            "SELECT 1 FROM CurtidasAvaliacao WHERE id_avaliacao = ? AND id_usuario = ?",
            (id_avaliacao, usuario_id)
        ).fetchone()

        if existing_like:
            cursor.execute(
                "DELETE FROM CurtidasAvaliacao WHERE id_avaliacao = ? AND id_usuario = ?",
                (id_avaliacao, usuario_id)
            )
            message = "Curtida removida com sucesso!"
        else:
            cursor.execute(
                "INSERT INTO CurtidasAvaliacao (id_avaliacao, id_usuario, data_curtida) VALUES (?, ?, ?)",
                (id_avaliacao, usuario_id, datetime.now())
            )
            message = "Curtida adicionada com sucesso!"
        
        conn.commit()
        return jsonify({"message": message}), 200

    except Exception as e:
        conn.rollback()
        print(f"Erro ao processar curtida: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()



@filmes_bp.route('/filmes/<int:filme_id>', methods=['GET'])
def get_filme_por_id(filme_id):
    """
    Busca e retorna os dados de um único filme pelo seu ID.
    """
    conn = None
    try:
        conn = get_db_connection()
        filme_db = conn.execute("SELECT * FROM Filme WHERE id_filme = ?", (filme_id,)).fetchone()
        
        if filme_db is None:
            return jsonify({'error': 'Filme não encontrado'}), 404
            
        filme_dict = dict(filme_db)
        
        return jsonify(filme_dict), 200

    except Exception as e:
        print(f"Erro ao buscar filme por ID: {e}")
        return jsonify({'error': 'Ocorreu um erro interno no servidor'}), 500
    finally:
        if conn:
            conn.close()

# deletar reviews (Admin pode todas)
@filmes_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    data = request.get_json()
    requester_id = data.get('usuario_id')

    if not requester_id:
        return jsonify({'error': 'ID do usuário solicitante é necessário'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        review_owner = cursor.execute("SELECT id_usuario, id_filme FROM Avaliacao WHERE id_avaliacao = ?", (review_id,)).fetchone()
        
        if not review_owner:
            return jsonify({'error': 'Resenha não encontrada'}), 404
        
        is_admin = (requester_id == 1)
        is_owner = review_owner['id_usuario'] == requester_id
        
        if not is_admin and not is_owner:
            return jsonify({'error': 'Acesso negado.'}), 403

        filme_id = review_owner['id_filme']
        cursor.execute("DELETE FROM Avaliacao WHERE id_avaliacao = ?", (review_id,))
        
        avg_result = conn.execute("SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?", (filme_id,)).fetchone()
        nova_media = round(avg_result[0], 1) if avg_result and avg_result[0] is not None else 0
        cursor.execute("UPDATE Filme SET media_avaliacao = ? WHERE id_filme = ?", (nova_media, filme_id))

        conn.commit()
        
        return jsonify({
            'message': 'Resenha deletada com sucesso!',
            'media_atualizada': nova_media
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
