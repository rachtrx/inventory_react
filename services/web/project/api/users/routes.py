from flask import render_template, request, jsonify, redirect, url_for
from flask_jwt_extended import jwt_required
from project.api.users import bp
from project.extensions import db
from project.models import Device, Model, User, Event, Vendor, DeviceType, Dept
from sqlalchemy import desc, exists, distinct, func, and_
import os

def get_users_filters():
    # get filters
    _depts = db.session.query(Dept.dept_name).distinct().all()
    _users = db.session.query(User.user_name).distinct().all()
    filters = {
        "depts": [row[0] for row in _depts],
        "users": [row[0] for row in _users],
    }
    return filters

@bp.route('/', endpoint="users_view")
@jwt_required()
def users_view(): # TODO seems like this only includes the filters

    filters = get_users_filters()

    if not db.session.query(exists().where(Device.id.isnot(None))).scalar() or not db.session.query(exists().where(User.id.isnot(None))).scalar():
        return jsonify([filters, []]), 200

    data = db.session.query(
        User.id.label('user_id'),
        User.user_name,
        Dept.dept_name,
        User.bookmarked.label('user_bookmarked'),
        User.has_resigned,
        User.created_date,
        Device.id.label('asset_id'),
        Device.asset_tag,
        Model.model_name,
        Device.bookmarked.label('device_bookmarked')
    ).outerjoin(
        Device, Device.user_id == User.id
    ).outerjoin(
        Model, Model.id == Device.model_id
    ).join(
        Dept, Dept.id == User.dept_id
    ).filter(User.has_resigned != 1).order_by(User.created_date.desc()).all()

    result = [dict(row._asdict()) for row in data]

    return jsonify([filters, result])

@bp.route('/<userId>', endpoint="generate_show_user")
@jwt_required()
def generate_show_user(userId):

    raw_details = db.session.query(
        User.id.label('user_id'),
        User.user_name,
        Dept.dept_name,
        User.bookmarked.label('user_bookmarked'),
        User.has_resigned
    ).join(
        Dept, Dept.id == User.dept_id
    ).filter(User.id == userId)

    details = [dict(row._asdict()) for row in raw_details]

    raw_events = db.session.query(
        User.user_name,
        Event.id.label('event_id'),
        Event.event_type,
        Event.asset_id.label('asset_id'),
        Event.event_date,
        Event.remarks,
        Event.filepath,
        Device.asset_tag
    ).join(User, Event.user_id == User.id).outerjoin(Device, Event.asset_id == Device.id).filter(User.id == userId).order_by(Event.event_date.desc()).all()

    events = [dict(row._asdict()) for row in raw_events]

    raw_past_devices = db.session.query(
        Device.id.label('asset_id'),
        Device.serial_number,
        Device.asset_tag,
        Model.model_name,
        Device.bookmarked
    ).join(Event, Device.id == Event.asset_id).join(
        Model, Model.id == Device.model_id
    ).filter(Event.user_id == userId, Event.event_type == 'returned').order_by(Event.event_date.desc()).all()

    past_devices = [dict(row._asdict()) for row in raw_past_devices]

    raw_current_devices = db.session.query(
        Device.id.label('asset_id'),
        Device.serial_number,
        Device.asset_tag,
        Model.model_name,
        Device.bookmarked
    ).join(
        Model, Model.id == Device.model_id
    ).filter(Device.user_id == userId, Device.status == 'loaned').all()

    current_devices = [dict(row._asdict()) for row in raw_current_devices]

    return jsonify([details, events, past_devices, current_devices])

@bp.route('/bookmark/<userId>', methods=["POST"], endpoint="show_user")
@jwt_required()
def show_user():

    data = request.get_json()
    user_id, action = data
    user = User.query.get(user_id)

    if user:
        if action == 'add':
            user.bookmarked = 1
        else:
            user.bookmarked = 0

        db.session.commit()
        return jsonify({"message": "Bookmark updated successfully"})
    else:
        return jsonify({"message": "User not found"})