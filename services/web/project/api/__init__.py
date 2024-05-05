from flask import Blueprint
from project.api.assets import bp as assets_bp
from project.api.forms import bp as forms_bp
from project.api.users import bp as users_bp
from project.api.auth import bp as auth_bp

bp = Blueprint('api', __name__)

bp.register_blueprint(assets_bp, url_prefix='/assets')
bp.register_blueprint(forms_bp, url_prefix='/forms')
bp.register_blueprint(users_bp, url_prefix='/users')
bp.register_blueprint(auth_bp, url_prefix='/auth')

from . import routes
