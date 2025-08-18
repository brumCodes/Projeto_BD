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

# Rota para obter todos os filmes ou filtrar
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

# Rota para adicionar um novo filme
@filmes_bp.route('/filmes', methods=['POST'])
def add_filme():
    conn = None
    try:
        data = request.json
        
        # Validação explícita dos campos obrigatórios
        campos_obrigatorios = ['titulo', 'ano', 'diretor', 'id_usuario'] # Adicionei 'id_usuario'
        for campo in campos_obrigatorios:
            if campo not in data or not data.get(campo):
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400
        
        titulo = data['titulo']
        diretor = data['diretor']
        ano = int(data['ano'])
        id_usuario = data['id_usuario'] # Recebe o ID do usuário

        # Campos opcionais, use .get() para evitar erros se não existirem
        duracao = data.get('duracao')
        genero = data.get('genero')
        sinopse = data.get('sinopse')
        url_poster = data.get('url_poster')

        conn = get_db_connection()
        cursor = conn.cursor()

        # Adicione 'id_usuario' na consulta e nos parâmetros
        cursor.execute(
            "INSERT INTO Filme (titulo, ano, duracao, genero, diretor, sinopse, url_poster, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (titulo, ano, duracao, genero, diretor, sinopse, url_poster, id_usuario)
        )
        conn.commit()
        
        return jsonify({"message": "Filme adicionado com sucesso!"}), 201

    except (ValueError, TypeError):
        if conn:
            conn.rollback()
        return jsonify({"error": "Dados inválidos. O ano ou a duração devem ser números inteiros."}), 400

    except sqlite3.IntegrityError as e:
        if conn:
            conn.rollback()
        return jsonify({"error": f"Erro de integridade do banco de dados: {e}"}), 400

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Erro inesperado ao adicionar filme: {e}")
        return jsonify({"error": "Erro interno do servidor. Por favor, tente novamente mais tarde."}), 500

    finally:
        if conn:
            conn.close()

# Rota para obter o status do filme
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

# Rota para salvar a avaliação de um filme
@filmes_bp.route('/filmes/<int:filme_id>/avaliacao', methods=['POST'])
def add_avaliacao(filme_id):
    data = request.json
    nota = data.get('nota')
    comentario = data.get('comentario')
    usuario_id = data.get('usuario_id')
    
    if not nota or not usuario_id:
        return jsonify({"error": "Nota e ID do usuário são obrigatórios."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id_avaliacao FROM Avaliacao WHERE id_filme = ? AND id_usuario = ?",
            (filme_id, usuario_id)
        )
        avaliacao_existente = cursor.fetchone()

        if avaliacao_existente:
            return jsonify({"error": "Avaliação já existe para este filme e usuário. Use a rota de PUT para atualizar."}), 409
        else:
            cursor.execute(
                "INSERT INTO Avaliacao (id_filme, id_usuario, nota, comentario, data_avaliacao) VALUES (?, ?, ?, ?, ?)",
                (filme_id, usuario_id, nota, comentario, datetime.now())
            )
            id_avaliacao = cursor.lastrowid

        # Recalcula a média de avaliação
        avg_result = conn.execute(
            "SELECT AVG(nota) FROM Avaliacao WHERE id_filme = ?",
            (filme_id,)
        ).fetchone()
        nova_media = round(avg_result[0], 2) if avg_result[0] is not None else 0
        cursor.execute(
            "UPDATE Filme SET media_avaliacao = ? WHERE id_filme = ?",
            (nova_media, filme_id)
        )

        # Adiciona o filme à lista 'Vistos' do usuário
        vistos_lista_id = conn.execute(
            "SELECT id_lista FROM Lista WHERE id_usuario = ? AND nome_lista = 'Vistos'",
            (usuario_id,)
        ).fetchone()
        
        visto_adicionado = False
        if vistos_lista_id:
            filme_ja_visto = conn.execute(
                "SELECT 1 FROM Filme_Lista WHERE id_filme = ? AND id_lista = ?",
                (filme_id, vistos_lista_id[0])
            ).fetchone()
            
            if not filme_ja_visto:
                cursor.execute(
                    "INSERT INTO Filme_Lista (id_filme, id_lista) VALUES (?, ?)",
                    (filme_id, vistos_lista_id[0])
                )
                visto_adicionado = True
        
        conn.commit()
        return jsonify({"message": "Resenha e nota salvas com sucesso!", "media_atualizada": nova_media, "visto_adicionado": visto_adicionado, "id_avaliacao": id_avaliacao}), 201

    except Exception as e:
        conn.rollback()
        print(f"Erro ao salvar avaliação: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# Rota para ATUALIZAR uma resenha existente
@filmes_bp.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    """
    Rota para atualizar uma resenha existente.
    """
    conn = None  # Inicializa a conexão
    try:
        data = request.json
        nota = data.get('nota')
        comentario = data.get('comentario')
        
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id_usuario, id_filme FROM Avaliacao WHERE id_avaliacao = ?",
            (review_id,)
        )
        avaliacao_info = cursor.fetchone()
        
        if not avaliacao_info:
            return jsonify({'error': 'Resenha não encontrada'}), 404
            
        usuario_id = avaliacao_info['id_usuario']
        filme_id = avaliacao_info['id_filme']

        cursor.execute(
            "UPDATE Avaliacao SET nota = ?, comentario = ?, data_avaliacao = ? WHERE id_avaliacao = ?",
            (nota, comentario, datetime.now(), review_id)
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
        
        return jsonify({'message': f'Resenha {review_id} atualizada com sucesso!'}), 200

    except Exception as e:
        print(f"Ocorreu um erro ao processar a requisição: {e}")
        return jsonify({'error': 'Ocorreu um erro interno no servidor'}), 500
    finally:
        if conn:
            conn.close()

# Rota para obter filmes populares
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

# rota para obter as reviews de um filme
@filmes_bp.route('/filmes/<int:filme_id>/reviews', methods=['GET'])
def get_movie_reviews(filme_id):
    usuario_id = request.args.get('usuario_id', type=int)

    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        reviews_query = """
            SELECT
                a.id_avaliacao, a.id_filme, a.id_usuario, a.nota, a.comentario, a.data_avaliacao,
                u.nome_usuario, u.url_avatar,
                (SELECT COUNT(*) FROM CurtidasAvaliacao ca WHERE ca.id_avaliacao = a.id_avaliacao) AS curtidas_contagem,
                CASE WHEN ? AND (SELECT 1 FROM CurtidasAvaliacao ca WHERE ca.id_avaliacao = a.id_avaliacao AND ca.id_usuario = ?) THEN 1 ELSE 0 END AS curtido_por_voce
            FROM Avaliacao a
            JOIN Usuario u ON a.id_usuario = u.id -- CORREÇÃO: A coluna na tabela 'Usuario' provavelmente se chama 'id'
            WHERE a.id_filme = ?
            ORDER BY a.data_avaliacao DESC
        """
        reviews_data = cursor.execute(reviews_query, (usuario_id, usuario_id, filme_id)).fetchall()

        reviews_list = [dict(row) for row in reviews_data]

        return jsonify(reviews_list), 200

    except Exception as e:
        print(f"ERRO AO BUSCAR REVIEWS: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500
    finally:
        conn.close()

# Rota para curtir uma review
@filmes_bp.route('/reviews/like', methods=['POST'])
def like_review():
    data = request.json
    id_avaliacao = data.get('id_avaliacao')
    usuario_id = data.get('usuario_id')

    if not id_avaliacao or not usuario_id:
        return jsonify({"error": "Dados incompletos"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT COUNT(*) FROM CurtidasAvaliacao WHERE id_avaliacao = ? AND id_usuario = ?",
            (id_avaliacao, usuario_id)
        )
        existing_like = cursor.fetchone()[0]

        if existing_like > 0:
            cursor.execute(
                "DELETE FROM CurtidasAvaliacao WHERE id_avaliacao = ? AND id_usuario = ?",
                (id_avaliacao, usuario_id)
            )
            conn.commit()
            return jsonify({"message": "Curtida removida com sucesso!"}), 200
        else:
            cursor.execute(
                "INSERT INTO CurtidasAvaliacao (id_avaliacao, id_usuario, data_curtida) VALUES (?, ?, ?)",
                (id_avaliacao, usuario_id, datetime.now())
            )
            conn.commit()
            return jsonify({"message": "Curtida adicionada com sucesso!"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Erro ao processar curtida: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()