# IBC Wastewater Treatment System

**Kooperationsprojekt Elektrotechnik und Siedlungswasserwirtschaft**
Hochschule Koblenz

A modular, IoT-enabled wastewater treatment system designed to retrofit standard IBC (Intermediate Bulk Container) containers into functional treatment plants for decentralized sanitation solutions.

## Project Overview

This project develops a complete control and monitoring system for an IBC-based wastewater treatment plant. The system features:

- **Automated multi-phase treatment process** (Filling → Aeration → Settling → Draining)
- **Real-time monitoring dashboard** with live data visualization
- **Remote control capabilities** via web interface
- **Hardware abstraction** allowing development on Windows and deployment on Raspberry Pi
- **Data logging and analytics** for performance analysis
- **Safety features** including emergency stop and alarm systems

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Dashboard (React)                    │
│  • Real-time monitoring  • Control panel  • Data analytics  │
└────────────────┬────────────────────────────────────────────┘
                 │ WebSocket + REST API
┌────────────────┴────────────────────────────────────────────┐
│                  Backend Server (Flask)                      │
│  • WebSocket server  • REST API  • Data logging             │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│              Treatment Controller (Python)                   │
│  • Phase management  • Safety monitoring  • Event handling  │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│          Hardware Abstraction Layer (GPIO)                   │
│  • Mock mode (Windows)  • GPIO mode (Raspberry Pi)          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                Physical Components (IBC)                     │
│  • Pumps (inlet/recirculation/outlet)  • Air blower         │
│  • Ultrasonic level sensor  • Relay control module          │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
praxis/
├── backend/                    # Python Flask backend
│   ├── app.py                  # Main application
│   ├── config/                 # Configuration files
│   │   └── treatment_config.yaml
│   ├── controller/             # Treatment process logic
│   │   └── treatment_controller.py
│   ├── database/               # Database models
│   │   └── models.py
│   ├── hardware/               # Hardware abstraction
│   │   └── gpio_interface.py
│   ├── requirements.txt
│   ├── .env                    # Environment variables
│   └── README.md
│
├── frontend/                   # React web dashboard
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   ├── components/         # React components
│   │   │   ├── StatusCard.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── WaterLevelChart.jsx
│   │   │   ├── ComponentStatus.jsx
│   │   │   ├── PhaseTimeline.jsx
│   │   │   ├── Statistics.jsx
│   │   │   └── EventLog.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── docs/                       # Documentation
│   └── lab_manual.md           # Lab practical manual
│
└── README.md                   # This file
```

## Quick Start (Windows Development)

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- Git

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Backend will start on `http://localhost:5000`

### 2. Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

### 3. Access the Dashboard

Open your browser and navigate to `http://localhost:3000`

You should see the IBC Wastewater Treatment System dashboard with:
- Real-time system status
- Control panel (Start/Stop/Pause/Emergency Stop)
- Live water level chart
- Component status indicators
- Phase timeline
- Event log and statistics

## Treatment Process

The system automatically manages a 4-phase treatment cycle:

### Phase 1: Filling (Variable Duration)
- **Objective**: Fill tank to operating level
- **Active Components**: Inlet pump
- **Completion**: When water level reaches target (30cm from sensor)
- **Timeout**: 10 minutes

### Phase 2: Aeration (2 hours)
- **Objective**: Biological treatment through aeration
- **Active Components**: Air blower (continuous), Recirculation pump (intermittent)
- **Recirculation**: 1 minute every 15 minutes
- **Purpose**: Oxygen supply for aerobic bacteria

### Phase 3: Settling (1 hour)
- **Objective**: Allow solids to settle
- **Active Components**: None (all off)
- **Purpose**: Gravity separation of biomass

### Phase 4: Draining (Variable Duration)
- **Objective**: Discharge treated effluent
- **Active Components**: Outlet pump
- **Completion**: When water level reaches target (100cm from sensor)
- **Timeout**: 10 minutes

## Features

### Web Dashboard
- **Real-time Monitoring**: Live updates every 10 seconds via WebSocket
- **Control Panel**: Start, stop, pause, resume, and emergency stop functions
- **Data Visualization**: Interactive charts showing water level trends
- **Component Status**: Visual indicators for all pumps and blower
- **Phase Progress**: Timeline showing current treatment phase
- **Event Logging**: Comprehensive log of all system events
- **Statistics**: Cycle count, runtime, and error tracking

### Backend System
- **RESTful API**: Complete control and data access via HTTP endpoints
- **WebSocket Server**: Real-time bidirectional communication
- **Treatment Controller**: Autonomous multi-phase cycle management
- **Safety Monitoring**: Level alarms, timeout protection, emergency stop
- **Data Logging**: SQLite database for sensor readings and events
- **Hardware Abstraction**: Seamless switching between mock and real GPIO

### Safety Features
- **Emergency Stop**: Immediate shutdown of all components
- **High/Low Level Alarms**: Automatic shutdown on dangerous water levels
- **Timeout Protection**: Maximum runtime limits for all components
- **Cycle Duration Limit**: 12-hour maximum cycle timeout
- **Pump Protection**: Minimum interval between pump starts

## Configuration

Edit `backend/config/treatment_config.yaml` to customize:

```yaml
treatment_phases:
  filling:
    target_level: 30        # cm from sensor
    max_duration: 600       # seconds
  aeration:
    duration: 7200          # 2 hours
    recirculation_interval: 900
    recirculation_duration: 60
  settling:
    duration: 3600          # 1 hour
  draining:
    target_level: 100       # cm from sensor
    max_duration: 600

safety:
  high_level_alarm: 15      # cm (very high water)
  low_level_alarm: 120      # cm (very low water)
  max_cycle_duration: 43200 # 12 hours

logging:
  interval: 10              # seconds
  retain_days: 30
```

## API Endpoints

### Control
- `POST /api/control/start` - Start treatment cycle
- `POST /api/control/stop` - Stop treatment cycle
- `POST /api/control/pause` - Pause current cycle
- `POST /api/control/resume` - Resume paused cycle
- `POST /api/control/emergency-stop` - Emergency shutdown
- `POST /api/control/reset-emergency` - Reset emergency stop
- `POST /api/control/component` - Manual component control

### Monitoring
- `GET /api/status` - Current system status
- `GET /api/data/readings` - Sensor reading history
- `GET /api/data/events` - System events log
- `GET /api/data/cycles` - Treatment cycle history

## Deployment to Raspberry Pi

### Hardware Requirements
- Raspberry Pi 4 (recommended) or Pi 3B+
- 4-channel relay module
- HC-SR04 ultrasonic distance sensor
- 12V/24V pumps (inlet, recirculation, outlet)
- Air blower
- Power supply

### Software Deployment

1. **Transfer Files**
```bash
# From your development machine
scp -r backend/ pi@raspberrypi.local:~/ibc-treatment/
scp -r frontend/dist pi@raspberrypi.local:~/ibc-treatment/
```

2. **Update Configuration**
```bash
# On Raspberry Pi
cd ~/ibc-treatment/backend
nano .env
# Change: HARDWARE_MODE=gpio
```

3. **Wire GPIO Connections** (as per configuration)
- GPIO 17: Inlet Pump
- GPIO 27: Recirculation Pump
- GPIO 22: Outlet Pump
- GPIO 23: Air Blower
- GPIO 24: Ultrasonic Trigger
- GPIO 25: Ultrasonic Echo

4. **Run Backend**
```bash
cd ~/ibc-treatment/backend
python3 app.py
```

5. **Serve Frontend** (use nginx or similar)

## Development vs Production

### Development (Windows/Mac)
- **Hardware Mode**: `mock` (simulated GPIO)
- **Purpose**: Development, testing, demonstration
- **Features**: Full functionality with simulated water level changes

### Production (Raspberry Pi)
- **Hardware Mode**: `gpio` (real GPIO control)
- **Purpose**: Actual wastewater treatment
- **Requirements**: Proper electrical wiring, safety measures

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Start/stop cycle functionality
- [ ] Pause/resume during each phase
- [ ] Emergency stop activation and reset
- [ ] Manual component control (when not running)
- [ ] WebSocket connection stability
- [ ] Data logging and retrieval
- [ ] Phase transitions
- [ ] Safety alarm triggers

## Lab Practical Use

This system is designed for use in laboratory practicals at Hochschule Koblenz:

1. **Understanding wastewater treatment processes**
2. **Learning process control and automation**
3. **Practicing sensor integration and monitoring**
4. **Experiencing real-time data visualization**
5. **Exploring IoT and remote control concepts**

See `docs/lab_manual.md` for complete laboratory instructions.

## Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Ensure virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check port 5000 is not in use

### Frontend won't connect
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure WebSocket connection allowed by firewall
- Try clearing browser cache

### GPIO errors on Pi
- Run with sudo: `sudo python3 app.py`
- Check GPIO pin connections
- Verify BCM pin numbering in config
- Ensure no other process using GPIO

## Future Enhancements

- [ ] pH and dissolved oxygen sensors
- [ ] Advanced scheduling (time-based cycles)
- [ ] Mobile app (React Native)
- [ ] Multi-tank management
- [ ] Machine learning for optimization
- [ ] Cloud data backup
- [ ] Email/SMS alerts
- [ ] Energy consumption monitoring

## Authors

**Praxisphase Project**
Hochschule Koblenz - University of Applied Sciences
Faculty of Engineering

**Cooperation between:**
- Elektrotechnik (Electrical Engineering)
- Siedlungswasserwirtschaft (Water Resources Management)

## License

This project is developed for educational purposes at Hochschule Koblenz.

## Acknowledgments

- Hochschule Koblenz for project support
- Faculty advisors and laboratory staff
- Open-source community for tools and libraries

---

For questions or issues, please contact the project supervisor at Hochschule Koblenz.
