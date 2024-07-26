from flask import Flask, render_template, send_from_directory, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', template_folder='.')

app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://eshan:eshansqlpassword@localhost/adhd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    logger.debug(f"load_user called with user_id: {user_id}")
    if user_id is not None and user_id != 'None':
        try:
            user = User.query.get(int(user_id))
            logger.debug(f"User loaded: {user}")
            return user
        except ValueError:
            logger.error(f"ValueError: invalid user_id: {user_id}")
            return None
    logger.debug("user_id is None or 'None'")
    return None


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
def prioritizer():
    return "Task Prioritizer Page"

@app.route('/mindfulness')
def mindfulness():
    return "Mindfulness App Page"

@app.route('/noisecancelling')
def noisecancelling():
    return "Noise-Cancelling Audio Page"

@app.route('/schedule')
def schedule():
    return "Visual Schedule Maker Page"

@app.route('/habits')
def habits():
    return "Habit Tracker Page"

@app.route('/register', methods = ['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email = email).first()
        if user:
            flash('Account with email already exists')
            return redirect(url_for('login'))
        
        new_user = User(name = name, email = email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)
        flash("Succesfully Registered, you are now logged in")
        return redirect(url_for('home'))
    return render_template('templates/register.html')

@app.route('/login', methods = ['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('home'))
        flash('Invalid email or password')
    return render_template('templates/login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


if __name__ == '__main__':
    with app.app_context():
        create_missing_tables()
    app.run(debug=True)