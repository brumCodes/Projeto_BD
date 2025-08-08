# backend/init_db.py

import sqlite3

# Conecta-se ao banco de dados (o arquivo será criado se não existir)
connection = sqlite3.connect('database.db')

# Abre o arquivo schema.sql e executa os comandos SQL contidos nele
with open('schema.sql') as f:
    connection.executescript(f.read())

# Salva as alterações e fecha a conexão
connection.commit()
connection.close()

print("Banco de dados inicializado com sucesso.")