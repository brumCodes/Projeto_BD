from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.filmes import filmes_bp
from routes.listas import listas_bp
from routes.usuarios import usuarios_bp

def create_app():
    
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(filmes_bp, url_prefix='/api')
    app.register_blueprint(usuarios_bp, url_prefix='/api')
    app.register_blueprint(listas_bp, url_prefix='/api/listas')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
