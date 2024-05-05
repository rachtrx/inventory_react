import uuid
import json
import os

from flask import render_template, request, jsonify, redirect, url_for, current_app, session, send_file
from flask_jwt_extended import jwt_required
from project.api.forms import bp
from project.extensions import db
from project.models import Model, Device, User, Event, Vendor, DeviceType, Dept
from sqlalchemy import update, func, exists, asc, desc
from urllib.parse import unquote
from datetime import datetime
from sqlalchemy.orm.exc import NoResultFound

from .helpers import python_time, insert_device_event, insert_user_event, update_status, AVAILABLE

@bp.route('/loan_device', methods=["GET", "POST"], endpoint="loan_device")
@jwt_required()
def loan_device():
    if request.method == "GET":
        return render_template("/forms/loan_device.html")
    else:
        data = request.get_json()

        event_type = 'loaned'

        file_name = data[0]

        devices = data[1:]

        # CHECK
        for device in devices:
            asset_id, user_id, remarks = device

            # check if status is loaned or condemned
            cur_status = db.session.query(Device.status).filter(
                Device.id == asset_id).first()
            if not cur_status:
                return jsonify({'error': "Asset not found!"}), 400
            if cur_status[0] == 'loaned':
                return jsonify({'error': "Asset is still on loan!"}), 400
            if cur_status[0] == 'condemned':
                return jsonify({'error': "Asset tag is already condemned!"}), 400

        # INSERT
        for device in devices:
            asset_id, user_id, remarks = device
            event_id = uuid.uuid4().hex
            if file_name is False:
                file_path = None
            else:
                file_path = file_name
            print(file_path)
            insert_device_event(event_id, asset_id, event_type,
                                remarks, user_id, None, file_path)
            update_status(asset_id, event_type, user_id)

        if file_name is False:
            db.session.commit()
            return jsonify(asset_id), 200

        db.session.commit()

        return jsonify(asset_id), 200


@bp.route('/returned_device', methods=["GET", "POST"], endpoint="returned_device")
@jwt_required()
def returned_device():
    if request.method == "GET":
        return render_template("/forms/returned_device.html")
    else:
        data = request.get_json()
        print(data)

        event_type = 'returned'

        file_name = data[0]

        devices = data[2:]

        # CHECK
        for device in devices:
            asset_id, user_id, remarks = device

            # check if status is not on loan
            cur_status = db.session.query(Device.status).filter(
                Device.id == asset_id).first()
            if not cur_status:
                return jsonify({'error': "Asset not found!"}), 400
            if cur_status[0] != 'loaned':
                return jsonify({'error': "Asset is not on loan!"}), 400

        # INSERT
        for device in devices:
            asset_id, user_id, remarks = device

            event_id = uuid.uuid4().hex
            if file_name is False:
                file_path = None
            else:
                file_path = file_name
            print(file_path)
            insert_device_event(event_id, asset_id, event_type,
                                remarks, user_id, None, file_path)
            update_status(asset_id, AVAILABLE)

        loan_event_id = data[1]
        if not loan_event_id:
            db.session.commit()
            return jsonify(asset_id), 200

        loan_event = Event.query.get(loan_event_id)

        print('loan event filepath: {}'.format(loan_event.filepath))

        try:
            print(os.path.join(current_app.config["UPLOADS_FOLDER"], loan_event.filepath))
            os.remove(os.path.join(current_app.config["UPLOADS_FOLDER"], loan_event.filepath))
        except FileNotFoundError:
            return jsonify({'error': 'File not found'}), 400
        except Exception:
            return jsonify({'error': 'Error occurred while deleting the file:'}), 400

        loan_event.filepath = None
        print('done!')
        db.session.commit()

        return jsonify(asset_id), 200