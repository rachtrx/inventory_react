import os
from flask import Flask, redirect, url_for, send_from_directory, session
from project.extensions import db, migrate, bcrypt, jwt
from datetime import timedelta
from flask_cors import CORS
from project.api import bp as api_bp


def create_app():

    from .config import Config

    app = Flask(__name__)
    
    app.config.from_object(Config)

    # os.makedirs(f"{os.getenv('APP_FOLDER')}/project/uploads", exist_ok=True)

    # Initialize Flask extensions here
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://127.0.0.1:3000"}})

    app.register_blueprint(api_bp, url_prefix="/api")

    # def add_cors_headers(response):
#     response.headers['Access-Control-Allow-Origin'] = FRONTEND_URL  # Adjust as needed
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
#     response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
#     return response
    
    # ###

    # @app.after_request
    # def after_request(response):
    #     return add_cors_headers(response)

    # # Handles preflight requests
    # @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    # @app.route('/<path:path>', methods=['OPTIONS'])
    # def options_preflight(path):
    #     return add_cors_headers(make_response())

    # @app.route("/")
    # def home_view():
    #     print('hello')
    #     return redirect(url_for('asset.forms.onboard_devices'))

    # @app.route('/static/<path:filename>')
    # def serve_static(filename):
    #     return send_from_directory(app.config["STATIC_FOLDER"], filename)

    # @app.before_request
    # def session_handler():
    #     session.permanent = True
    #     app.permanent_session_lifetime = timedelta(minutes=10)

    return app
