from db import db


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(512), nullable=False)
    text = db.Column(db.String(2048), nullable=False)
    date_created = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())