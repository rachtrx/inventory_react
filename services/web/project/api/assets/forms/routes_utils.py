import os

from flask import render_template, request, jsonify, redirect, url_for, current_app, session, send_file
from flask_jwt_extended import jwt_required
from project.api.forms import bp
from project.extensions import db
from project.models import Model, Device, User, Event, Vendor, DeviceType, Dept
from sqlalchemy import func, asc, desc

# SECTION PDF for retrieving the forms when returning and showing

# FOR RETURN AND SHOW PAGES
@bp.route('/download_pdf', methods=["POST"], endpoint="download_pdf")
@jwt_required()
def download_pdf():
    eventId = request.get_json()

    event = Event.query.get(eventId)
    if not event:
        return 'File not found.'

    file_path = os.path.join(current_app.config["UPLOADS_FOLDER"], event.filepath)
    print(file_path)

    return send_file(file_path, as_attachment=True, mimetype='application/pdf', download_name=event.filepath)

# FOR SHOW PAGES
@bp.route('/get_filename', methods=["POST"], endpoint="get_file_name")
@jwt_required()
def get_file_name():
    eventId = request.get_json()
    event = Event.query.get(eventId)

    file = event.filepath
    file_name = os.path.basename(file)

    return jsonify(file_name)

@bp.route('/upload_pdf', methods=["POST"], endpoint="upload_pdf")
@jwt_required()
def upload_pdf():
    '''this function should be for loans only'''
    # Get the PDF file from the request
    pdf_file = request.files['pdf_file']
    print(pdf_file)

    # Now you can access the JSON data and the PDF file as needed
    # For example, you can save the PDF file to a folder on the server
    pdf_file.save(os.path.join(current_app.config["UPLOADS_FOLDER"], pdf_file.filename))

    return jsonify({'message': 'success'}), 200

# SECTION PREVIEWS
# API FOR MODELS
@bp.route('/models', methods=["POST"], endpoint="generate_models")
@jwt_required()
def generate_models():
    data = request.get_json()
    model_name = "%" + data + "%"
    results = db.session.query(
        Model.id.label('model_id'),
        Model.model_name,
        DeviceType.device_type
    ).join(
        DeviceType, DeviceType.id == Model.device_type_id
    ).filter(
        Model.model_name.ilike(model_name)
    ).order_by(
        Model.added_date
    ).limit(20).all()
    print(results)

    models = [dict(row._asdict()) for row in results]

    return jsonify(models)

# API FOR ASSET TAG
@bp.route('/devices', methods=["POST"], endpoint="generate_devices")
@jwt_required()
def generate_devices():

    raw_data = request.get_json()

    print(raw_data)

    first = raw_data[1]

    data = raw_data[0]

    asset_tag = "%" + data + "%"
    results = db.session.query(
        Device.asset_tag,
        Device.serial_number,
        Model.model_name,
        Device.id.label('asset_id'),
        Device.status
    ).join(
        Model, Model.id == Device.model_id
    ).filter(
        Device.asset_tag.ilike(asset_tag)
    ).order_by(
        desc(Device.status == first)
    ).limit(20).all()

    devices = [dict(row._asdict()) for row in results]

    return jsonify(devices)

# API FOR USERS
@bp.route('/users', methods=["POST"], endpoint="generate_users")
@jwt_required()
def generate_users():
    raw_data = request.get_json()

    isAsc = raw_data[1]

    if isAsc:
        order = asc(User.created_date)
    else:
        order = desc(User.created_date)

    data = raw_data[0]

    user_name = "%" + data + "%"
    results = db.session.query(
        User.id.label('user_id'),
        User.user_name,
        Dept.dept_name,
        User.bookmarked.label('user_bookmarked'),
        User.has_resigned,
        Device.id.label('asset_id'),
        Device.asset_tag,
        Model.model_name,
        Device.bookmarked.label('device_bookmarked'),
    ).outerjoin(
        Device, Device.user_id == User.id
    ).outerjoin(
        Model, Device.model_id == Model.id
    ).join(
        Dept, Dept.id == User.dept_id
    ).group_by(
        User.id, Dept.dept_name, Device.id, Model.model_name
    ).filter(
        User.user_name.ilike(user_name)
    ).order_by(
        asc(User.has_resigned), asc(func.count(Device.asset_tag)), order
    ).all()
    print(results)

    users = [dict(row._asdict()) for row in results]

    return jsonify(users)

# API FOR USER FOR RETURN DEVICE


@bp.route('/user', methods=["POST"], endpoint="generate_user")
@jwt_required()
def generate_user():
    asset_id = request.get_json()
    _user = db.session.query(
        User.id.label('user_id'),
        User.user_name,
        Dept.dept_name
    ).join(
        Device, User.id == Device.user_id
    ).join(
        Dept, Dept.id == User.dept_id
    ).filter(Device.id == asset_id).all()

    _event = db.session.query(
        Event.id.label('event_id'),
        Event.filepath
    ).join(
        Device, Event.asset_id == Device.id
    ).filter(
        Event.event_type == 'loaned', Event.asset_id == asset_id
    ).order_by(desc(Event.event_date)).first()

    user = [dict(row._asdict()) for row in _user]
    print(_event)
    print(type(_event))
    event = [dict(_event._asdict())]

    print(event)

    return jsonify([user, event])