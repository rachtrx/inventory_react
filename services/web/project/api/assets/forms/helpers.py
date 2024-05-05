from project.extensions import db
from project.models import Device, Event
from sqlalchemy import update
from datetime import datetime

AVAILABLE = 'available'

def python_time(isoString):
    dt_object = datetime.strptime(isoString, "%Y-%m-%dT%H:%M:%S.%fZ")
    # Return a new date object containing only the year, month, and day
    return dt_object.date()

def insert_device_event(event_id, asset_id, event_type, remarks, user_id=None, event_date=None, file_path=None):

    event = Event(
        id=event_id,
        asset_id=asset_id,
        event_type=event_type,
        remarks=remarks,
        user_id=user_id if user_id else None,
        event_date=event_date if event_date else None,
        filepath=file_path if file_path else None
    )

    db.session.add(event)


def insert_user_event(event_id, event_type, user_id, remarks, event_date=None):

    event = Event(id=event_id, event_type=event_type, user_id=user_id,
                  remarks=remarks, event_date=event_date if event_date else None)

    db.session.add(event)


def update_status(asset_id, event_type, user_id=None):

    stmt = update(Device).where(Device.id == asset_id).values(
        status=event_type, user_id=user_id if user_id else None)

    # Execute the update statement
    db.session.execute(stmt)