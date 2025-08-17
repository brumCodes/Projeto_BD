from flask import Blueprint, jsonify, request
from db import get_db_connection

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/usuarios/<int:id_usuario>/perfil', methods=['GET'])
def get_perfil(id_usuario):
    try:
        conn = get_db_connection()
        
        # 1. Busca os dados do usuário, incluindo o novo campo url_avatar
        usuario = conn.execute('SELECT id, nome_usuario, email, url_avatar FROM Usuario WHERE id = ?', (id_usuario,)).fetchone()
        
        if not usuario:
            conn.close()
            return jsonify({"message": "Usuário não encontrado"}), 404
        
        # 2. Conta quantos filmes o usuário marcou como 'Vistos'
        vistos_count_query = """
            SELECT COUNT(*) AS count_vistos
            FROM Filme_Lista fl
            JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos'
        """
        vistos_count_result = conn.execute(vistos_count_query, (id_usuario,)).fetchone()
        vistos_count = vistos_count_result['count_vistos'] if vistos_count_result and 'count_vistos' in vistos_count_result else 0
        
        # 3. Busca a lista de filmes marcados como 'Vistos'
        vistos_query = """
            SELECT 
                f.id_filme, f.titulo, f.url_poster, f.ano, f.duracao, f.genero
            FROM Filme f
            JOIN Filme_Lista fl ON f.id_filme = fl.id_filme
            JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Vistos'
            ORDER BY fl.data_adicionado DESC
            LIMIT 10
        """
        vistos_filmes = conn.execute(vistos_query, (id_usuario,)).fetchall()
        
        # 4. Busca a lista de filmes da 'Desejo Ver' (watchlist)
        watchlist_query = """
            SELECT 
                f.id_filme, f.titulo, f.url_poster, f.ano, f.duracao, f.genero
            FROM Filme f
            JOIN Filme_Lista fl ON f.id_filme = fl.id_filme
            JOIN Lista l ON fl.id_lista = l.id_lista
            WHERE l.id_usuario = ? AND l.nome_lista = 'Desejo Ver'
            ORDER BY fl.data_adicionado DESC
            LIMIT 10
        """
        watchlist_filmes = conn.execute(watchlist_query, (id_usuario,)).fetchall()

        conn.close()

        # 5. Retorna todos os dados em um único JSON, incluindo o url_avatar
        return jsonify({
            "usuario": {
                "id": usuario['id'],
                "nome_usuario": usuario['nome_usuario'],
                "email": usuario['email'],
                "url_avatar": usuario['url_avatar'],
                "vistos_count": vistos_count
            },
            "vistos": [dict(row) for row in vistos_filmes],
            "watchlist": [dict(row) for row in watchlist_filmes]
        }), 200

    except Exception as e:
        return jsonify({"message": f"Erro interno do servidor: {str(e)}"}), 500


@usuarios_bp.route('/usuarios/<int:user_id>/atualizar_avatar', methods=['PUT'])
def atualizar_avatar(user_id):
    try:
        data = request.get_json()
        url_avatar = data.get('url_avatar')

        if not url_avatar:
            return jsonify({"error": "URL do avatar não fornecida"}), 400

        conn = get_db_connection()
        conn.execute('UPDATE Usuario SET url_avatar = ? WHERE id = ?', (url_avatar, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({"message": "URL do avatar atualizada com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": "Erro ao atualizar URL do avatar", "details": str(e)}), 500