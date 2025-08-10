# backend/routes/auth.py

from flask import Blueprint, request, jsonify
import sqlite3


#Criamos o Blueprint. 'auth' é o nome do blueprint.
auth_bp = Blueprint('auth', __name__)

# Função auxiliar para pegar a conexão com o banco
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
    query = "SELECT * FROM usuario WHERE nome_usuario = ? AND senha = ?"
    user = conn.execute(query, (username, password)).fetchone()
    conn.close()

    if user:
        return jsonify({
            "message": "Login bem-sucedido!",
            "usuario": {
                "id": user['id'],
                "nome_usuario": user['nome_usuario']
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