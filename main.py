import json
import random
import sys
import os

from flask import Flask, render_template, request, redirect, url_for

from post_model import Post
from post_form import PostForm
from db import *

app = Flask(__name__)

# SQLAlchemy config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.getcwd() + "/" + SQLITE_DATABASE_NAME
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = "among-us-ХИХИХИХАХАХАХАХХАХИХИХИХИХИАХХАХАХАИХИХИХИХХАХАХА"

# Init Database
db.app = app
db.init_app(app)

clrGrads = [[[0.941, 0.502, 0.502, 1.0], [1, 0.855, 0.725, 1.0]]]





@app.route('/add_post', methods=['POST'])
def add_post():
    form = PostForm()
    if request.method == "POST":
        if form.validate_on_submit():
            text = request.form.get('text', type=str, default='')
            author = request.form.get('author', type=str, default='')
            db.session.add(Post(text=text, author=author))
            db.session.commit()
            return "success"
    return "fail"


@app.route('/')
def main_page():
    form = PostForm()
    posts = Post.query.all()
    return render_template("index.html", colors=random.choice(clrGrads), posts=posts, form=form)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == "init":
            with app.app_context():
                db_init()
                exit(0)

    app.run(host='0.0.0.0')
