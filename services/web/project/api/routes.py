import os

from flask import (
    render_template,
    request,
    jsonify,
    send_file,
    redirect,
    url_for,
    current_app,
)
from flask_jwt_extended import jwt_required
from project.api import bp
from project.extensions import db
from project.models import Model, Device, User, Event, Vendor, DeviceType, Dept
from sqlalchemy import and_, func, text, desc, extract, cast, Float, asc, case, exists
from io import BytesIO
from markupsafe import escape
from werkzeug.utils import secure_filename

# from project.api.assets.routes import get_device_filters
from project.api.users.routes import get_users_filters
import logging

# IMPT previously routes for API


def get_device_age_exp():
    if not os.getenv("DATABASE_URL"):
        device_age_exp = func.floor(
            (func.strftime("%s", "now") - func.strftime("%s", Device.registered_date))
            / 31577600
        )
    else:
        device_age_exp = func.floor(
            (func.extract("epoch", func.now() - Device.registered_date) / 31556952)
        )

    return device_age_exp


# SECTION NEW


@bp.route("/events", endpoint="generate_all_events")
@jwt_required()
def generate_all_events():

    logging.info("In events")
    # devices_filters = get_device_filters()
    users_filters = get_users_filters()
    filters = {**devices_filters, **users_filters}

    logging.info("after events")

    if (
        not db.session.query(exists().where(Device.id.isnot(None))).scalar()
        or not db.session.query(exists().where(User.id.isnot(None))).scalar()
    ):
        return jsonify([filters, []]), 200

    data = (
        db.session.query(
            Device.serial_number,
            Device.id.label("asset_id"),
            Device.asset_tag,
            DeviceType.device_type,
            Model.model_name,
            Event.event_type,
            User.user_name,
            Event.event_date,
            User.id.label("user_id"),
        )
        .outerjoin(Device, Event.asset_id == Device.id)
        .outerjoin(User, Event.user_id == User.id)
        .outerjoin(Model, Device.model_id == Model.id)
        .outerjoin(DeviceType, DeviceType.id == Model.device_type_id)
        .order_by(Event.event_date.desc())
        .all()
    )

    result = [dict(row._asdict()) for row in data]

    return jsonify([filters, result])


@bp.route("/dashboard", endpoint="generate_dashboard")
@jwt_required()
def generate_dashboard():

    _top_devices = []
    _top_devices_value = []
    _top_models = []
    _top_models_value = []
    _devices_status = []
    _devices_age = []
    _users = []
    _users_loan = []
    _cost_per_year = []
    _total_cost_per_year = []

    if (
        db.session.query(exists().where(Device.id.isnot(None))).scalar()
        or db.session.query(exists().where(User.id.isnot(None))).scalar()
    ):
        # FILTER TOP DEVICE TYPES

        device_age_exp = get_device_age_exp()

        _top_devices = (
            db.session.query(
                DeviceType.device_type.label("key"),
                func.count(DeviceType.device_type).label("value"),
            )
            .select_from(Device)
            .join(Model, Model.id == Device.model_id)
            .join(DeviceType, DeviceType.id == Model.device_type_id)
            .filter(Device.status != "condemned")
            .group_by(DeviceType.device_type)
            .order_by(func.count(DeviceType.device_type).desc())
            .all()
        )

        # FILTER TOP DEVICE TYPES BY VALUE
        _top_devices_value = (
            db.session.query(
                DeviceType.device_type.label("key"),
                func.sum(cast(Device.model_value, Float)).label("value"),
            )
            .select_from(Device)
            .join(Model, Model.id == Device.model_id)
            .join(DeviceType, DeviceType.id == Model.device_type_id)
            .filter(Device.status != "condemned")
            .group_by(DeviceType.device_type)
            .having(func.sum(cast(Device.model_value, Float)) != 0)
            .order_by(func.sum(cast(Device.model_value, Float)).desc())
            .all()
        )

        # FILTER THE TOP MODELS
        _top_models = (
            db.session.query(
                Model.model_name,
                func.count(Model.model_name).label("model_count"),
                DeviceType.device_type,
            )
            .select_from(Device)
            .join(Model, Model.id == Device.model_id)
            .join(DeviceType, DeviceType.id == Model.device_type_id)
            .filter(Device.status != "condemned")
            .group_by(Model.model_name, DeviceType.device_type)
            .order_by(func.count(Model.model_name).desc())
            .all()
        )

        # FILTER TOP MODELS BY VALUE
        _top_models_value = (
            db.session.query(
                Model.model_name,
                func.sum(Device.model_value).label("model_value"),
                DeviceType.device_type,
            )
            .select_from(Device)
            .join(Model, Model.id == Device.model_id)
            .join(DeviceType, DeviceType.id == Model.device_type_id)
            .filter(Device.status != "condemned", Device.model_value != 0)
            .group_by(DeviceType.device_type, Model.model_name)
            .order_by(func.sum(Device.model_value).desc())
            .all()
        )

        # FILTER STATUS OF MODELS
        _devices_status = (
            db.session.query(
                Device.status.label("key"), func.count(Device.status).label("value")
            )
            .filter(Device.status != "condemned")
            .group_by(Device.status)
            .order_by(func.count(Device.status))
            .all()
        )

        # FILTER AGE OF DEVICES
        _devices_age = (
            db.session.query(
                device_age_exp.label("key"), func.count("*").label("value")
            )
            .filter(Device.status != "condemned")
            .group_by(device_age_exp)
            .order_by(device_age_exp.asc())
            .all()
        )

        _cost_per_year = (
            db.session.query(
                extract("year", Device.registered_date).label("key"),
                func.sum(Device.model_value).label("value"),
                DeviceType.device_type,
            )
            .join(Model, Model.id == Device.model_id)
            .join(DeviceType, DeviceType.id == Model.device_type_id)
            .group_by(extract("year", Device.registered_date), DeviceType.device_type)
            .order_by(
                extract("year", Device.registered_date).asc(), DeviceType.device_type
            )
            .all()
        )

        _total_cost_per_year = (
            db.session.query(
                extract("year", Device.registered_date).label("key"),
                func.sum(Device.model_value).label("value"),
            )
            .join(Model, Model.id == Device.model_id)
            .group_by(extract("year", Device.registered_date))
            .order_by(extract("year", Device.registered_date).asc())
            .all()
        )

        _users = (
            db.session.query(
                Dept.dept_name.label("key"), func.count(Dept.dept_name).label("value")
            )
            .select_from(User)
            .join(Dept, User.dept_id == Dept.id)
            .filter(User.has_resigned != 1)
            .group_by(Dept.dept_name)
            .order_by(func.count(Dept.dept_name))
            .all()
        )

        # FILTER USERS ON LOAN
        _users_loan = (
            db.session.query(
                Dept.dept_name.label("key"), func.count(Dept.dept_name).label("value")
            )
            .select_from(Device)
            .join(User, Device.user_id == User.id)
            .join(Dept, Dept.id == User.dept_id)
            .filter(User.has_resigned != 1)
            .group_by(Dept.dept_name)
            .order_by(func.count(Dept.dept_name))
            .all()
        )

    top_devices = [dict(row._asdict()) for row in _top_devices]
    top_devices_value = [dict(row._asdict()) for row in _top_devices_value]
    top_models = [dict(row._asdict()) for row in _top_models]
    top_models_value = [dict(row._asdict()) for row in _top_models_value]
    devices_status = [dict(row._asdict()) for row in _devices_status]
    devices_age = [dict(row._asdict()) for row in _devices_age]
    users = [dict(row._asdict()) for row in _users]
    users_loan = [dict(row._asdict()) for row in _users_loan]
    cost_per_year = [dict(row._asdict()) for row in _cost_per_year]
    total_cost_per_year = [dict(row._asdict()) for row in _total_cost_per_year]

    # print(devices_age)

    return jsonify(
        [
            top_devices,
            top_devices_value,
            top_models,
            top_models_value,
            devices_status,
            devices_age,
            users,
            users_loan,
            cost_per_year,
            total_cost_per_year,
        ]
    )


@bp.route("/edit_data", methods=["POST"], endpoint="update_remarks")
@jwt_required()
def update_remarks():
    data = request.get_json()
    data_type, data_id, data_value = data

    if data_type == "location" or data_type == "value":
        device_details = Device.query.get(data_id)
        if not device_details:
            return jsonify({"error": "Device details not found"}), 400
        if device_details and data_type == "location":
            device_details.location = data_value
        elif device_details and data_type == "value":
            device_details.model_value = data_value
        db.session.commit()
        return jsonify({"message": "Location updated successfully"})
    elif data_type == "remark":
        event = Event.query.get(data_id)
        if event:
            event.remarks = data_value
            db.session.commit()
            return jsonify({"message": "Event remarks updated successfully"})
        else:
            return jsonify({"error": "Event not found"}), 400
    else:
        return jsonify({"error": "Something went wrong"}), 400
