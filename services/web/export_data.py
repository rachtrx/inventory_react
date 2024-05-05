import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from project.models import *
import json
from project import create_app

app = create_app()

data = {}

with app.app_context():
    try:
        data = {
            "admins": [admin.to_dict() for admin in db.session.query(Admin).all()],
            "device_types": [
                device_type.to_dict()
                for device_type in db.session.query(DeviceType).all()
            ],
            "models": [model.to_dict() for model in db.session.query(Model).all()],
            "vendors": [vendor.to_dict() for vendor in db.session.query(Vendor).all()],
            "devices": [device.to_dict() for device in db.session.query(Device).all()],
            "depts": [dept.to_dict() for dept in db.session.query(Dept).all()],
            "users": [user.to_dict() for user in db.session.query(User).all()],
            "events": [event.to_dict() for event in db.session.query(Event).all()],
        }
    except Exception as e:
        print(f"Failed to fetch data: {e}")

# Write data to a JSON file
try:
    with open("data_export.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
except Exception as e:
    print(f"Failed to write data to file: {e}")
