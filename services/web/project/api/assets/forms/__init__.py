from flask import Blueprint

bp = Blueprint('forms', __name__)

from . import routes_assets, routes_onboard, routes_transfer, routes_users, routes_utils
