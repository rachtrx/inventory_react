from flask import render_template, request, jsonify
from flask_jwt_extended import jwt_required
from project.api.assets import bp
from project.extensions import db
from project.models import Device, Model, User, Event, Vendor, DeviceType
from sqlalchemy import exists, func, and_
import os


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


# IMPT previously routes for views


@bp.route("/", methods=["GET"], endpoint="device_filters")
@jwt_required()
def device_filters():
    device_age_exp = get_device_age_exp()

    _device_types = db.session.query(DeviceType.device_type).all()
    _model_names = db.session.query(Model.model_name).all()
    _vendors = db.session.query(Vendor.vendor_name).all()
    _locations = db.session.query(Device.location).distinct().all()
    _ages = (
        db.session.query(get_device_age_exp().label("device_age"))
        .order_by(device_age_exp.asc())
        .distinct()
        .all()
    )

    print(_ages)

    device_types = [row[0] for row in _device_types]
    model_names = [row[0] for row in _model_names]
    vendors = [row[0] for row in _vendors]
    locations = [row[0] for row in _locations]
    ages = sorted([row[0] for row in _ages])

    filters = {
        "asset_types": device_types,
        "asset_models": model_names,
        "vendors": vendors,
        "locations": locations,
        "ages": ages,
    }

    return jsonify(filters)


@bp.route("/", methods=["POST"], endpoint="devices_view")
@jwt_required()
def devices_view():

    filters = request.get_json() or {}

    if (
        db.session.query(exists().where(Device.id.isnot(None))).scalar()
        or not db.session.query(exists().where(User.id.isnot(None))).scalar()
    ):
        return jsonify([])

    query = (
        db.session.query(
            Device.id.label("asset_id"),
            Device.serial_number,
            Device.asset_tag,
            Model.model_name,
            Device.bookmarked.label("device_bookmarked"),
            Device.status,
            Device.registered_date,
            Device.location,
            User.id.label("user_id"),
            User.user_name,
            User.bookmarked.label("user_bookmarked"),
            Vendor.vendor_name,
            DeviceType.device_type,
            get_device_age_exp().label("device_age"),
            Device.model_value,
        )
        .outerjoin(User, and_(Device.user_id == User.id))
        .join(Model, Device.model_id == Model.id)
        .join(Vendor, Device.vendor_id == Vendor.id)
        .join(DeviceType, DeviceType.id == Model.device_type_id)
        .filter(Device.status != "condemned")
    )

    if filters:
        for key, value in filters.items():
            if key == "serial-number" and value:
                query = query.filter(Device.serial_number == value)
            elif key == "asset-tag" and value:
                query = query.filter(Device.asset_tag == value)

    results = query.order_by(Device.registered_date.desc()).all()
    result_dicts = [
        row._asdict() if hasattr(row, "_asdict") else dict(row) for row in results
    ]

    return jsonify(result_dicts)


@bp.route("/<deviceId>", endpoint="generate_show_device")
@jwt_required()
def generate_show_device(deviceId):

    raw_details = (
        db.session.query(
            Device.id.label("asset_id"),
            Device.serial_number,
            Device.asset_tag,
            Model.model_name,
            DeviceType.device_type,
            Device.model_value.label("model_value"),
            Device.bookmarked.label("device_bookmarked"),
            Device.location,
            Device.status,
            Vendor.vendor_name,
        )
        .join(Model, Model.id == Device.model_id)
        .join(Vendor, Device.vendor_id == Vendor.id)
        .join(DeviceType, DeviceType.id == Model.device_type_id)
        .filter(Device.id == deviceId)
    )

    details = [dict(row._asdict()) for row in raw_details]
    print(details)

    raw_events = (
        db.session.query(
            Event.id.label("event_id"),
            Event.event_type,
            Event.event_date,
            Event.remarks,
            Event.filepath,
            User.user_name,
        )
        .join(Device, Event.asset_id == Device.id)
        .outerjoin(User, Event.user_id == User.id)
        .filter(Device.id == deviceId)
        .order_by(Event.event_date.desc())
        .all()
    )

    events = [dict(row._asdict()) for row in raw_events]

    raw_past_users = (
        db.session.query(User.id.label("user_id"), User.user_name, User.bookmarked)
        .join(Event, User.id == Event.user_id)
        .filter(Event.asset_id == deviceId, Event.event_type == "returned")
        .order_by(Event.event_date.desc())
        .all()
    )

    past_users = [dict(row._asdict()) for row in raw_past_users]

    raw_current_user = (
        db.session.query(
            User.id.label("user_id"),
            User.user_name,
            User.bookmarked.label("user_bookmarked"),
        )
        .join(Device, Device.user_id == User.id)
        .filter(Device.id == deviceId)
    )

    current_user = [dict(row._asdict()) for row in raw_current_user]

    return jsonify([details, events, past_users, current_user])


@bp.route("/bookmark/<deviceId>", methods=["POST"], endpoint="show_device")
@jwt_required()
def show_device(deviceId):
    action = request.get_json()

    if action == "add":
        device = db.session.query(Device).filter(Device.id == deviceId).first()
        if device:
            device.bookmarked = 1
            db.session.commit()
            return jsonify({"message": "Bookmark updated successfully"})
        else:
            return jsonify({"error": "Device not found"}), 400
    else:
        device = db.session.query(Device).filter(Device.id == deviceId).first()
        if device:
            device.bookmarked = 0
            db.session.commit()
            return jsonify({"message": "Bookmark updated successfully"})
        else:
            return jsonify({"error": "Device not found"}), 400
