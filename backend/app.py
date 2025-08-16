from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.filmes import filmes_bp
from routes.listas import listas_bp

def create_app():
    #Cria a instância da aplicação Flask
    app = Flask(__name__)
    CORS(app)


    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(filmes_bp, url_prefix='/api')
    app.register_blueprint(listas_bp, url_prefix='/api')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)