import os
import logging

logging.basicConfig(filename='/home/app/web/logs/app.log', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

basedir = os.path.abspath(os.path.dirname(__file__))
print(basedir)


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_TOKEN_LOCATION = ['cookies']
    # # JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_COOKIE_SECURE = True # for https
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60
    JWT_ACCESS_COOKIE_NAME = 'access_token_cookie'
    # JWT_COOKIE_DOMAIN = None

    # Database
    if not os.getenv("DATABASE_URL") is None:
        SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
        STATIC_FOLDER = os.path.join(os.getenv("APP_FOLDER"), "project", "static")
        UPLOADS_FOLDER = os.path.join(os.getenv("APP_FOLDER"), "project", "uploads")
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'inventory.db')
        STATIC_FOLDER = f"{basedir}/static"
        UPLOADS_FOLDER = f"{basedir}/uploads"
        os.makedirs(UPLOADS_FOLDER, exist_ok=True)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls'}
