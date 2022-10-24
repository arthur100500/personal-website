from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired
from wtforms.validators import Length
from wtforms.widgets import TextArea


class PostForm(FlaskForm):
    author = StringField('Имя', validators=[DataRequired(), Length(max=20)])
    text = StringField('Запись', widget=TextArea(), validators=[DataRequired(), Length(max=2048)])
