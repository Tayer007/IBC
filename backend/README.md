# IBC Wastewater Treatment System - Backend

Python Flask backend for controlling and monitoring an IBC-based wastewater treatment plant.

## Features

- **Hardware Abstraction**: Works on Windows (mock mode) and Raspberry Pi (GPIO mode)
- **Treatment Process Control**: Automated multi-phase treatment cycle
- **Real-time Monitoring**: WebSocket-based live data streaming
- **REST API**: Complete control and data access via HTTP endpoints
- **Data Logging**: SQLite database for sensor readings and events
- **Safety Features**: Emergency stop, level alarms, timeout protection

## Architecture

```
backend/
├── app.py                          # Main Flask application
├── config/
│   └── treatment_config.yaml       # Treatment process configuration
├── controller/
│   └── treatment_controller.py     # Treatment cycle controller
├── database/
│   └── models.py                   # SQLAlchemy database models
├── hardware/
│   └── gpio_interface.py           # Hardware abstraction layer
├── requirements.txt                # Python dependencies
└── .env                            # Environment configuration
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment (already done):
```bash
# .env file already created with HARDWARE_MODE=mock for Windows
```

## Running the Backend

### Development Mode (Windows)

```bash
python app.py
```

The server will start on `http://localhost:5000`

### Production Mode (Raspberry Pi)

1. Update `.env` file:
```
HARDWARE_MODE=gpio
```

2. Run the application:
```bash
python app.py
```

## API Endpoints

### System Control

- `POST /api/control/start` - Start treatment cycle
- `POST /api/control/stop` - Stop treatment cycle
- `POST /api/control/pause` - Pause cycle
- `POST /api/control/resume` - Resume cycle
- `POST /api/control/emergency-stop` - Emergency stop all components
- `POST /api/control/reset-emergency` - Reset emergency stop
- `POST /api/control/component` - Manual component control

### Monitoring

- `GET /api/status` - Get current system status
- `GET /api/health` - Health check
- `GET /api/data/readings?limit=100` - Get recent sensor readings
- `GET /api/data/events?limit=50` - Get system events
- `GET /api/data/cycles?limit=20` - Get treatment cycle history
- `GET /api/data/readings/range?start=ISO8601&end=ISO8601` - Get readings by time range

### Configuration

- `GET /api/config` - Get current configuration

## WebSocket Events

Connect to `ws://localhost:5000`

### Client -> Server

- `connect` - Establish connection
- `request_status` - Request current status

### Server -> Client

- `connected` - Connection established
- `status_update` - Periodic status updates (every 10s)
- `controller_event` - Events from treatment controller

## Treatment Phases

1. **Filling**: Fill tank to operating level using inlet pump
2. **Aeration**: Aerate wastewater with blower (2 hours) with periodic recirculation
3. **Settling**: Allow solids to settle (1 hour)
4. **Draining**: Discharge treated water using outlet pump

## Configuration

Edit `config/treatment_config.yaml` to adjust:
- Phase durations and behaviors
- Hardware pin assignments (for Raspberry Pi)
- Safety thresholds
- Logging intervals

## Safety Features

- High/low level alarms
- Maximum runtime protection for each component
- Total cycle duration timeout
- Emergency stop functionality
- Automatic component shutdown on errors

## Database

SQLite database (`ibc_treatment.db`) stores:
- Sensor readings (timestamped water levels and component states)
- Treatment cycles (duration, phases, completion status)
- System events (errors, warnings, state changes)

## Testing on Windows

The mock GPIO interface simulates real hardware:
- Realistic water level changes based on pump states
- Sensor noise simulation
- Console logging of all GPIO operations

This allows full development and testing on Windows before deploying to Raspberry Pi.

## Migration to Raspberry Pi

1. Transfer all backend files to Raspberry Pi
2. Update `.env`: Set `HARDWARE_MODE=gpio`
3. Install dependencies on Pi
4. Connect GPIO pins according to configuration
5. Run the application

No code changes required!

## Troubleshooting

### Virtual environment issues
```bash
# Delete and recreate venv
rm -rf venv
python -m venv venv
```

### Port already in use
Change `PORT` in `.env` file

### Database locked
Close other applications accessing the database, or delete `ibc_treatment.db` to start fresh

## Development Tips

- Check console output for mock GPIO operations
- Use the `/api/status` endpoint to monitor state
- WebSocket connection shows real-time updates
- Emergency stop is always available for safety
