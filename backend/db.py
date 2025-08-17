import sqlite3
import os

_script_dir = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(_script_dir, 'database.db')

def get_db_connection():
    """Cria uma conexão com o banco de dados apontando sempre para o caminho correto."""
    print(f"Conectando ao banco de dados em: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn