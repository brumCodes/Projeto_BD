from flask import Blueprint, request, jsonify
import sqlite3

auth_bp = Blueprint('auth', __name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('nome_usuario')
    password = data.get('senha')

    if not username or not password:
        return jsonify({"message": "Nome de usuário e senha são obrigatórios!"}), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT id, nome_usuario, senha, url_avatar FROM usuario WHERE nome_usuario = ?",
        (username,)
    ).fetchone()
    conn.close()

    if user and user['senha'] == password:
        return jsonify({
            "message": "Login bem-sucedido!",
            "usuario": {
                "id": user['id'],
                "nome_usuario": user['nome_usuario'],
                "url_avatar": user['url_avatar'] 
            }
        })
    else:
        return jsonify({"message": "Nome de usuário ou senha inválidos"}), 401


    
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('nome_usuario')
    email = data.get('email')
    password = data.get('senha')

    if not username or not email or not password:
        return jsonify({"message": "Todos os campos são obrigatórios!"}), 400
    
    conn = get_db_connection()
    try:
        # Insere o novo usuário no banco com a senha em texto puro
        conn.execute(
            'INSERT INTO usuario (nome_usuario, email, senha) VALUES (?, ?, ?)',
            (username, email, password)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Nome de usuário ou e-mail já cadastrado."}), 409
    finally:
        conn.close()

    return jsonify({"message": "Usuário criado com sucesso!"}), 201