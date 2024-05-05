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

AVAILABLE = 'available'

# Parse the ISO string and convert it to Python datetime object

@bp.route('/onboard', methods=["GET", "POST"], endpoint="onboard_devices")
@jwt_required()
def onboard_devices():
    if request.method == "GET":
        return render_template("/forms/onboard.html")
    else:
        data = request.get_json()
        deviceArr, modelsObj, usersObj, vendorArr = data
        newUserIds = []

        for vendor_name in vendorArr:
            if not db.session.query(exists().where(Vendor.id.isnot(None))).scalar() or not db.session.query(Vendor).filter(func.lower(Vendor.vendor_name) == vendor_name.lower()).all():
                vendor = Vendor(id=uuid.uuid4().hex, vendor_name=vendor_name)
                db.session.add(vendor)

        for dept in usersObj:
            # check if new dept
            try:
                dept_id = db.session.query(Dept.id).filter(
                    func.lower(Dept.dept_name) == dept.lower()).first()[0]
            except Exception:
                dept_id = uuid.uuid4().hex
                new_dept = Dept(id=dept_id, dept_name=dept)
                db.session.add(new_dept)

            for user in usersObj.get(dept):
                if not db.session.query(exists().where(User.id.isnot(None))).scalar() or not db.session.query(User).filter(func.lower(User.user_name) == user.lower()).all():
                    user_id = uuid.uuid4().hex
                    user = User(id=user_id, user_name=user,
                                dept_id=dept_id, has_resigned=0, bookmarked=0)
                    db.session.add(user)
                    # add to new users
                    newUserIds.append(user_id)

        for device_type in modelsObj:
            # check if new device type
            try:
                device_type_id = db.session.query(DeviceType.id).filter(
                    func.lower(DeviceType.device_type) == device_type.lower()).first()[0]
            except Exception:
                device_type_id = uuid.uuid4().hex
                new_device_type = DeviceType(
                    id=device_type_id, device_type=device_type)
                db.session.add(new_device_type)

            for model_name in modelsObj.get(device_type):
                if not db.session.query(exists().where(Model.id.isnot(None))).scalar() or not db.session.query(Model).filter(func.lower(Model.model_name) == model_name.lower()).all():
                    model_id = uuid.uuid4().hex
                    model = Model(
                        id=model_id, device_type_id=device_type_id, model_name=model_name)
                    db.session.add(model)

        # add devices, add register and loan events
        for device in deviceArr:
            # check unqiue SN
            if db.session.query(exists().where(Device.id.isnot(None))).scalar():
                cur_serial_number = db.session.query(Device).filter(func.upper(Device.serial_number) == device['serialNumber'].upper()).first()
                if cur_serial_number:
                    return jsonify({'error': "Serial Number {} already exists!".format(device['serialNumber'])}), 400
                # check unique AT
                cur_asset_tag = db.session.query(Device).filter(func.upper(Device.asset_tag) == device['assetTag'].upper()).first()
                if cur_asset_tag:
                    return jsonify({'error': "Asset Tag {} already exists!".format(device['assetTag'])}), 400
                # registered date
                if 'registeredDate' not in device:
                    return jsonify({'error': "Asset Tag {} has no registered date!".format(device['assetTag'])}), 400
            device['registeredDate'] = python_time(device['registeredDate'])

            # model id
            try:
                model_id = db.session.query(Model.id).filter(func.lower(
                    Model.model_name) == device['modelName'].lower()).first()[0]
            except Exception:
                return jsonify({'error': "Asset Tag {} does not have a model".format(device['assetTag'])}), 400
            # user id
            user_id = None
            if 'userName' in device:
                try:
                    user_id = db.session.query(User.id).filter(func.lower(
                        User.user_name) == device['userName'].lower()).first()[0]
                except Exception:
                    return jsonify({'error': "username {} is not added".format(device['userName'])}), 400
            # vendor id
            try:
                vendor_id = db.session.query(Vendor.id).filter(func.lower(
                    Vendor.vendor_name) == device['vendorName'].lower()).first()[0]
            except Exception:
                return jsonify({'error': "Asset Tag {} does not have a vendor".format(device['assetTag'])}), 400

            asset_id = uuid.uuid4().hex

            print(user_id if user_id else None)

            # add to devices
            newDevice = Device(id=asset_id, serial_number=device['serialNumber'].upper(), asset_tag=device['assetTag'].upper(), model_id=model_id, bookmarked=device['bookmarked'], status='loaned' if user_id else AVAILABLE,
                               location=device['location'], vendor_id=vendor_id, user_id=user_id if user_id else None, registered_date=device['registeredDate'], model_value=device['modelValue'])

            db.session.add(newDevice)

            # add to register
            insert_device_event(uuid.uuid4().hex, asset_id, 'registered',
                                device['registeredRemarks'], None, device['registeredDate'])

            # add to loan
            if 'userName' in device:
                device['loanedDate'] = python_time(device['loanedDate'])
                insert_device_event(uuid.uuid4().hex, asset_id, 'loaned',
                                    device['loanedRemarks'], user_id, device['loanedDate'])

        # update user created date
        for newUserId in newUserIds:
            created_date = db.session.query(Event.event_date).filter(
                Event.event_type == 'loaned', Event.user_id == newUserId).order_by(Event.event_date).first()[0]

            stmt = update(User).where(User.id == newUserId).values(
                created_date=created_date)
            insert_user_event(uuid.uuid4().hex, 'created',
                              newUserId, '', event_date=created_date)

            db.session.execute(stmt)

        db.session.commit()

        return redirect(url_for('asset.views.devices_view'))
    
@bp.route('/check_onboard', methods=["POST"], endpoint="check_onboard")
@jwt_required()
def check_onboard():

    data = request.get_json()

    device_arr, models_obj, users_obj, vendor_arr, sn_arr, at_arr, dt_arr, dept_arr = data

    cur_dt_arr = []
    cur_model_arr = []
    cur_dept_arr = []
    cur_user_arr = []
    cur_vendor_arr = []

    if db.session.query(exists().where(Device.id.isnot(None))).scalar():

        # check serial number and asset tag must be different
        serial_numbers = db.session.query(func.upper(Device.serial_number)).all()

        for sn in sn_arr:
            upper_sn = sn.upper()
            if (upper_sn,) in serial_numbers:
                return jsonify({"error": "Duplicate Serial Number {}".format(sn)}), 400

        asset_tags = db.session.query(func.upper(Device.asset_tag)).all()

        for at in at_arr:
            upper_at = at.upper()
            if (upper_at,) in asset_tags:
                return jsonify({"error": "Duplicate Asset Tag {}".format(at)}), 400

    if db.session.query(exists().where(DeviceType.id.isnot(None))).scalar():
        # check if existing device type
        device_types = db.session.query(func.lower(DeviceType.device_type)).all()
        for dt in dt_arr:
            lower_dt = dt.lower()
            if (lower_dt,) in device_types:
                cur_dt_arr.append(dt)

    if db.session.query(exists().where(Model.id.isnot(None))).scalar():
        # check if existing model name
        model_names = db.session.query(Model.model_name).all()
        for dt, modelArr in models_obj.items():
            for model in modelArr:
                if (model,) in model_names:
                    model = db.session.query(Model).filter_by(model_name=model).first()
                    cur_dt = Model.query.get(model.id).device_type.device_type
                    # print(cur_dt)
                    if dt != cur_dt:
                        return jsonify({"error": "{} is already registered as a {}".format(model, cur_dt)}), 400
                    else:
                        cur_model_arr.append(model)

    if db.session.query(exists().where(Dept.id.isnot(None))).scalar():
        # check if existing dept
        depts = db.session.query(func.lower(Dept.dept_name)).all()
        for dept in dept_arr:
            lower_dept = dept.lower()
            if (lower_dept,) in depts:
                cur_dept_arr.append(dept)

    if db.session.query(exists().where(User.id.isnot(None))).scalar():
        # check if existing user
        users = db.session.query(func.lower(User.user_name)).all()
        for dept, user_names in users_obj.items():
            for user_name in user_names:
                lower_user_name = user_name.lower()
                # print("username: {}".format(user_name))
                if (lower_user_name,) in users:
                    cur_dept = db.session.query(Dept.dept_name).join(
                        User.dept_id == Dept.id
                    ).filter(
                        func.lower(User.user_name) == lower_user_name
                    ).first()[0]
                    # print("cur dept: {}".format(cur_dept))
                    if dept != cur_dept:
                        return jsonify({"error": "{} is already a user in {}".format(user_name, cur_dept)}), 400
                    else:
                        cur_user_arr.append(user_name)

    if db.session.query(exists().where(Vendor.id.isnot(None))).scalar():
        # check if existing vendor
        vendors = db.session.query(func.lower(Vendor.vendor_name)).all()

        for vendor in vendor_arr:
            lower_vendor = vendor.lower()
            if (lower_vendor,) in vendors:
                cur_vendor_arr.append(vendor)

    return jsonify([cur_dt_arr, cur_model_arr, cur_dept_arr, cur_user_arr, cur_vendor_arr]), 200