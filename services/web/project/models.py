from project.extensions import db
from datetime import datetime
from dataclasses import dataclass
from sqlalchemy import Numeric
from flask_login import UserMixin


@dataclass
class Admin(UserMixin, db.Model):

    id: int
    username: str
    email: str
    pwd: str

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    pwd = db.Column(db.String(300), nullable=False, unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "adminName": self.username,
            "email": self.email,
            "pwd": self.pwd,
        }


@dataclass
class DeviceType(db.Model):
    id: str
    device_type: str

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    device_type = db.Column(db.String(50), nullable=False)

    # This relationship points to many Model instances
    models = db.relationship("Model", back_populates="device_type", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "assetType": self.device_type,  # IMPT
        }


@dataclass
class Model(db.Model):
    id: str
    device_type_id: str
    model_name: str
    added_date: datetime

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    device_type_id = db.Column(
        db.String(50), db.ForeignKey("device_type.id"), nullable=False
    )
    model_name = db.Column(db.String, nullable=False)
    added_date = db.Column(db.DateTime, default=datetime.utcnow)

    # primary key
    models = db.relationship("Device", back_populates="model", lazy=True)

    # Foreign key
    device_type = db.relationship("DeviceType", back_populates="models", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "assetTypeId": self.device_type_id,  # IMPT
            "variantName": self.model_name,  # IMPT
            # DONT NEED ADDED DATE
        }


@dataclass
class Vendor(db.Model):
    id: str
    vendor_name: str

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    vendor_name = db.Column(db.String, nullable=False)

    # primary key
    vendors = db.relationship("Device", back_populates="vendor")

    def to_dict(self):
        return {
            "id": self.id,
            "vendorName": self.vendor_name,
        }


@dataclass
class Device(db.Model):
    id: str
    serial_number: str
    asset_tag: str
    model_id: str
    bookmarked: int
    status: str
    location: str
    user_id: str
    registered_date: datetime
    vendor_id: str
    model_value: float

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    serial_number = db.Column(db.String(50), unique=True, nullable=False)
    asset_tag = db.Column(db.String(50), unique=True, nullable=False)
    model_id = db.Column(db.String(50), db.ForeignKey("model.id"), nullable=False)
    bookmarked = db.Column(db.Integer(), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String)
    user_id = db.Column(db.String(50), db.ForeignKey("user.id"))
    registered_date = db.Column(db.DateTime, default=datetime.utcnow)
    vendor_id = db.Column(db.String(50), db.ForeignKey("vendor.id"), nullable=False)
    model_value = db.Column(Numeric(precision=10, scale=2))

    # primary key
    events = db.relationship("Event", back_populates="device")

    # foreign keys
    model = db.relationship("Model", back_populates="models")
    user = db.relationship("User", back_populates="devices")
    vendor = db.relationship("Vendor", back_populates="vendors")

    def to_dict(self):
        return {
            "id": self.id,
            "serialNumber": self.serial_number,
            "assetTag": self.asset_tag,
            "variantId": self.model_id,  # IMPT
            "bookmarked": self.bookmarked,
            "status": self.status,
            "location": self.location,
            "userId": self.user_id,
            "registeredDate": self.registered_date.isoformat(),
            "vendorId": self.vendor_id,
            "value": (
                float(self.model_value)
                if self.model_value is not None
                else None  # IMPT
            ),
        }


class Dept(db.Model):
    id: str
    dept_name: str

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    dept_name = db.Column(db.String(50), nullable=False)

    # primary key
    depts = db.relationship("User", back_populates="dept", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "deptName": self.dept_name,
        }


@dataclass
class User(db.Model):
    id: str
    user_name: str
    dept_id: str
    bookmarked: int
    created_date: datetime
    has_resigned: int

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    user_name = db.Column(db.String, unique=True, nullable=False)
    dept_id = db.Column(db.String(50), db.ForeignKey("dept.id"))
    bookmarked = db.Column(db.Integer(), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    has_resigned = db.Column(db.Integer(), nullable=False)

    # primary key
    devices = db.relationship("Device", back_populates="user", lazy=True)
    events = db.relationship("Event", back_populates="user")

    # foreign key
    # primary key
    dept = db.relationship("Dept", back_populates="depts", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "userName": self.user_name,
            "deptId": self.dept_id,
            "bookmarked": self.bookmarked,
            "registeredDate": self.created_date.isoformat(),  # IMPT
            "hasResigned": self.has_resigned,
        }


@dataclass
class Event(db.Model):

    id: str
    asset_id: str
    event_type: str
    user_id: str
    remarks: str
    event_date: datetime
    filepath: str

    id = db.Column(db.String(50), primary_key=True, nullable=False)
    asset_id = db.Column(db.String(50), db.ForeignKey("device.id"))
    event_type = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey("user.id"))
    remarks = db.Column(db.Text)
    event_date = db.Column(db.DateTime, default=datetime.utcnow)
    filepath = db.Column(db.String)

    # Foreign key
    device = db.relationship("Device", back_populates="events", lazy=True)
    user = db.relationship("User", back_populates="events", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "assetId": self.asset_id,
            "eventType": self.event_type,
            "userId": self.user_id,
            "remarks": self.remarks,
            "eventDate": self.event_date.isoformat(),
            "filepath": self.filepath,
        }
