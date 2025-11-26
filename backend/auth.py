from passlib.hash import pbkdf2_sha256 as pwd_hash
import sqlite3
import os
import smtplib
import random
from email.mime.text import MIMEText
import base64
import re

from functools import wraps
from flask import request, jsonify
from PIL import Image, ImageDraw, ImageFont
import io
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import jwt
from datetime import datetime, timedelta
from ultralytics import YOLO
import torch
from ultralytics.nn.tasks import SegmentationModel, DetectionModel

# Add BOTH models to safe globals
torch.serialization.add_safe_globals([SegmentationModel, DetectionModel])

# ====================== CONFIG ======================
DB_PATH = "users.db"
UPLOADS_DIR = "static/uploads"
BASE_DIR = os.path.dirname(__file__)

# Model paths
DETECT_MODEL_PATH = os.path.join(BASE_DIR, 'detect.weights.keras')
CLASSIFY_MODEL_PATH = os.path.join(BASE_DIR, 'classification.weights.keras')
SEGMENT_MODEL_PATH = os.path.join(BASE_DIR, 'best.pt')

os.makedirs(UPLOADS_DIR, exist_ok=True)

# JWT Secret
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

# Gmail SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "hassankazmi535718@gmail.com"
SENDER_PASSWORD = "ctujxaapcmfbvbzo"

# Classification labels
class_names = ['glioma', 'meningioma', 'notumor', 'pituitary']

# ====================== LOAD MODELS ======================
detect_model = None
classify_model = None
segment_model = None

def load_models():
    global detect_model, classify_model, segment_model
    try:
        detect_model = load_model(DETECT_MODEL_PATH)
        print("Detection model loaded: detect.weights.keras")
    except Exception as e:
        print(f"Error loading detection model: {e}")

    try:
        classify_model = load_model(CLASSIFY_MODEL_PATH)
        print("Classification model loaded: classification.weights.keras")
    except Exception as e:
        print(f"Error loading classification model: {e}")

    try:
        segment_model = YOLO(SEGMENT_MODEL_PATH)
        print(f"YOLO segmentation model loaded: {SEGMENT_MODEL_PATH}")
    except Exception as e:
        print(f"Error loading YOLO model: {e}")

# Load all models at startup
load_models()

# ====================== DATABASE INIT (SAFE MIGRATION) ======================
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # ---- Patients ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL
            )
        ''')
        
        # ---- Doctors (This is the single correct block) ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                country TEXT,
                city TEXT,
                hospital TEXT,
                university TEXT,
                approved INTEGER DEFAULT 0,
                profile_image TEXT,
                about TEXT
            )
        ''')

        # --- THIS IS THE FIX YOU NEED TO ADD ---
        # ---- Auto-add 'about' column to doctors if missing ----
        c.execute("PRAGMA table_info(doctors)")
        columns = [col[1] for col in c.fetchall()]
        if 'about' not in columns:
            try:
                c.execute("ALTER TABLE doctors ADD COLUMN about TEXT")
                print("Added missing column to doctors: about")
            except sqlite3.OperationalError as e:
                print(f"Could not add column 'about' (already exists?): {e}")
        # --- END OF FIX ---

        # ---- Admins ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL
            )
        ''')

        # ---- Chat Messages ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                sender_email TEXT NOT NULL,
                sender_type TEXT NOT NULL,
                message_text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # ---- Pending Users ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS pending_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                user_type TEXT NOT NULL,
                confirmation_code TEXT NOT NULL,
                phone TEXT,
                country TEXT,
                city TEXT,
                hospital TEXT,
                university TEXT
            )
        ''')

        # ---- Patient Records (base) ----
        c.execute('''
            CREATE TABLE IF NOT EXISTS patient_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                age INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                scan_result TEXT,
                file_path TEXT,
                report TEXT,
                processed_image TEXT,
                doctor_email TEXT NOT NULL
            )
        ''')

        # ---- Auto-add segmentation_mask if missing ----
        c.execute("PRAGMA table_info(patient_records)")
        columns = [col[1] for col in c.fetchall()]
        if 'segmentation_mask' not in columns:
            try:
                c.execute("ALTER TABLE patient_records ADD COLUMN segmentation_mask TEXT")
                print("Added missing column: segmentation_mask")
            except sqlite3.OperationalError as e:
                print(f"Could not add column (already exists?): {e}")

        # --- NEW: Auto-add doctor_email if missing ---
        if 'doctor_email' not in columns:
            try:
                c.execute("ALTER TABLE patient_records ADD COLUMN doctor_email TEXT NOT NULL DEFAULT 'unknown'")
                print("Added missing column: doctor_email")
            except sqlite3.OperationalError as e:
                print(f"Could not add column (already exists?): {e}")

        # ---- Default Admin ----
        c.execute(
            'INSERT OR IGNORE INTO admins (email, password, name) VALUES (?, ?, ?)',
            ("admin@example.com", pwd_hash.hash("admin123"), "Admin User")
        )
        conn.commit()
    print("Database initialized successfully")

# ====================== EMAIL ======================
def send_confirmation_email(email, code):
    try:
        msg = MIMEText(f"Your confirmation code is: {code}")
        msg['Subject'] = "Email Verification Code"
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def send_rejection_email(email):
    try:
        msg = MIMEText("There is an issue in your background check. Your account has been deleted.")
        msg['Subject'] = "Account Rejection Notice"
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        return True
    except Exception as e:
        print(f"Rejection email error: {e}")
        return False

# ====================== HELPER FUNCTIONS & DECORATOR ======================
def check_email_exists(email):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            for table in ('patients', 'doctors', 'admins'):
                c.execute(f'SELECT 1 FROM {table} WHERE email = ?', (email,))
                if c.fetchone():
                    return True
            return False
    except Exception as e:
        print(f"Error checking email: {e}")
        return True

def get_doctor_approval_status(email):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT approved FROM doctors WHERE email = ?', (email,))
            result = c.fetchone()
            return result[0] == 1 if result else None
    except Exception as e:
        print(f"Error checking approval: {e}")
        return None



def doctor_approved_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Handle OPTIONS requests for CORS preflight
        if request.method == 'OPTIONS':
            # Return a simple 200 OK response for all preflight requests
            return jsonify({'message': 'OPTIONS preflight successful'}), 200

        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

            if decoded.get('type') != 'doctor':
                return jsonify({'error': 'Doctor access required'}), 403

            # Check if doctor is approved
            email = decoded.get('email')
            conn = sqlite3.connect('users.db', timeout=30)
            cursor = conn.cursor()
            cursor.execute("SELECT approved FROM doctors WHERE email = ?", (email,))
            result = cursor.fetchone()
            conn.close()

            if not result or result[0] != 1:
                return jsonify({'error': 'Doctor not approved'}), 403

            kwargs['auth_email'] = email
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    return decorated_function

# ====================== AUTH FUNCTIONS ======================
def patient_signup(email, password, name):
    if not email or not password or not name:
        return {'error': 'Missing fields'}, 400
    if check_email_exists(email):
        return {'error': 'Email already registered. Try signing in.'}, 400
    code = str(random.randint(100000, 999999))
    hashed = pwd_hash.hash(password)
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute(
                'INSERT INTO pending_users (email, password, name, user_type, confirmation_code) VALUES (?, ?, ?, ?, ?)',
                (email, hashed, name, 'patient', code)
            )
            conn.commit()
        send_confirmation_email(email, code)
        return {'message': 'Signup successful', 'email': email}, 201
    except sqlite3.IntegrityError:
        return {'error': 'Email is already pending verification.'}, 400
    except Exception as e:
        return {'error': str(e)}, 500

def doctor_signup(email, password, name, phone, country, city, hospital, university):
    if not all([email, password, name, phone, country, city, hospital, university]):
        return {'error': 'All fields required'}, 400
    if check_email_exists(email):
        return {'error': 'Email already registered. Try signing in.'}, 400
    code = str(random.randint(100000, 999999))
    hashed = pwd_hash.hash(password)
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute(
                'INSERT INTO pending_users (email, password, name, user_type, confirmation_code, phone, country, city, hospital, university) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (email, hashed, name, 'doctor', code, phone, country, city, hospital, university)
            )
            conn.commit()
        send_confirmation_email(email, code)
        return {'message': 'Signup successful'}, 201
    except sqlite3.IntegrityError:
        return {'error': 'Email is already pending verification.'}, 400
    except Exception as e:
        return {'error': str(e)}, 500

def verify_user(email, code):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT password, name, user_type, phone, country, city, hospital, university FROM pending_users WHERE email = ? AND confirmation_code = ?', (email, code))
            user = c.fetchone()
            if not user:
                return {'error': 'Invalid code'}, 400
            password, name, user_type, phone, country, city, hospital, university = user
            if check_email_exists(email):
                c.execute('DELETE FROM pending_users WHERE email = ?', (email,))
                conn.commit()
                return {'message': 'Account already verified. Proceed to signin.'}, 200
            if user_type == 'patient':
                c.execute('INSERT INTO patients (email, password, name) VALUES (?, ?, ?)', (email, password, name))
            else:
                c.execute('INSERT INTO doctors (email, password, name, phone, country, city, hospital, university, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)', (email, password, name, phone, country, city, hospital, university))
            c.execute('DELETE FROM pending_users WHERE email = ?', (email,))
            conn.commit()
        return {'message': 'Account verified successfully'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

def approve_doctor(email):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('UPDATE doctors SET approved = 1 WHERE email = ?', (email,))
            if c.rowcount == 0:
                return {'error': 'Not found'}, 404
            conn.commit()
            return {'message': 'Approved'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

def reject_doctor(email):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT name FROM doctors WHERE email = ?', (email,))
            if not c.fetchone():
                return {'error': 'Not found'}, 404
            c.execute('DELETE FROM doctors WHERE email = ?', (email,))
            conn.commit()
            send_rejection_email(email)
            return {'message': 'Rejected'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

def get_users():
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT email, name FROM patients')
            patients = [{'email': p[0], 'name': p[1], 'type': 'patient'} for p in c.fetchall()]
            
            c.execute('''
                SELECT email, name, approved, phone, country, 
                       city, hospital, university, profile_image, about 
                FROM doctors
            ''')
            doctors_data = c.fetchall()

            doctors = []
            for d in doctors_data:
                doctors.append({
                    'email': d[0],
                    'name': d[1],
                    'approved': bool(d[2]),
                    'phone': d[3],
                    'country': d[4],
                    'city': d[5],
                    'hospital': d[6],
                    'university': d[7],
                    'profile_image': d[8],
                    'about': d[9],  # <-- This fetches the 'about' data
                    'type': 'doctor'
                })
                
            return {'patients': patients, 'doctors': doctors}, 200
    except Exception as e:
        print(f"Get users error: {str(e)}") # <-- Your error log came from here
        return {'error': str(e)}, 500
# ====================== PATIENT RECORDS ======================
def add_patient_record(name, email, age, doctor_email):
    if not name or not email:
        return {'error': 'Missing name or email'}, 400
    if not doctor_email:
        return {'error': 'Doctor email is required to add a patient'}, 400
        
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT id FROM patients WHERE email = ?', (email,))
            if not c.fetchone():
                return {'error': 'Patient not found. The user must be registered before a record can be added.'}, 404
            
            # --- UPDATED INSERT ---
            c.execute(
                'INSERT INTO patient_records (name, email, age, doctor_email) VALUES (?, ?, ?, ?)', 
                (name, email, age, doctor_email)
            )
            patient_id = c.lastrowid
            conn.commit()
            return {'message': 'Patient added', 'patient_id': patient_id}, 201
    except Exception as e:
        return {'error': str(e)}, 500

def get_patient_records(doctor_email):
    if not doctor_email:
        return {'error': 'Doctor email not provided'}, 400
        
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            # --- UPDATED QUERY ---
            c.execute(
                '''
                SELECT id, name, email, age, created_at, scan_result, 
                       file_path, report, processed_image, segmentation_mask 
                FROM patient_records 
                WHERE doctor_email = ?
                ''',
                (doctor_email,)
            )
            records = [
                {'id': r[0], 'name': r[1], 'email': r[2], 'age': r[3], 'created_at': r[4],
                 'scan_result': r[5], 'file_path': r[6], 'report': r[7],
                 'processed_image': r[8] or '', 'segmentation_mask': r[9] or ''}
                for r in c.fetchall()
            ]
            return {'records': records}, 200
    except Exception as e:
        return {'error': str(e)}, 500

def update_patient_scan_result(patient_id, scan_result):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('UPDATE patient_records SET scan_result = ? WHERE id = ?', (scan_result, patient_id))
            if c.rowcount == 0:
                return {'error': 'Not found'}, 404
            conn.commit()
            return {'message': 'Updated'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

# ====================== DOCTOR PROFILE UPDATE ======================
def update_doctor_profile(email, profile_image=None, about=None, name=None, phone=None, country=None, city=None, hospital=None, university=None):
    filepath_to_save = None
    filename = None
    
    if profile_image:
        allowed_extensions = {'.jpg', '.jpeg', '.png'}
        file_ext = os.path.splitext(profile_image.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return {'error': 'Invalid file type. Only JPG and PNG are allowed.'}, 400
        filename = f"profile_{email.replace('@', '_').replace('.', '_')}{file_ext}"
        filepath_to_save = os.path.join(UPLOADS_DIR, filename)
        try:
            profile_image.save(filepath_to_save)
        except Exception as e:
            return {'error': f'File save error: {str(e)}'}, 500

    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT approved FROM doctors WHERE email = ?', (email,))
            if not c.fetchone():
                return {'error': 'Doctor not found'}, 404
                
            updates = []
            values = []
            
            if filename:
                updates.append('profile_image = ?')
                values.append(filename)
            if about is not None:
                updates.append('about = ?')
                values.append(about)
            if name is not None:
                updates.append('name = ?')
                values.append(name)
            if phone is not None:
                updates.append('phone = ?')
                values.append(phone)
            if country is not None:
                updates.append('country = ?')
                values.append(country)
            if city is not None:
                updates.append('city = ?')
                values.append(city)
            if hospital is not None:
                updates.append('hospital = ?')
                values.append(hospital)
            if university is not None:
                updates.append('university = ?')
                values.append(university)
                
            if not updates:
                return {'error': 'No updates provided'}, 400
                
            values.append(email)
            c.execute(f'UPDATE doctors SET {", ".join(updates)} WHERE email = ?', values)
            conn.commit()
            return {'message': 'Profile updated successfully'}, 200
    except Exception as e:
        return {'error': str(e)}, 500
def patient_required(f):
    """Decorator to require patient authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Handle OPTIONS requests for CORS preflight
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OPTIONS preflight successful'}), 200

        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256']) 

            # The key difference: check for 'patient' type
            if decoded.get('type') != 'patient':
                return jsonify({'error': 'Patient access required'}), 403

            # Patients don't have an 'approved' status to check,
            # so we can proceed directly.
            
            kwargs['auth_email'] = decoded.get('email')
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    return decorated_function
# ====================== IMAGE HELPERS (IMPROVED) ======================
def _preprocess_image(image_base64: str, size=(224, 224)):
    """
    Accepts:
        - data:image/...;base64,BASE64STRING
        - raw BASE64STRING
        - any string with extra commas / spaces
    Returns: (PIL.Image, np.ndarray) – both resized to `size`
    """
    original_length = len(image_base64) if image_base64 else 0
    
    # 1. Keep only the part after the *last* comma (handles double-prefix bugs)
    if ',' in image_base64:
        image_base64 = image_base64.rsplit(',', 1)[-1]

    # 2. Strip whitespace / new-lines / carriage returns
    image_base64 = image_base64.strip().replace('\n', '').replace('\r', '').replace(' ', '')

    # 3. Remove any non-base64 characters (keep only A-Z, a-z, 0-9, +, /, =)
    image_base64 = re.sub(r'[^A-Za-z0-9+/=]', '', image_base64)

    # 4. Add missing padding (Base64 length must be %4 == 0)
    missing = len(image_base64) % 4
    if missing:
        image_base64 += '=' * (4 - missing)

    # 5. Validate that we have actual base64 data
    if not image_base64 or len(image_base64) < 100:
        raise ValueError(f"Base64 string is too short or empty. Original length: {original_length}, After cleanup: {len(image_base64)}")

    # 6. Decode – raise a clear error if still invalid
    try:
        img_data = base64.b64decode(image_base64, validate=True)
    except Exception as e:
        raise ValueError(f"Base64 decode failed: {str(e)}. String length: {len(image_base64)}, First 50 chars: {image_base64[:50]}")

    # 7. Validate we got actual image data
    if len(img_data) < 100:
        raise ValueError(f"Decoded data is too small ({len(img_data)} bytes) to be a valid image")

    # 8. Open with PIL
    try:
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
    except Exception as e:
        raise ValueError(f"PIL cannot open image: {str(e)}. Data size: {len(img_data)} bytes")

    # 9. Resize and convert to numpy array
    img_resized = img.resize(size)
    arr = np.array(img_resized) / 255.0
    arr = np.expand_dims(arr, axis=0)
    
    return img, arr


def _draw_text(img: Image.Image, text: str, pos=(10, 10), color='red'):
    draw = ImageDraw.Draw(img)
    try:
        # --- Use a larger font ---
        font = ImageFont.truetype("arial.ttf", 30)
    except Exception:
        font = ImageFont.load_default()
    draw.text(pos, text, fill=color, font=font)
    return img


def _save_image(img: Image.Image, patient_id: int, suffix: str):
    filename = f"{patient_id}_{suffix}.jpg"
    path = os.path.join(UPLOADS_DIR, filename)
    img.save(path, quality=95)

    # Public URL (adjust host/port if you run behind a proxy)
    url = f"http://127.0.0.1:5000/static/uploads/{filename}"

    # Base64 for instant preview
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    b64 = base64.b64encode(buf.getvalue()).decode()
    # --- RETURN THE DATA URL ---
    return url, f"data:image/jpeg;base64,{b64}", filename


# ====================== MRI SCAN PIPELINE (FULLY SAFE) ======================
def process_mri_scan(patient_id, image_base64):
    if not patient_id or not image_base64:
        return {'error': 'Missing patient_id or image_base64'}, 400

    # ------------------------------------------------------------------
    # 0. PRE-PROCESS BOTH SIZES (640 for YOLO, 224 for TF models)
    # ------------------------------------------------------------------
    try:
        orig_img, _ = _preprocess_image(image_base64, size=(640, 640))
        _, detect_input = _preprocess_image(image_base64, size=(224, 224))
    except Exception as e:
        print(f"MRI preprocess error (patient_id={patient_id}): {e}")
        return {'error': f'Invalid image: {str(e)}'}, 400

    # ------------------------------------------------------------------
    # 1. DETECTION (binary: brain / not-brain)
    # ------------------------------------------------------------------
    if detect_model is None:
        return {'error': 'Detection model not loaded'}, 500

    det_pred = detect_model.predict(detect_input, verbose=0)[0]
    det_idx = int(np.argmax(det_pred))
    det_conf = float(det_pred[det_idx])

    if det_idx == 0 or det_conf < 0.70:
        # CRITICAL FIX: Save invalid result to database
        invalid_message = "Invalid MRI – not a brain scan"
        try:
            with sqlite3.connect(DB_PATH, timeout=30) as conn:
                c = conn.cursor()
                c.execute("PRAGMA table_info(patient_records)")
                columns = [col[1] for col in c.fetchall()]
                
                if 'segmentation_mask' in columns:
                    c.execute('''
                        UPDATE patient_records
                        SET scan_result = ?, processed_image = NULL, segmentation_mask = NULL
                        WHERE id = ?
                    ''', (invalid_message, patient_id))
                else:
                    c.execute('''
                        UPDATE patient_records
                        SET scan_result = ?, processed_image = NULL
                        WHERE id = ?
                    ''', (invalid_message, patient_id))
                conn.commit()
        except Exception as e:
            print(f"DB update failed for invalid MRI (patient_id={patient_id}): {e}")
        
        return {
            'message': invalid_message,
            'classification': {
                'label': 'invalid',
                'confidence': round(det_conf, 4)
            }
        }, 200

    # ------------------------------------------------------------------
    # 2. CLASSIFICATION (glioma / meningioma / notumor / pituitary)
    # ------------------------------------------------------------------
    if classify_model is None:
        return {'error': 'Classification model not loaded'}, 500

    cls_pred = classify_model.predict(detect_input, verbose=0)[0]
    cls_idx = int(np.argmax(cls_pred))
    cls_label = class_names[cls_idx]
    cls_conf = float(cls_pred[cls_idx])

    # ------------------------------------------------------------------
    # 3. YOLO SEGMENTATION (UPDATED)
    # ------------------------------------------------------------------
    if segment_model is None:
        return {'error': 'Segmentation model not loaded'}, 500

    results = segment_model(orig_img, imgsz=640, conf=0.25, iou=0.45, verbose=False)
    
    # --- UPDATED: Start with RGBA for compositing ---
    seg_img = orig_img.copy().convert('RGBA')
    mask_b64 = None
    
    # Store a combined mask for saving
    combined_mask_pil = None

    if results and results[0].masks is not None:
        combined_mask_pil = Image.new('L', seg_img.size, 0)

        for mask in results[0].masks.data:
            mask_np = (mask.cpu().numpy() * 255).astype(np.uint8)
            mask_pil = Image.fromarray(mask_np).resize(seg_img.size, Image.BILINEAR)

            # Add this mask to the combined mask
            combined_mask_pil = Image.max(combined_mask_pil, mask_pil.convert('L'))

            # Red overlay (alpha = mask)
            overlay = Image.new('RGBA', seg_img.size, (255, 0, 0, 0)) # Red, fully transparent
            # Paste solid red (255,0,0) using the mask
            overlay.paste((255, 0, 0), mask=mask_pil.convert('L'))
            
            # Composite with 50% opacity for the red overlay
            seg_img = Image.alpha_composite(seg_img, Image.blend(seg_img, overlay, alpha=0.5))

        # --- UPDATED: Convert back to RGB *after* all masks are applied ---
        # [THIS LINE IS DELETED] seg_img = seg_img.convert('RGB')

        # Encode the *combined mask only* as PNG for the DB
        if combined_mask_pil:
            mask_buf = io.BytesIO()
            combined_mask_pil.save(mask_buf, format='PNG')
            mask_b64 = base64.b64encode(mask_buf.getvalue()).decode()

    # --- NEW: DRAW BOUNDING BOXES (if any) ---
    if results and results[0].boxes is not None:
        draw = ImageDraw.Draw(seg_img)
        for box in results[0].boxes:
            # box.xyxy[0] gives [x1, y1, x2, y2]
            draw.rectangle(box.xyxy[0].tolist(), outline="blue", width=3)

    # ------------------------------------------------------------------
    # 4. ANNOTATE + SAVE FINAL IMAGE
    # ------------------------------------------------------------------
    seg_img = _draw_text(seg_img, f"{cls_label} ({cls_conf:.2f})")

    # --- NEW FIX: Convert back to RGB *after* all drawing is done ---
    seg_img = seg_img.convert('RGB')
    
    # --- UPDATED: Use the data URL (final_b64) in the DB ---
    final_url, final_b64, final_file = _save_image(seg_img, patient_id, "final")

    # ------------------------------------------------------------------
    # 5. UPDATE DB – safe for old schemas
    # ------------------------------------------------------------------
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute("PRAGMA table_info(patient_records)")
            has_mask = any(col[1] == 'segmentation_mask' for col in c.fetchall())
            if has_mask:
                c.execute('''
                    UPDATE patient_records
                    SET scan_result = ?, processed_image = ?, segmentation_mask = ?
                    WHERE id = ?
                ''', (f"{cls_label} (Conf: {cls_conf:.2f})", final_b64, mask_b64, patient_id))
            else:
                c.execute('''
                    UPDATE patient_records
                    SET scan_result = ?, processed_image = ?
                    WHERE id = ?
                ''', (f"{cls_label} (Conf: {cls_conf:.2f})", final_b64, patient_id))
            if c.rowcount == 0:
                return {'error': 'Patient record not found'}, 404
            conn.commit()
    except Exception as e:
        print(f"DB update failed (patient_id={patient_id}): {e}")
        return {'error': f'DB error: {str(e)}'}, 500

    # ------------------------------------------------------------------
    # 6. RETURN RESULT
    # ------------------------------------------------------------------
    return {
        'message': 'Scan processed successfully',
        'detection': {'valid': True, 'confidence': round(det_conf, 4)},
        'classification': {'label': cls_label, 'confidence': round(cls_conf, 4)},
        'segmentation': {
            'mask_base64': f"data:image/png;base64,{mask_b64}" if mask_b64 else None,
            'annotated_image': final_b64,
            'saved_url': final_url,
            'saved_path': final_file
        }
    }, 200


# Backward compatibility
def mri_scan(patient_id, image_base64):
    return process_mri_scan(patient_id, image_base64)

# ====================== SIGNIN ======================
def signin(email, password):
    if not email or not password:
        return {'error': 'Missing credentials'}, 400
    with sqlite3.connect(DB_PATH, timeout=30) as conn:
        c = conn.cursor()
        # Patient
        c.execute('SELECT password, name FROM patients WHERE email = ?', (email,))
        user = c.fetchone()
        if user and pwd_hash.verify(password, user[0]):
            payload = {'email': email, 'name': user[1], 'type': 'patient', 'exp': datetime.utcnow() + timedelta(hours=24)}
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            return {'message': 'Success', 'token': token, 'email': email, 'name': user[1], 'type': 'patient', 'approved': True}, 200
        # Doctor
        c.execute('SELECT password, name, approved FROM doctors WHERE email = ?', (email,))
        user = c.fetchone()
        if user and pwd_hash.verify(password, user[0]):
            approved = user[2] == 1
            payload = {'email': email, 'name': user[1], 'type': 'doctor', 'approved': approved, 'exp': datetime.utcnow() + timedelta(hours=24)}
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            return {'message': 'Success' if approved else 'Pending', 'token': token, 'email': email, 'name': user[1], 'type': 'doctor', 'approved': approved}, 200
        # Admin
        c.execute('SELECT password, name FROM admins WHERE email = ?', (email,))
        user = c.fetchone()
        if user and pwd_hash.verify(password, user[0]):
            payload = {'email': email, 'name': user[1], 'type': 'admin', 'exp': datetime.utcnow() + timedelta(hours=24)}
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            return {'message': 'Success', 'token': token, 'email': email, 'name': user[1], 'type': 'admin', 'approved': True}, 200
    return {'error': 'Invalid'}, 401

# ====================== UTILITIES ======================
def resend_confirmation_code(email):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT name FROM pending_users WHERE email = ?', (email,))
            if not c.fetchone():
                return {'error': 'Not pending'}, 404
            code = str(random.randint(100000, 999999))
            c.execute('UPDATE pending_users SET confirmation_code = ? WHERE email = ?', (code, email))
            conn.commit()
            send_confirmation_email(email, code)
            return {'message': 'Code resent'}, 200
    except Exception as e:
        return {'error': str(e)}, 500

def share_patient_record(patient_id):
    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn:
            c = conn.cursor()
            c.execute('SELECT name, email, age, created_at, scan_result, file_path, report, processed_image FROM patient_records WHERE id = ?', (patient_id,))
            record = c.fetchone()
            if not record:
                return {'error': 'Not found'}, 404
            name, email, age, created_at, scan_result, file_path, report, processed_image = record

        body = f"Name: {name}\nEmail: {email}\nAge: {age}\nScan: {scan_result}\nReport: {report}"
        msg = MIMEText(body)
        msg['Subject'] = "Your Record"
        msg['From'] = SENDER_EMAIL
        msg['To'] = email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, email, msg.as_string())
        return {'message': 'Shared'}, 200
    except Exception as e:
        return {'error': str(e)}, 500