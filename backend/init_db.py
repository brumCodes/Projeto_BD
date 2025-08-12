# backend/init_db.py

import sqlite3
import os

# Pega o caminho absoluto da pasta onde este script (init_db.py) está
script_dir = os.path.dirname(os.path.abspath(__file__))

# Cria o caminho completo para o schema.sql e para o database.db
schema_path = os.path.join(script_dir, 'schema.sql')
db_path = os.path.join(script_dir, 'database.db')

try:
    # Apaga o banco de dados antigo, se existir, para começar do zero
    if os.path.exists(db_path):
        os.remove(db_path)

    # Conecta-se ao banco de dados (o arquivo será criado)
    connection = sqlite3.connect(db_path)

    # Abre o arquivo schema.sql usando a codificação correta (UTF-8)
    with open(schema_path, 'r', encoding='utf-8') as f: # <--- Resolve o erro de acentos
        connection.executescript(f.read())

    # Salva as alterações e fecha a conexão
    connection.commit()
    connection.close()

    print(f"Banco de dados '{db_path}' criado com sucesso a partir de '{schema_path}'.")

except FileNotFoundError:
    print(f"ERRO: O arquivo '{schema_path}' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro: {e}")