import os
from os.path import join, dirname
from project import create_app
from project.extensions import db
from project.models import *
from flask_bcrypt import generate_password_hash
from dotenv import load_dotenv
import logging

if not os.getenv("DATABASE_URL"):
    print(True)
    load_dotenv(join(dirname(__file__), ".flask_env"))

logging.basicConfig(
    filename="/var/log/app.log",  # Log file path
    filemode="a",  # Append mode
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",  # Log message format
    level=logging.INFO,  # Log level
)

app = create_app()

print(app.url_map)
print("PRINTED MAP")


@app.cli.command("create_db")
def create_db():
    db.create_all()
    db.session.commit()


@app.cli.command("remove_db")
def remove_db():
    db.drop_all()
    db.session.commit()


@app.cli.command("seed_db")
def seed_db():
    db.session.add(
        Admin(
            email=os.getenv("APP_EMAIL"),
            pwd=generate_password_hash(os.getenv("APP_PASSWORD")).decode("utf8"),
            username=os.getenv("APP_USERNAME"),
        )
    )
    db.session.commit()
