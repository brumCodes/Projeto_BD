# backend/app.py

from flask import Flask
from flask_cors import CORS

# Importamos o nosso blueprint do arquivo auth.py
from routes.auth import auth_bp
from routes.filmes import filmes_bp

def create_app():
    # Cria a instância da aplicação Flask
    app = Flask(__name__)
    CORS(app)


    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(filmes_bp, url_prefix='/api')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)