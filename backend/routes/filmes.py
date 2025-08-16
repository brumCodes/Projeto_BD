# backend/routes/filmes.py

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import sqlite3
import os
from flask import current_app
from db import get_db_connection

filmes_bp = Blueprint('filmes', __name__)

@filmes_bp.route('/filmes', methods=['GET'])
def get_filmes():
    id_usuario = 1

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
    
    params = [id_usuario, id_usuario]
    
    if search_query:
        query += " AND f.titulo LIKE ?"
        params.append('%' + search_query + '%')

    if ano_filtro:
        query += " AND f.ano = ?"
        params.append(ano_filtro)
    
    if genero_filtro:
        query += " AND f.genero LIKE ?"
        params.append(genero_filtro)


    print("\n--- DEBUG: Informações da Query ---")
    print("URL da Requisição:", request.url)
    print("Query SQL gerada:\n", query)
    print("Parâmetros (params):", params)
    print("-----------------------------------\n")

    filmes_db = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    
    filmes_list = [dict(filme) for filme in filmes_db]
    
    return jsonify(filmes_list)

@filmes_bp.route('/filmes', methods=['POST'])
def add_filme():
    pass