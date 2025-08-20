import sqlite3
import os

#pega o caminho absoluto da pasta onde este script ta
script_dir = os.path.dirname(os.path.abspath(__file__))

schema_path = os.path.join(script_dir, 'schema.sql')
db_path = os.path.join(script_dir, 'database.db')

try:
    #apaga o banco de dados antigo pra começar do zero
    if os.path.exists(db_path):
        os.remove(db_path)

    #conecta-se ao banco de dados (o arquivo será criado)
    connection = sqlite3.connect(db_path)

    with open(schema_path, 'r', encoding='utf-8') as f:
        connection.executescript(f.read())

    #salva tudo e fecha
    connection.commit()
    connection.close()

    print(f"Banco de dados '{db_path}' criado com sucesso a partir de '{schema_path}'.")

except FileNotFoundError:
    print(f"ERRO: O arquivo '{schema_path}' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro: {e}")