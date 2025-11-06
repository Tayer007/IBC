"""
Main Flask application for IBC Wastewater Treatment Plant
Provides REST API and WebSocket interface for monitoring and control
"""

import os
import threading
import time
from pathlib import Path
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

from controller.treatment_controller import TreatmentController
from database.models import Database

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize database
db = Database(os.getenv('DATABASE_URL', 'sqlite:///ibc_treatment.db'))

# Initialize controller
config_path = Path(__file__).parent / 'config' / 'treatment_config.yaml'
hardware_mode = os.getenv('HARDWARE_MODE', 'mock')
controller = TreatmentController(str(config_path), hardware_mode)

# Global variables
data_logger_thread = None
data_logger_running = False


# ============= REST API Endpoints =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'hardware_mode': hardware_mode
    })


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current system status"""
    status = controller.get_status()
    return jsonify(status)


@app.route('/api/control/start', methods=['POST'])
def start_cycle():
    """Start treatment cycle"""
    success = controller.start_cycle()
    if success:
        db.log_system_event('cycle_start', 'Treatment cycle started', 'info')
        return jsonify({'success': True, 'message': 'Cycle started'})
    else:
        return jsonify({'success': False, 'message': 'Could not start cycle'}), 400


@app.route('/api/control/stop', methods=['POST'])
def stop_cycle():
    """Stop treatment cycle"""
    success = controller.stop_cycle()
    if success:
        db.log_system_event('cycle_stop', 'Treatment cycle stopped', 'info')
        return jsonify({'success': True, 'message': 'Cycle stopped'})
    else:
        return jsonify({'success': False, 'message': 'No cycle running'}), 400


@app.route('/api/control/pause', methods=['POST'])
def pause_cycle():
    """Pause treatment cycle"""
    success = controller.pause_cycle()
    if success:
        db.log_system_event('cycle_pause', 'Treatment cycle paused', 'info')
        return jsonify({'success': True, 'message': 'Cycle paused'})
    else:
        return jsonify({'success': False, 'message': 'Cannot pause'}), 400


@app.route('/api/control/resume', methods=['POST'])
def resume_cycle():
    """Resume treatment cycle"""
    success = controller.resume_cycle()
    if success:
        db.log_system_event('cycle_resume', 'Treatment cycle resumed', 'info')
        return jsonify({'success': True, 'message': 'Cycle resumed'})
    else:
        return jsonify({'success': False, 'message': 'Cannot resume'}), 400


@app.route('/api/control/emergency-stop', methods=['POST'])
def emergency_stop():
    """Emergency stop"""
    controller.emergency_stop()
    db.log_system_event('emergency_stop', 'Emergency stop activated', 'critical')
    return jsonify({'success': True, 'message': 'Emergency stop activated'})


@app.route('/api/control/reset-emergency', methods=['POST'])
def reset_emergency():
    """Reset emergency stop"""
    controller.reset_emergency_stop()
    db.log_system_event('emergency_reset', 'Emergency stop reset', 'info')
    return jsonify({'success': True, 'message': 'Emergency stop reset'})


@app.route('/api/control/component', methods=['POST'])
def control_component():
    """Manual component control"""
    data = request.get_json()
    component = data.get('component')
    state = data.get('state')

    if not component or state is None:
        return jsonify({'success': False, 'message': 'Missing component or state'}), 400

    success = controller.set_component(component, state)
    if success:
        db.log_system_event(
            'manual_control',
            f'{component} set to {"ON" if state else "OFF"}',
            'info'
        )
        return jsonify({'success': True, 'message': f'{component} updated'})
    else:
        return jsonify({'success': False, 'message': 'Invalid component'}), 400


@app.route('/api/data/readings', methods=['GET'])
def get_readings():
    """Get recent sensor readings"""
    limit = request.args.get('limit', 100, type=int)
    readings = db.get_recent_readings(limit)
    return jsonify(readings)


@app.route('/api/data/readings/range', methods=['GET'])
def get_readings_range():
    """Get sensor readings within time range"""
    start = request.args.get('start')
    end = request.args.get('end')

    if not start or not end:
        return jsonify({'error': 'Missing start or end parameter'}), 400

    try:
        start_time = datetime.fromisoformat(start)
        end_time = datetime.fromisoformat(end)
        readings = db.get_readings_by_timerange(start_time, end_time)
        return jsonify(readings)
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400


@app.route('/api/data/events', methods=['GET'])
def get_events():
    """Get recent system events"""
    limit = request.args.get('limit', 50, type=int)
    events = db.get_recent_events(limit)
    return jsonify(events)


@app.route('/api/data/cycles', methods=['GET'])
def get_cycles():
    """Get treatment cycle history"""
    limit = request.args.get('limit', 20, type=int)
    cycles = db.get_treatment_cycles(limit)
    return jsonify(cycles)


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current configuration"""
    return jsonify(controller.config)


@app.route('/api/config/phase-durations', methods=['PUT'])
def update_phase_durations():
    """Update phase durations"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    success = controller.update_phase_durations(data)
    if success:
        db.log_system_event('config_update', 'Phase durations updated', 'info')
        return jsonify({
            'success': True,
            'message': 'Phase durations updated',
            'durations': controller.config['phase_durations']
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Could not update phase durations (check if cycle is running)'
        }), 400


@app.route('/api/config/aeration', methods=['PUT'])
def update_aeration():
    """Update aeration settings"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    success = controller.update_aeration_settings(data)
    if success:
        db.log_system_event('config_update', 'Aeration settings updated', 'info')
        return jsonify({
            'success': True,
            'message': 'Aeration settings updated',
            'aeration': controller.config['aeration']
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Could not update aeration settings (check if cycle is running)'
        }), 400


# ============= WebSocket Events =============

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"[WebSocket] Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to IBC Treatment System'})
    # Send current status
    emit('status_update', controller.get_status())


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"[WebSocket] Client disconnected: {request.sid}")


@socketio.on('request_status')
def handle_status_request():
    """Handle status request"""
    emit('status_update', controller.get_status())


# ============= Background Tasks =============

def data_logger_worker():
    """Background worker to log data and emit updates"""
    global data_logger_running

    print("[DATA LOGGER] Started")

    while data_logger_running:
        try:
            # Get current status
            status = controller.get_status()

            # Log to database if running
            if status['is_running']:
                db.log_sensor_reading(
                    level=status['current_level'],
                    components=status['components'],
                    phase=status['current_phase']
                )

            # Emit to all connected WebSocket clients
            socketio.emit('status_update', status)

            # Sleep for logging interval (10 seconds by default)
            time.sleep(controller.config['logging']['interval'])

        except Exception as e:
            print(f"[DATA LOGGER] Error: {e}")
            time.sleep(5)

    print("[DATA LOGGER] Stopped")


def start_data_logger():
    """Start the data logging background thread"""
    global data_logger_thread, data_logger_running

    if data_logger_running:
        return

    data_logger_running = True
    data_logger_thread = threading.Thread(target=data_logger_worker, daemon=True)
    data_logger_thread.start()


def stop_data_logger():
    """Stop the data logging background thread"""
    global data_logger_running
    data_logger_running = False


# ============= Event Callbacks =============

def on_controller_event(event_type: str, data: dict):
    """Handle events from controller"""
    # Emit to WebSocket clients
    socketio.emit('controller_event', {
        'event': event_type,
        'data': data
    })

    # Log to database
    db.log_system_event(event_type, f"Controller event: {event_type}", 'info', data)


# Register controller callbacks
controller.register_event_callback('cycle_started', lambda d: on_controller_event('cycle_started', d))
controller.register_event_callback('cycle_stopped', lambda d: on_controller_event('cycle_stopped', d))
controller.register_event_callback('phase_changed', lambda d: on_controller_event('phase_changed', d))
controller.register_event_callback('emergency_stop', lambda d: on_controller_event('emergency_stop', d))


# ============= Application Lifecycle =============

@app.before_request
def before_first_request():
    """Initialize on first request"""
    if not data_logger_running:
        start_data_logger()


def cleanup():
    """Cleanup on shutdown"""
    print("[APP] Shutting down...")
    stop_data_logger()
    controller.cleanup()


# ============= Main =============

if __name__ == '__main__':
    import atexit
    atexit.register(cleanup)

    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'

    print(f"""
    ============================================================
      IBC Wastewater Treatment Control System
      Backend Server Starting...
    ============================================================

    Hardware Mode: {hardware_mode.upper()}
    Host: {host}
    Port: {port}
    Debug: {debug}

    API Endpoints available at http://{host}:{port}/api/
    WebSocket available at ws://{host}:{port}

    Press CTRL+C to stop
    """)

    # Start data logger
    start_data_logger()

    # Run Flask app with SocketIO
    socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True)
