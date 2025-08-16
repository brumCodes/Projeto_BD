import sqlite3

# este código existe para exportar todos os filmes que são inseridos manualmente pelo site no nosso banco de dados.

#função para exportar os filmes do banco de dados para sql
def exportarFilmes():
    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            
            cursor.execute('SELECT id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster FROM Filme')
            filmes = cursor.fetchall()
            
            with open('filme_inserts.sql', 'w', encoding='utf-8') as f:
                for filme in filmes:
                    titulo = filme[1].replace("'", "''")
                    diretor = filme[4].replace("'", "''")
                    genero = filme[5].replace("'", "''") if filme[5] else ''
                    sinopse = filme[6].replace("'", "''") if filme[6] else ''
                    url_poster = filme[7].replace("'", "''") if filme[7] else ''
                    
                    insert = f"INSERT INTO Filme (id_usuario, titulo, ano, duracao, diretor, genero, sinopse, url_poster) VALUES ({filme[0]}, '{titulo}', {filme[2]}, {filme[3]}, '{diretor}', '{genero}', '{sinopse}', '{url_poster}');\n"
                    f.write(insert)
            
            print("Exportação concluída")

    except sqlite3.Error as e:
        print(f"erro no banco de dados: {e}")
    except IOError as e:
        print(f"erro ao escrever no arquivo: {e}")


# função para atualizar o poster de um filme no banco de dados
def atualizar_poster(filme_id, novo_url):
    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            
            sql_command = "UPDATE Filme SET url_poster = ? WHERE id_filme = ?"
            
            cursor.execute(sql_command, (novo_url, filme_id))
            
            conn.commit()
            
            print(f"Poster do filme com ID {filme_id} atualizado com sucesso!")
            
    except sqlite3.Error as e:
        print(f"erro: {e}")




if __name__ == '__main__':
    exportarFilmes()

#função pra mudar o poster de um filme no banco de dados abaixo

#atualizar_poster(2, 'https://a.ltrbxd.com/resized/film-poster/4/1/4/7/6/3/414763-polar-0-1000-0-1500-crop.jpg')
