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

# IMPT previously routes for forms

@bp.route('/register_model', methods=["GET", "POST"], endpoint="create_device")
@jwt_required()
def create_device():
    if request.method == "GET":
        device_types = []
        if db.session.query(exists().where(DeviceType.id.isnot(None))).scalar():
            device_types = db.session.query(DeviceType.device_type).order_by(
                DeviceType.device_type.asc()).all()
            device_types = [device_type[0] for device_type in device_types]
        return render_template("/forms/register_model.html", device_types=device_types)
    else:
        data = request.get_json()
        device_type = data[1]

        # for new device type, check if device type exists
        if device_type[0] == '_':
            device_type = device_type[1:]
            if db.session.query(exists().where(DeviceType.id.isnot(None))).scalar():
                cur_device = db.session.query(DeviceType).filter(
                    func.lower(DeviceType.device_type) == device_type.lower()).first()
                if cur_device:
                    return jsonify({'error': "Device Type {} already exists!".format(device_type)}), 400

            device_type_id = uuid.uuid4().hex
            new_device_type = DeviceType(
                id=device_type_id, device_type=device_type)
            db.session.add(new_device_type)
        else:
            device_type_id = db.session.query(DeviceType.id).filter(
                func.lower(DeviceType.device_type) == device_type.lower()).first()[0]

        models = data[2:]

        # CHECK
        for model in models:
            [model_name] = model

            # check if model name already exists
            if db.session.query(exists().where(Model.id.isnot(None))).scalar():
                cur_model = db.session.query(Model).filter(
                    func.lower(Model.model_name) == model_name.lower()).first()
                if cur_model:
                    return jsonify({'error': "Model {} already exists!".format(model_name)}), 400

        # INSERT
        for model in models:
            [model_name] = model
            model_id = uuid.uuid4().hex
            device_name = Model(
                id=model_id, device_type_id=device_type_id, model_name=model_name)
            db.session.add(device_name)

        db.session.commit()

        return redirect(url_for('asset.views.devices_view'))


@bp.route('/register_device', methods=["GET", "POST"], endpoint="register_device")
@jwt_required()
def register_device():
    print("User ID: {}".format(session.get('user_id')))
    if request.method == "GET":
        vendors = db.session.query(Vendor.vendor_name).distinct().order_by(
            Vendor.vendor_name.asc()).all()
        vendor_names = [vendor[0] for vendor in vendors]
        return render_template("/forms/register_device.html", vendors=vendor_names)
    else:
        data = request.get_json()

        model_id = data[1]

        # check if model name exists
        cur_model_id = db.session.query(Model).get(model_id)
        if not cur_model_id:
            return jsonify({'error': "Model Name does not exist!"}), 400

        vendor_name = data[2]

        # if new vendor, check if vendor already exists
        if vendor_name[0] == '_':
            vendor_name = vendor_name[1:]
            if db.session.query(exists().where(Vendor.id.isnot(None))).scalar():
                cur_vendor = db.session.query(Vendor).filter(
                    func.lower(Vendor.vendor_name) == vendor_name.lower()).first()
                if cur_vendor:
                    return jsonify({'error': "Vendor {} already exists!".format(vendor_name)}), 400
                vendor_id = uuid.uuid4().hex
                vendor = Vendor(
                    id=vendor_id,
                    vendor_name=vendor_name
                )
                db.session.add(vendor)
        else:
            vendor_id = db.session.query(Vendor.id).filter(func.lower(
                Vendor.vendor_name) == vendor_name.lower()).first()[0]

        model_value = data[3]

        try:
            # Try to convert the value to a float
            model_value = float(model_value)
            # If the conversion is successful, format to 2 decimal places
            model_value = "{:.2f}".format(model_value)
        except ValueError:
            # If the conversion fails, return the original value
            model_value = 0

        print(model_value)
        devices = data[4:]

        # CHECK
        asset_tag_arr = []
        for device in devices:
            serial_number, asset_tag, remarks = device
            serial_number = serial_number.upper()
            asset_tag = asset_tag.upper()

            if db.session.query(exists().where(Device.id.isnot(None))).scalar():
                # check if device already exists
                cur_device = db.session.query(Device).filter(
                    Device.asset_tag == asset_tag).first()
                if cur_device:
                    return jsonify({'error': "Asset Tag {} already exists!".format(asset_tag)}), 400
                if asset_tag in asset_tag_arr:
                    return jsonify({'error': "Duplicate Asset Tag {}!".format(asset_tag)}), 400
            asset_tag_arr.append(asset_tag)

        for device in devices:
            serial_number, asset_tag, remarks = device
            serial_number = serial_number.upper()
            asset_tag = asset_tag.upper()

            event_type = 'registered'
            asset_id = uuid.uuid4().hex

            device_details = Device(
                id=asset_id,
                serial_number=serial_number,
                asset_tag=asset_tag,
                model_id=model_id,
                bookmarked=0,
                status=AVAILABLE,
                location='unknown',
                model_value=model_value,
                vendor_id=vendor_id
            )
            db.session.add(device_details)

            event_id = uuid.uuid4().hex
            insert_device_event(event_id, asset_id, event_type, remarks)

        db.session.commit()

        print('finish registering')

        return redirect(url_for('asset.views.history_view'))

@bp.route('/condemned_device', methods=["GET", "POST"], endpoint="condemned_device")
@jwt_required()
def condemned_device():
    if request.method == "GET":
        return render_template("/forms/condemned_device.html")
    else:
        devices = request.get_json()
        is_excel = devices.pop(0)
        new_devices = []

        # CHECK
        asset_id_arr = []
        for device in devices:
            if is_excel:
                asset_tag, remarks = device
                asset_tag = asset_tag.upper()
                cur_asset_id = db.session.query(Device.id).filter(
                    Device.asset_tag == asset_tag).first()
                # check for asset tag
                if not cur_asset_id:
                    return jsonify({'error': "Asset tag {} not found!".format(asset_tag)}), 400
                else:
                    asset_id = cur_asset_id[0]
                    if asset_id in asset_id_arr:
                        return jsonify({'error': "Can't delete the same device!"}), 400
            else:
                asset_id, remarks = device
            # create array to track duplicates
            asset_id_arr.append(asset_id)

            # need to get the asset id instead of the asset tag
            device.append(asset_id)
            new_devices.append(device)

            # check for asset tag and status of device
            cur_status = db.session.query(Device.status).filter(
                Device.id == asset_id).first()
            if not cur_status:
                return jsonify({'error': "Asset not found!"}), 400
            if cur_status[0] == 'loaned':
                return jsonify({'error': "Asset tag {} still on loan!".format(asset_tag)}), 400
            if cur_status[0] == 'condemned':
                return jsonify({'error': "Asset tag {} is already condemned!".format(asset_tag)}), 400

        event_type = 'condemned'
        # INSERT
        for device in new_devices:
            asset_tag, remarks, asset_id = device
            asset_tag = asset_tag.upper()

            event_id = uuid.uuid4().hex
            insert_device_event(event_id, asset_id, event_type, remarks)
            update_status(asset_id, event_type)

        db.session.commit()

        return redirect(url_for('asset.views.history_view'))