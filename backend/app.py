# backend/app.py

from flask import Flask
from flask_cors import CORS

# 1. Importamos o nosso blueprint do arquivo auth.py
from routes.auth import auth_bp

def create_app():
    # Cria a instância da aplicação Flask
    app = Flask(__name__)
    CORS(app)

    # 2. Registra o blueprint na aplicação
    # O url_prefix='/api' significa que todas as rotas dentro do auth_bp 
    # começarão com /api. Ex: /login vira /api/login
    app.register_blueprint(auth_bp, url_prefix='/api')

    return app

# Este bloco só é necessário se você for rodar com 'python app.py'
# Para 'flask run', ele não é usado.
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)