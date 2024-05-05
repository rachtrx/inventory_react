from flask import (
    render_template,
    request,
    redirect,
    flash,
    url_for,
    session,
    jsonify,
    make_response,
)
from flask_login import login_user, login_required, logout_user
from flask_bcrypt import check_password_hash
from project.extensions import db, jwt
from project.api.auth import bp
from project.models import Admin
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    decode_token,
    set_access_cookies,
    get_jwt_identity,
    unset_jwt_cookies,
)
import logging


@bp.route("/signin", methods=["POST"], strict_slashes=False, endpoint="login")
def login():
    form_data = request.get_json()
    user = Admin.query.filter_by(email=form_data["email"]).first()

    if user and check_password_hash(user.pwd, form_data["password"]):
        access_token = create_access_token(identity=user.id)
        response = make_response(jsonify(logged_in=True))
        set_access_cookies(response, access_token)  # Securely set the JWT in cookies
        return response
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@bp.route("/logout", methods=["POST"], endpoint="logout")
@jwt_required()
def logout():
    response = make_response(jsonify(msg="Logout successful"))
    unset_jwt_cookies(response)
    return response


@bp.route("/check-auth", methods=["GET"], endpoint="check_auth")
@jwt_required()
def check_auth():
    if request.method == "GET":  # The actual request following the preflight
        user_id = get_jwt_identity()
        user = Admin.query.get(user_id)
        logging.info("in get req")
        if user:
            logging.info("user found")
            return jsonify({"isAuthenticated": True})
        else:
            logging.info("user not found")
            return jsonify({"isAuthenticated": False}), 401
    else:
        raise RuntimeError(
            "Weird - don't know how to handle method {}".format(request.method)
        )


# @bp.after_request
# def handle_options(response):
#     response.headers["Access-Control-Allow-Origin"] = "*"
#     response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
#     response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"

#     return response
