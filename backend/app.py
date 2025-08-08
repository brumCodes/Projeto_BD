# backend/app.py

import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Função auxiliar para pegar uma conexão com o banco de dados
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Nossa rota de teste, agora conectando ao BD
@app.route('/api/status')
def get_status():
    try:
        conn = get_db_connection()
        # Executa uma consulta SQL para buscar a mensagem da tabela 'teste'
        db_data = conn.execute('SELECT mensagem FROM teste WHERE id = 1').fetchone()
        conn.close()
        
        # Se não encontrar nada, retorna um erro
        if db_data is None:
            return jsonify({"status": "Banco de dados conectado, mas a tabela de teste está vazia."}), 500
            
        # Se encontrou, retorna a mensagem do banco
        return jsonify({"status": db_data['mensagem']})

    except Exception as e:
        # Se der qualquer erro na conexão ou na consulta, retorna uma mensagem de erro
        return jsonify({"status": f"Erro ao conectar ou consultar o banco de dados: {e}"}), 500