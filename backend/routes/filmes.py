from flask import Blueprint, jsonify
import sqlite3

filmes_bp = Blueprint('filmes', __name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@filmes_bp.route('/filmes', methods=['GET'])
def get_filmes():
    conn = get_db_connection()
    filmes_db = conn.execute('SELECT * FROM Filme').fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    
    return jsonify(filmes_list)