from flask import Flask, render_template, send_from_directory, request, redirect, url_for, flash, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_dance.consumer import oauth_authorized
from dotenv import load_dotenv
import os
from PIL import Image
import random

load_dotenv()
PIXEL_SIZE = 10

HABIT_IMAGES = [
    "static/habit_templates/circle.png",
    "static/habit_templates/star.png",
    "static/habit_templates/heart.png",
    "static/habit_templates/cloud.png",
    "static/habit_templates/tree.png",
]


app = Flask(__name__, static_folder='static', template_folder='.')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'google.login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(120), unique=True, nullable=False)

class OAuth(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), primary_key=True)
    provider = db.Column(db.String(50), primary_key=True)
    token = db.Column(db.String(256), nullable=False)
    user = db.relationship('User', backref=db.backref('oauth', lazy=True))

blueprint = make_google_blueprint(
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    scope=["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "openid"],
    storage=SQLAlchemyStorage(OAuth, db.session, user=current_user)
)
app.register_blueprint(blueprint, url_prefix="/login")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@oauth_authorized.connect_via(blueprint)
def google_logged_in(blueprint, token):
    if not token:
        flash("Failed to log in with Google.", category="error")
        return False

    resp = google.get("/oauth2/v1/userinfo")
    if not resp.ok:
        flash("Failed to fetch user info from Google.", category="error")
        return False

    google_info = resp.json()
    google_user_id = google_info["id"]

    query = OAuth.query.filter_by(provider=blueprint.name, token=google_user_id)
    try:
        oauth = query.one()
    except NoResultFound:
        oauth = OAuth(provider=blueprint.name, token=google_user_id)

    if oauth.user:
        login_user(oauth.user)
        flash("Successfully signed in with Google.")
    else:
        user = User(email=google_info["email"], name=google_info["name"])
        oauth.user = user
        db.session.add_all([user, oauth])
        db.session.commit()
        login_user(user)
        flash("Successfully signed in with Google.")

    return False

class Task(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    content = db.Column(db.String(200), nullable = False)
    deadline = db.Column(db.DateTime, nullable = False)
    completed = db.Column(db.Boolean, default = False)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    name = db.Column(db.String(200), nullable = False)
    target = db.Column(db.DateTime, nullable = False)
    creation_date = db.Column(db.DateTime, nullable=False, default = datetime.utcnow)


def create_missing_tables():
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()
    
    for table_name, table in db.metadata.tables.items():
        if table_name not in existing_tables:
            table.create(db.engine)

@app.route('/')
def home():
    return render_template('templates/index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/pomodoro')
def pomodoro():
    return render_template('templates/pomodoro.html')

@app.route('/prioritizer')
@login_required
def prioritizer():
    return render_template('templates/prioritizer.html')

@app.route('/api/tasks', methods = ['GET', 'POST'])
@login_required
def handle_tasks():
    if request.method == 'POST':
        content = request.json.get('content')
        deadline = datetime.strptime(request.json.get('deadline'), '%Y-%m-%d')
        new_task = Task(user_id = current_user.id, content = content, deadline = deadline)
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"id": new_task.id}), 201
    else:
        tasks = Task.query.filter_by(user_id = current_user.id, completed = False).all()
        return  jsonify([{"id": task.id, "content": task.content, "deadline": task.deadline.strftime('%Y-%m-%d')} for task in tasks]) 
    
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    task.completed = True
    db.session.commit()
    return "", 204

@app.route('/mindfulness')
def mindfulness():
    return "Mindfulness App Page"

@app.route('/noisecancelling')
def noisecancelling():
    return render_template('templates/noisecancelling.html')

@app.route('/schedule')
def schedule():
    return "Visual Schedule Maker Page"

@app.route('/habits')
@login_required
def habits():
    return render_template('templates/habits.html')

@app.route('/api/habits', methods = ['GET', 'POST'])
@login_required
def handle_habits():
    if request.method == 'POST':
        name = request.json.get('name')
        target = datetime.strptime(request.json.get('target'), '%Y-%m-%d')

        new_habit = Habit(user_id=current_user.id, name=name, target=target, creation_date = datetime.utcnow())
        db.session.add(new_habit)
        db.session.commit()
        return jsonify({"id": new_habit.id}), 201
    else:
        habits = Habit.query.filter_by(user_id = current_user.id).all()
        return jsonify([
            {
                "id": habit.id,
                "name": habit.name,
                "target": habit.target.strftime('%Y-%m-%d'),
                "creation_date": habit.creation_date.strftime('%Y-%m-%d')
            } for habit in habits
        ])
    
@app.route('/habit/<int:habit_id>')
@login_required
def habit_detail(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    if habit.user_id != current_user.id:
        abort(403)
    return render_template('templates/habit_detail.html', habit=habit)

@app.route('/api/habit/<int:habit_id>/miss_day', methods=['POST'])
@login_required
def miss_day(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    if habit.user_id != current_user.id:
        abort(403)
    habit.target = habit.target + timedelta(days=1)
    db.session.commit()
    return jsonify({"new_target": habit.target.strftime('%Y-%m-%d')}), 200

@app.route('/static/habit_images/<path:filename>')
def serve_habit_image(filename):
    return send_from_directory('static/habit_images', filename)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


if __name__ == '__main__':
    with app.app_context():
        create_missing_tables()
    app.run(debug=True)