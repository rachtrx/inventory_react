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

@bp.route('/create_user', methods=["GET", "POST"], endpoint="create_user")
@jwt_required()
def create_user():
    if request.method == "GET":
        depts = db.session.query(Dept.dept_name
                                 ).order_by(
            Dept.dept_name.asc()
        ).all()
        dept_names = [dept[0] for dept in depts]
        return render_template("/forms/create_user.html", dept_names=dept_names)
    else:
        data = request.get_json()

        dept = data[1]

        # if new dept, check if dept already exists
        if dept[0] == '_':
            dept = dept[1:]
            cur_dept = db.session.query(Dept).filter(
                func.lower(Dept.dept_name) == dept.lower()).first()
            if cur_dept:
                return jsonify({'error': "Department {} already exists!".format(dept)}), 400

            dept_id = uuid.uuid4().hex
            new_dept = Dept(id=dept_id, dept_name=dept)
            db.session.add(new_dept)
        else:
            dept_id = db.session.query(Dept.id).filter(
                func.lower(Dept.dept_name) == dept.lower()).first()[0]

        print(dept_id)

        # else dept = dept

        users = data[2:]

        # CHECK
        user_name_arr = []
        for user in users:
            user_name, remarks = user
            # check if user exists
            if db.session.query(exists().where(User.id.isnot(None))).scalar():
                cur_user = db.session.query(User).filter(
                    func.lower(User.user_name) == user_name.lower()).first()
                if cur_user:
                    return jsonify({'error': "User Name {} already exists!".format(user_name)}), 400
                if user_name in user_name_arr:
                    return jsonify({'error': "Duplicate usernames!"}), 400
            user_name_arr.append(user_name)

        # INSERT
        for user in users:
            user_name, remarks = user

            user_id = uuid.uuid4().hex
            user = User(
                id=user_id,
                user_name=user_name,
                dept_id=dept_id,
                bookmarked=0,
                has_resigned=0
            )
            db.session.add(user)

            event_id = uuid.uuid4().hex
            event_type = 'created'
            insert_user_event(event_id, event_type, user_id, remarks)

        db.session.commit()

        return redirect(url_for('asset.views.users_view'))


@bp.route('/remove_user', methods=["GET", "POST"], endpoint="remove_user")
@jwt_required()
def remove_user():
    if request.method == "GET":
        return render_template("/forms/remove_user.html")
    else:
        users = request.get_json()
        is_excel = users.pop(0)
        new_users = []

        # CHECK
        user_id_arr = []
        for user in users:
            if is_excel:
                user_name, remarks = user
                # GET THE ID, check if user exists
                cur_user_id = db.session.query(User.id).filter(
                    func.lower(User.user_name) == user_name.lower()).first()
                if not cur_user_id:
                    return jsonify({'error': "User Name {} doesn't exist!".format(user_name)}), 400
                else:
                    user_id = cur_user_id[0]
                    if user_id in user_id_arr:
                        return jsonify({'error': "Can't remove the same user twice!"}), 400
            else:
                user_id, remarks = user
            user_id_arr.append(user_id)
            user.append(user_id)
            new_users.append(user)

            # check for user and if user has resigned
            cur_has_resigned = db.session.query(
                User.has_resigned).filter(User.id == user_id).first()
            if not cur_has_resigned:
                return jsonify({'error': "User doesn't exist!"}), 400
            if cur_has_resigned[0] == 1:
                return jsonify({'error': "User has already been removed!"}), 400

            # check if user has device
            cur_has_device = db.session.query(Device.asset_tag).filter(
                Device.user_id == user_id).first()
            if cur_has_device:
                return jsonify({'error': "{} is still being loaned by the user!".format(cur_has_device[0])}), 400

        # INSERT
        for user in new_users:
            user_name, remarks, user_id = user
            event_type = 'removed'
            event_id = uuid.uuid4().hex

            user = db.session.query(User).filter(User.id == user_id).first()
            if user:
                user.has_resigned = 1
                db.session.commit()
                insert_user_event(event_id, event_type, user_id, remarks)
            else:
                return jsonify({'error': "User not found"}), 400

        db.session.commit()

        return redirect(url_for('asset.views.users_view'))