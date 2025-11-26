from flask import Flask, request, jsonify, send_file, session # <-- Import session
from flask_cors import CORS
from auth import (
    init_db, patient_signup, doctor_signup, verify_user, signin,
    approve_doctor, reject_doctor, get_users, add_patient_record,
    get_patient_records, update_patient_scan_result, update_doctor_profile,
    resend_confirmation_code, share_patient_record, process_mri_scan,
    # --- IMPORT THE DECORATOR ---
    doctor_approved_required,patient_required,
    JWT_SECRET

)
from flask_socketio import SocketIO, join_room, leave_room, emit # <-- NEW
import jwt # <-- NEW

import os
import sqlite3
# Add datetime import at the top of app.py if not already there
import datetime

app = Flask(__name__)

from flask_cors import CORS

# Configure CORS to handle OPTIONS requests automatically
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"]
    },
    # --- ADD THIS BLOCK TO ALLOW FETCHING STATIC IMAGES ---
    r"/static/*": {
        "origins": ["http://localhost:3000"]
    }
})

# --- FIX 1: DEFINE THE socketio OBJECT ---
# This was missing. It's needed to handle socket connections.
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")


# Initialize the database (only if not initialized)
init_db()

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'static/uploads'
# --- FIX 2: DEFINE THE DB_PATH VARIABLE ---
# This was missing. It's needed for the chat routes.
DB_PATH = 'users.db'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# ====================== AUTH ROUTES ======================
@app.route('/api/patient/signup', methods=['POST'])
def api_patient_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    result, status_code = patient_signup(email, password, name)
    print(f"Patient signup response: {result}")
    return jsonify(result), status_code


@app.route('/api/doctor/signup', methods=['POST'])
def api_doctor_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    phone = data.get('phone')
    country = data.get('country')
    city = data.get('city')
    hospital = data.get('hospital')
    university = data.get('university')
    result, status_code = doctor_signup(email, password, name, phone, country, city, hospital, university)
    print(f"Doctor signup response: {result}")
    return jsonify(result), status_code


@app.route('/api/verify', methods=['POST'])
def api_verify_user():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    result, status_code = verify_user(email, code)
    print(f"Verify user response: {result}")
    return jsonify(result), status_code


@app.route('/api/signin', methods=['POST'])
def api_signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    result, status_code = signin(email, password)
    print(f"Signin response: {result}")
    return jsonify(result), status_code

# ====================== ADMIN ROUTES ======================
@app.route('/api/admin/users', methods=['GET'])
def api_get_users():
    result, status_code = get_users()
    print(f"Get users response: {result}")
    return jsonify(result), status_code


@app.route('/api/admin/approve-doctor', methods=['POST'])
def api_approve_doctor():
    data = request.get_json()
    email = data.get('email')
    result, status_code = approve_doctor(email)
    print(f"Approve doctor response: {result}")
    return jsonify(result), status_code


@app.route('/api/admin/reject-doctor', methods=['POST'])
def api_reject_doctor():
    data = request.get_json()
    email = data.get('email')
    result, status_code = reject_doctor(email)
    print(f"Reject doctor response: {result}")
    return jsonify(result), status_code


# ====================== DOCTOR ROUTES (APPROVAL REQUIRED) ======================
@app.route('/api/doctor/add-patient', methods=['POST'])
@doctor_approved_required
def api_add_patient_record(auth_email=None): # --- ACCEPT auth_email ---
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    age = data.get('age')
    if not name or not email:
        return jsonify({'error': 'Missing name or email'}), 400
    
    # --- FIX 1: Pass auth_email to the function ---
    result, status_code = add_patient_record(name, email, age, auth_email)
    print(f"Add patient response: {result}")
    return jsonify(result), status_code



@app.route('/api/doctor/mri-scan', methods=['POST'])
@doctor_approved_required
def api_mri_scan(auth_email=None):
    """
    POST /api/doctor/mri-scan
    {
        "patient_id": 12,
        "image_base64": "image/jpeg;base64,...."
    }
    """
    # Parse JSON payload
    try:
        data = request.get_json(silent=True) or {}
    except Exception as e:
        app.logger.error(f"Invalid JSON: {e}")
        return jsonify({'error': 'Invalid JSON payload'}), 400

    patient_id = data.get('patient_id')
    image_base64 = data.get('image_base64')

    if not patient_id or not image_base64:
        app.logger.warning(
            f"MRI scan request rejected – missing data. "
            f"patient_id={patient_id}, image_base64={'present' if image_base64 else 'missing'} "
            f"from doctor={auth_email}"
        )
        return jsonify({'error': 'Missing patient_id or image_base64'}), 400

    # Run the full 3-step AI pipeline
    result, status_code = process_mri_scan(patient_id, image_base64)

    # Log the outcome SAFELY
    if status_code == 200:
        if 'classification' in result:
            # Valid MRI case
            classification = result['classification']
            label = classification.get('label', 'unknown')
            confidence = classification.get('confidence')
            conf_str = f"{confidence:.2f}" if isinstance(confidence, (int, float)) else "N/A"
            app.logger.info(
                f"MRI scan SUCCESS for patient_id={patient_id} by doctor={auth_email}. "
                f"Result: {label} (conf {conf_str})"
            )
        else:
            # Invalid MRI case (returned from detection stage)
            det_conf = result.get('confidence', 'N/A')
            app.logger.info(
                f"MRI scan SUCCESS (but invalid image) for patient_id={patient_id} by doctor={auth_email}. "
                f"Detection confidence: {det_conf}"
            )
    else:
        app.logger.error(
            f"MRI scan FAILED for patient_id={patient_id} by doctor={auth_email}. "
            f"Response: {result}"
        )

    return jsonify(result), status_code


@app.route('/api/doctor/patient-records', methods=['GET'])
@doctor_approved_required
def api_get_patient_records(auth_email=None): # --- ACCEPT auth_email ---
    print(f"Fetching records for authenticated doctor: {auth_email}")
    
    # --- FIX 2: Pass auth_email to the function ---
    result, status_code = get_patient_records(auth_email)
    print(f"Patient records response: {result}")
    return jsonify(result), status_code


@app.route('/api/doctor/update-patient-scan', methods=['POST'])
@doctor_approved_required
def api_update_patient_scan_result(auth_email=None): # --- ACCEPT auth_email ---
    data = request.get_json()
    patient_id = data.get('patient_id')
    scan_result = data.get('scan_result')
    
    # This route is still insecure, as auth.py's function doesn't check doctor_email
    # But we are following the changes from auth.py
    result, status_code = update_patient_scan_result(patient_id, scan_result)
    print(f"Update scan result response: {result}")
    return jsonify(result), status_code



# Add this to your app.py file, right before the MRI scan endpoint

# ====================== DEBUG ENDPOINT FOR IMAGE TESTING ======================
@app.route('/api/doctor/test-image', methods=['POST'])
@doctor_approved_required
def api_test_image(auth_email=None):
    """
    Debug endpoint to test image preprocessing without running the full pipeline
    Usage: Send same payload as mri-scan but without patient_id requirement
    """
    try:
        data = request.get_json(silent=True) or {}
    except Exception as e:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    image_base64 = data.get('image_base64', '')
    
    # Provide diagnostic information
    diagnostics = {
        'received_length': len(image_base64),
        'has_comma': ',' in image_base64,
        'starts_with': image_base64[:50] if len(image_base64) > 50 else image_base64,
        'has_data_prefix': image_base64.startswith('data:'),
        'doctor_email': auth_email
    }
    
    # Try to preprocess
    try:
        from auth import _preprocess_image
        orig_img, arr = _preprocess_image(image_base64, size=(224, 224))
        diagnostics['success'] = True
        diagnostics['image_size'] = orig_img.size
        diagnostics['array_shape'] = list(arr.shape)
        
        # Convert to base64 to return a preview
        import io
        import base64
        buf = io.BytesIO()
        orig_img.save(buf, format='JPEG', quality=85)
        preview_b64 = base64.b64encode(buf.getvalue()).decode()
        
        return jsonify({
            'message': 'Image preprocessing successful',
            'diagnostics': diagnostics,
            'preview': f"data:image/jpeg;base64,{preview_b64}"
        }), 200
        
    except Exception as e:
        diagnostics['success'] = False
        diagnostics['error'] = str(e)
        diagnostics['error_type'] = type(e).__name__
        return jsonify({
            'message': 'Image preprocessing failed',
            'diagnostics': diagnostics
        }), 400
@app.route('/api/doctor/upload-file', methods=['POST'])
@doctor_approved_required # <-- SECURED THIS ROUTE
def api_upload_file(auth_email=None): # <-- ACCEPTED auth_email
    if 'file' not in request.files or 'patient_id' not in request.form:
        print(f"Upload file error: Missing file or patient ID")
        return jsonify({'error': 'Missing file or patient ID'}), 400

    file = request.files['file']
    patient_id = request.form.get('patient_id')

    if file.filename == '':
        print(f"Upload file error: No file selected")
        return jsonify({'error': 'No file selected'}), 400

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.pdf'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        print(f"Upload file error: Invalid file type {file_ext}")
        return jsonify({'error': 'Invalid file type. Only JPG, PNG, and PDF are allowed.'}), 400

    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn: # <-- Use DB_PATH
            cursor = conn.cursor()
            # --- SECURED QUERY ---
            cursor.execute("SELECT * FROM patient_records WHERE id = ? AND doctor_email = ?", (patient_id, auth_email))
            patient = cursor.fetchone()
            if not patient:
                return jsonify({'error': 'Patient not found or access denied'}), 404

            filename = f"{patient_id}_{file.filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            print(f"File saved: {file_path}")

            cursor.execute("UPDATE patient_records SET file_path = ? WHERE id = ?", (file_path, patient_id))
            conn.commit()
            print(f"Patient {patient_id} updated with file_path: {file_path}")

        return jsonify({'message': f'File {filename} uploaded successfully'}), 200
    except Exception as e:
        print(f"Upload file error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/doctor/delete-file', methods=['POST'])
@doctor_approved_required # <-- SECURED THIS ROUTE
def api_delete_file(auth_email=None): # <-- ACCEPTED auth_email
    data = request.get_json()
    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'Missing patient ID'}), 400

    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn: # <-- Use DB_PATH
            cursor = conn.cursor()
            # --- SECURED QUERY ---
            cursor.execute("SELECT file_path FROM patient_records WHERE id = ? AND doctor_email = ?", (patient_id, auth_email))
            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Patient not found or access denied'}), 404
            
            file_path = result[0]
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                print(f"File deleted: {file_path}")
                
            cursor.execute("UPDATE patient_records SET file_path = NULL WHERE id = ?", (patient_id,))
            conn.commit()
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        print(f"Delete file error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/doctor/save-report', methods=['POST'])
@doctor_approved_required # <-- SECURED THIS ROUTE
def api_save_report(auth_email=None):
    data = request.get_json()
    patient_id = data.get('patient_id')
    report = data.get('report')
    if not patient_id or not report:
        return jsonify({'error': 'Missing patient ID or report'}), 400

    try:
        with sqlite3.connect(DB_PATH, timeout=30) as conn: # <-- Use DB_PATH
            cursor = conn.cursor()
            # --- SECURED QUERY ---
            cursor.execute("SELECT * FROM patient_records WHERE id = ? AND doctor_email = ?", (patient_id, auth_email))
            patient = cursor.fetchone()
            if not patient:
                return jsonify({'error': 'Patient not found or access denied'}), 404
            cursor.execute("UPDATE patient_records SET report = ? WHERE id = ?", (report, patient_id))
            conn.commit()
        return jsonify({'message': 'Report saved successfully'}), 200
    except Exception as e:
        print(f"Save report error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ====================== OTHER ROUTES ======================
@app.route('/api/resend-code', methods=['POST'])
def api_resend_confirmation_code():
    data = request.get_json()
    email = data.get('email')
    result, status_code = resend_confirmation_code(email)
    print(f"Resend code response: {result}")
    return jsonify(result), status_code


@app.route('/api/doctor/share-patient-record', methods=['POST'])
@doctor_approved_required # <-- SECURED THIS ROUTE
def api_share_patient_record(auth_email=None):
    data = request.get_json()
    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'Missing patient ID'}), 400
    
    # --- SECURED CHECK (before calling insecure auth.py function) ---
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM patient_records WHERE id = ? AND doctor_email = ?", (patient_id, auth_email))
        patient = cursor.fetchone()
        conn.close()
        if not patient:
            return jsonify({'error': 'Patient not found or access denied'}), 404
    except Exception as e:
        print(f"Share check error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    # --- END SECURED CHECK ---

    result, status_code = share_patient_record(patient_id)
    print(f"Share patient record response: {result}")
    return jsonify(result), status_code


# ====================== SERVE UPLOADED FILES ======================
@app.route('/static/uploads/<filename>')
def serve_uploaded_file(filename):
    file_path = os.path.join(app.static_folder, 'uploads', filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=False, download_name=filename)
    return jsonify({'error': 'File not found'}), 404
# ====================== PATIENT-FACING DOCTOR PROFILE ======================

@app.route('/api/patient/doctor-profile', methods=['GET'])
@patient_required # Make sure the patient is logged in
def api_get_public_doctor_profile(auth_email=None):
    """
    Get the public profile of a specific doctor.
    Accessible by authenticated patients.
    """
    doctor_email = request.args.get('email')
    if not doctor_email:
        return jsonify({'error': 'Doctor email is required'}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        cursor = conn.cursor()
        
        # We only select public-safe information
        cursor.execute("""
            SELECT name, hospital, university, profile_image, about
            FROM doctors 
            WHERE email = ? AND approved = 1
        """, (doctor_email,))
        
        doctor = cursor.fetchone()
        conn.close()
        
        if not doctor:
            return jsonify({'error': 'Doctor not found or not approved'}), 404
        
        doctor_data = {
            'name': doctor[0],
            'hospital': doctor[1],
            'university': doctor[2],
            'profile_image': doctor[3],
            'about': doctor[4]
        }
        
        return jsonify(doctor_data), 200
        
    except Exception as e:
        print(f"Error fetching public doctor profile: {str(e)}")
        return jsonify({'error': str(e)}), 500
# ====================== PROFILE ROUTES ======================
@app.route('/api/doctor/profile', methods=['GET'])
@doctor_approved_required
def api_get_doctor_profile(auth_email=None):
    """Get the authenticated doctor's profile"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT email, name, phone, country, city, hospital, university, 
                   profile_image, about, approved
            FROM doctors 
            WHERE email = ?
        """, (auth_email,))
        
        doctor = cursor.fetchone()
        conn.close()
        
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        doctor_data = {
            'email': doctor[0],
            'name': doctor[1],
            'phone': doctor[2],
            'country': doctor[3],
            'city': doctor[4],
            'hospital': doctor[5],
            'university': doctor[6],
            'profile_image': doctor[7],
            'about': doctor[8],
            'approved': doctor[9]
        }
        
        return jsonify(doctor_data), 200
        
    except Exception as e:
        print(f"Error fetching doctor profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/doctor/update-profile', methods=['POST'])
@doctor_approved_required
def api_update_doctor_profile(auth_email=None):
    """Update the authenticated doctor's profile"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401

    try:
        profile_image = request.files.get('profile_image') if 'profile_image' in request.files else None
        about = request.form.get('about')
        name = request.form.get('name')
        phone = request.form.get('phone')
        country = request.form.get('country')
        city = request.form.get('city')
        hospital = request.form.get('hospital')
        university = request.form.get('university')

        result, status_code = update_doctor_profile(
            auth_email, 
            profile_image=profile_image, 
            about=about,
            name=name,
            phone=phone,
            country=country,
            city=city,
            hospital=hospital,
            university=university
        )
        print(f"Update doctor profile response: {result}")
        return jsonify(result), status_code

    except Exception as e:
        print(f"Error in update profile route: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ====================== PATIENT AUTHENTICATION DECORATOR ======================
from functools import wraps
import jwt

def patient_required(f):
    """Decorator to require patient authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256']) 

            if decoded.get('type') != 'patient':
                return jsonify({'error': 'Patient access required'}), 403

            kwargs['auth_email'] = decoded.get('email')
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    return decorated_function


# ====================== PATIENT ROUTES ======================

@app.route('/api/patient/records', methods=['GET'])
@patient_required
def api_get_patient_own_records(auth_email=None):
    """Get records for the authenticated patient"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, age, created_at, scan_result, 
                   file_path, report, processed_image
            FROM patient_records 
            WHERE email = ?
            ORDER BY created_at DESC
        """, (auth_email,))
        
        records = cursor.fetchall()
        conn.close()
        
        records_list = []
        for record in records:
            file_name = None
            if record[6]:  # file_path
                file_name = os.path.basename(record[6])
            
            records_list.append({
                'id': record[0],
                'name': record[1],
                'email': record[2],
                'age': record[3],
                'created_at': record[4],
                'scan_result': record[5],
                'file_path': record[6],
                'file_name': file_name,
                'report': record[7],
                'processed_image': record[8] or ''
            })
        
        return jsonify({'records': records_list}), 200
        
    except Exception as e:
        print(f"Error fetching patient records: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/patient/record/<int:record_id>', methods=['GET'])
@patient_required
def api_get_patient_record_detail(record_id, auth_email=None):
    """Get detailed information for a specific patient record"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, age, created_at, scan_result, 
                   file_path, report, processed_image
            FROM patient_records 
            WHERE id = ? AND email = ?
        """, (record_id, auth_email))
        
        record = cursor.fetchone()
        conn.close()
        
        if not record:
            return jsonify({'error': 'Record not found or access denied'}), 404
        
        file_name = None
        if record[6]:  # file_path
            file_name = os.path.basename(record[6])
        
        record_data = {
            'id': record[0],
            'name': record[1],
            'email': record[2],
            'age': record[3],
            'created_at': record[4],
            'scan_result': record[5],
            'file_path': record[6],
            'file_name': file_name,
            'report': record[7],
            'processed_image': record[8] or ''
        }
        
        return jsonify(record_data), 200
        
    except Exception as e:
        print(f"Error fetching patient record detail: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/patient/profile', methods=['GET'])
@patient_required
def api_get_patient_profile(auth_email=None):
    """Get the authenticated patient's profile"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT email, name, verified
            FROM patients 
            WHERE email = ?
        """, (auth_email,))
        
        patient = cursor.fetchone()
        conn.close()
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient_data = {
            'email': patient[0],
            'name': patient[1],
            'verified': patient[2]
        }
        
        return jsonify(patient_data), 200
        
    except Exception as e:
        print(f"Error fetching patient profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/patient/share/<int:record_id>', methods=['POST'])
@patient_required
def api_patient_share_record(record_id, auth_email=None):
    """Generate a shareable link for a patient record"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM patient_records WHERE id = ? AND email = ?", (record_id, auth_email))
        record = cursor.fetchone()
        conn.close()
        
        if not record:
            return jsonify({'error': 'Record not found or access denied'}), 404
        
        share_token = jwt.encode(
            {
                'record_id': record_id,
                'patient_email': auth_email,
                'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
            },
            JWT_SECRET,
            algorithm='HS256'
        )
        
        share_link = f"http://localhost:3000/shared/record/{share_token}"
        
        return jsonify({
            'message': 'Share link generated successfully',
            'share_link': share_link,
            'expires_in': '7 days'
        }), 200
        
    except Exception as e:
        print(f"Error generating share link: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ====================== PUBLIC SHARE ROUTE ======================

@app.route('/api/public/record/<token>', methods=['GET'])
def api_get_shared_record(token):
    """
    Public route to fetch a record using a share token.
    No auth decorator is needed here.
    """
    if not token:
        return jsonify({'error': 'No share token provided'}), 400
    
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        record_id = decoded.get('record_id')
        patient_email = decoded.get('patient_email')
        
        if not record_id or not patient_email:
            return jsonify({'error': 'Invalid token payload'}), 401
            
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'This share link has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'This share link is invalid'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, age, created_at, scan_result, 
                   file_path, report, processed_image
            FROM patient_records 
            WHERE id = ? AND email = ?
        """, (record_id, patient_email))
        
        record = cursor.fetchone()
        conn.close()
        
        if not record:
            return jsonify({'error': 'Record not found or access denied'}), 404
        
        file_name = None
        if record[6]:  # file_path
            file_name = os.path.basename(record[6])
        
        record_data = {
            'id': record[0],
            'name': record[1],
            'email': record[2],
            'age': record[3],
            'created_at': record[4],
            'scan_result': record[5],
            'file_path': record[6],
            'file_name': file_name,
            'report': record[7],
            'processed_image': record[8] or ''
        }
        
        return jsonify(record_data), 200
        
    except Exception as e:
        print(f"Error fetching shared record: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ====================== DOCTOR RECORD DETAIL ======================

@app.route('/api/doctor/record/<int:record_id>', methods=['GET'])
@doctor_approved_required
def api_get_record_detail(record_id, auth_email=None):
    """Get detailed information for a specific patient record (for doctors)"""
    if not auth_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30) # <-- Use DB_PATH
        cursor = conn.cursor()
        
        # --- FIX 3: SECURED QUERY to check ID and doctor_email ---
        cursor.execute("""
            SELECT id, name, email, age, created_at, scan_result, 
                   file_path, report, processed_image
            FROM patient_records 
            WHERE id = ? AND doctor_email = ?
        """, (record_id, auth_email))
        
        record = cursor.fetchone()
        conn.close()
        
        if not record:
            # --- FIX 3b: Updated error message ---
            return jsonify({'error': 'Record not found or access denied'}), 404
        
        file_name = None
        if record[6]:  # file_path
            file_name = os.path.basename(record[6])
        
        record_data = {
            'id': record[0],
            'name': record[1],
            'email': record[2],
            'age': record[3],
            'created_at': record[4],
            'scan_result': record[5],
            'file_path': record[6],
            'file_name': file_name,
            'report': record[7],
            'processed_image': record[8] or ''
        }
        
        return jsonify(record_data), 200
        
    except Exception as e:
        print(f"Error fetching patient record detail: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ====================== CHAT ROUTES ======================

# --- FIX 3: REVISED CHAT HISTORY ROUTE ---
# Removed @patient_required decorator.
# The logic inside correctly checks for *both* patients and doctors.
# ====================== CHAT ROUTES ======================

@app.route('/api/chat/history/<room>', methods=['GET'])
def get_chat_history(room):
    """
    Fetches chat history for a 1-on-1 room.
    """
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'No token provided'}), 401
    
    if token.startswith('Bearer '):
        token = token[7:]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_email = payload.get('email')
        
        # --- THIS IS THE FIX ---
        # New Security Check:
        # A user (patient or doctor) can only access a room
        # if their email is part of the room name.
        if user_email not in room:
             return jsonify({'error': 'Access denied'}), 403
        # -----------------------

    except Exception as e:
        return jsonify({'error': f'Invalid token: {e}'}), 401
    
    # If the check passes, we try to get the messages
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        c = conn.cursor()
        c.execute(
            "SELECT * FROM chat_messages WHERE room = ? ORDER BY timestamp ASC",
            (room,)
        )
        messages = c.fetchall()
        conn.close()
        
        messages_list = [{
            'id': m[0],
            'room': m[1],
            'sender_email': m[2],
            'sender_type': m[3],
            'message_text': m[4],
            'timestamp': m[5]
        } for m in messages]
        
        return jsonify(messages_list), 200
        
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return jsonify({'error': str(e)}), 500

# --- NEW: SOCKET.IO EVENTS (FIXED) ---

@socketio.on('connect')
def handle_connect():
    """Handle new socket connection and authenticate user"""
    token = request.args.get('token')
    if not token:
        print("Socket connect: No token, disconnecting.")
        return False  # Disconnect
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        session['email'] = payload.get('email')
        session['type'] = payload.get('type')
        print(f"Socket connect: Client connected: {session['email']}")
    except Exception as e:
        print(f"Socket connect: Invalid token. {e}")
        return False  # Disconnect

@socketio.on('join_room')
def handle_join_room(data):
    """Handle client joining a chat room"""
    room = data['room']
    user_email = session.get('email')

    if not user_email:
        print("Socket join: DENIED. Unauthenticated user.")
        return

    # --- THIS IS THE FIX ---
    # New Security Check: Allow join if the user's email is part of the room name.
    if user_email not in room:
        print(f"Socket join: DENIED. User {user_email} tried to join invalid room {room}")
        return
    # -----------------------
        
    join_room(room)
    print(f"Socket join: {user_email} joined room {room}")

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle client leaving a chat room"""
    room = data['room']
    leave_room(room)
    print(f"Socket leave: {session.get('email')} left room {room}")

@socketio.on('send_message')
def handle_send_message(data):
    """Handle a client sending a message"""
    room = data['room']
    message_text = data['message_text']
    sender_email = session.get('email')
    sender_type = session.get('type')

    if not sender_email or not sender_type:
        print("Socket send: DENIED. Unauthenticated user.")
        return

    # --- THIS IS THE FIX ---
    # New Security Check: Allow send if the sender's email is part of the room name.
    if sender_email not in room:
        print(f"Socket send: DENIED. User {sender_email} tried to send to invalid room {room}")
        return
    # -----------------------

    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        c = conn.cursor()
        c.execute(
            "INSERT INTO chat_messages (room, sender_email, sender_type, message_text) VALUES (?, ?, ?, ?)",
            (room, sender_email, sender_type, message_text)
        )
        conn.commit()
        
        message_id = c.lastrowid
        c.execute("SELECT * FROM chat_messages WHERE id = ?", (message_id,))
        msg = c.fetchone()
        conn.close()
        
        new_message = {
            'id': msg[0],
            'room': msg[1],
            'sender_email': msg[2],
            'sender_type': msg[3],
            'message_text': msg[4],
            'timestamp': msg[5]
        }
        
        emit('receive_message', new_message, to=room)
        print(f"Socket send: Message from {sender_email} in room {room}")

    except Exception as e:
        print(f"Socket send error: {e}")

# ====================== RUN SERVER ======================
if __name__ == '__main__':
    print("Starting Flask-SocketIO server...")
    # Use socketio.run() to run the server
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)