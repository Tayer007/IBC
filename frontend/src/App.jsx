import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'
import StatusCard from './components/StatusCard'
import ControlPanel from './components/ControlPanel'
import WaterLevelChart from './components/WaterLevelChart'
import ComponentStatus from './components/ComponentStatus'
import PhaseTimeline from './components/PhaseTimeline'
import EventLog from './components/EventLog'
import Statistics from './components/Statistics'
import ConfigPanel from './components/ConfigPanel'
import ExpertMenu from './components/ExpertMenu'

// Backend API URL configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin

function App() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState({
    is_running: false,
    is_paused: false,
    emergency_stopped: false,
    current_phase: 'idle',
    phase_elapsed: 0,
    cycle_elapsed: 0,
    current_level: 0,
    components: {
      inlet_pump: false,
      drain_valve: false,
      blower: false
    },
    aeration_mode: 'none',
    stats: {
      cycles_completed: 0,
      total_runtime: 0,
      errors: []
    }
  })
  const [levelHistory, setLevelHistory] = useState([])
  const [events, setEvents] = useState([])
  const [config, setConfig] = useState(null)
  const [expertMenuOpen, setExpertMenuOpen] = useState(false)

  // Fetch initial configuration
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`)
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error)
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      transports: ['polling', 'websocket'],  // Try polling first for Cloudflare compatibility
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    })

    newSocket.on('connect', () => {
      console.log('Connected to backend')
      setConnected(true)
      addEvent('System', 'Verbunden mit Backend-Server', 'success')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from backend')
      setConnected(false)
      addEvent('System', 'Verbindung zum Backend-Server getrennt', 'warning')
    })

    newSocket.on('status_update', (data) => {
      setStatus(data)

      // Add to level history for chart
      setLevelHistory(prev => {
        const newHistory = [...prev, {
          time: new Date().toLocaleTimeString(),
          level: data.current_level,
          phase: data.current_phase
        }]
        // Keep last 50 readings
        return newHistory.slice(-50)
      })
    })

    newSocket.on('controller_event', (data) => {
      const eventMessages = {
        'cycle_started': 'Behandlungszyklus gestartet',
        'cycle_stopped': 'Behandlungszyklus gestoppt',
        'cycle_paused': 'Behandlungszyklus pausiert',
        'cycle_resumed': 'Behandlungszyklus fortgesetzt',
        'phase_changed': `Phase gewechselt zu: ${translatePhase(data.data?.phase)}`,
        'emergency_stop': 'NOTAUS aktiviert',
        'emergency_reset': 'NOTAUS zurückgesetzt'
      }

      const message = eventMessages[data.event] || data.event
      const type = data.event === 'emergency_stop' ? 'error' : 'info'
      addEvent('Controller', message, type)
    })

    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  const translatePhase = (phase) => {
    const phaseNames = {
      'idle': 'Stillstand',
      'zulauf_1': 'Zulauf 1',
      'unbelueftet_1': 'Unbelüftet 1',
      'belueftung_1': 'Belüftung 1',
      'zulauf_2': 'Zulauf 2',
      'unbelueftet_2': 'Unbelüftet 2',
      'belueftung_2': 'Belüftung 2',
      'zulauf_3': 'Zulauf 3',
      'unbelueftet_3': 'Unbelüftet 3',
      'belueftung_3': 'Belüftung 3',
      'sedimentation': 'Sedimentation',
      'klarwasserabzug': 'Klarwasserabzug',
      'stillstand': 'Stillstandszeit',
      'emergency_stop': 'NOTAUS',
      'error': 'Fehler'
    }
    return phaseNames[phase] || phase
  }

  const addEvent = (source, message, type = 'info') => {
    const event = {
      time: new Date().toLocaleTimeString(),
      source,
      message,
      type
    }
    setEvents(prev => [event, ...prev].slice(0, 100))
  }

  const apiCall = async (endpoint, method = 'POST') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, { method })
      const data = await response.json()

      if (!data.success && data.message) {
        addEvent('API', data.message, 'warning')
      }

      return data
    } catch (error) {
      addEvent('API', `Fehler: ${error.message}`, 'error')
      console.error('API call failed:', error)
      return { success: false }
    }
  }

  const handleStartCycle = () => apiCall('/control/start')
  const handleStopCycle = () => apiCall('/control/stop')
  const handlePauseCycle = () => apiCall('/control/pause')
  const handleResumeCycle = () => apiCall('/control/resume')
  const handleEmergencyStop = () => {
    if (confirm('Sind Sie sicher, dass Sie den NOTAUS aktivieren möchten?')) {
      apiCall('/control/emergency-stop')
    }
  }
  const handleResetEmergency = () => apiCall('/control/reset-emergency')

  const handleResetSimulation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/control/reset-simulation`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        addEvent('Simulation', 'Wasserstand auf leer zurückgesetzt (100cm)', 'info')
      } else {
        addEvent('Fehler', data.message, 'error')
      }
    } catch (error) {
      addEvent('Fehler', 'Konnte Simulation nicht zurücksetzen: ' + error.message, 'error')
    }
  }

  const handleManualControl = async (component, state) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/control/component`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ component, state })
      })
      const data = await response.json()

      if (!data.success && data.message) {
        addEvent('Manuelle Steuerung', data.message, 'warning')
      }
    } catch (error) {
      addEvent('Manuelle Steuerung', `Fehler: ${error.message}`, 'error')
    }
  }

  const handleConfigUpdate = () => {
    fetchConfig()
  }

  const getStatusText = () => {
    if (status.emergency_stopped) return 'NOTAUS'
    if (status.is_running) return status.is_paused ? 'PAUSIERT' : 'LÄUFT'
    return 'BEREIT'
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>IBC-Versuchskläranlage</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="expert-button" onClick={() => setExpertMenuOpen(true)}>
              🔧 Experten-Menü
            </button>
            <div className="connection-status">
              <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
              <span>{connected ? 'Verbunden' : 'Getrennt'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Top Row - Status Cards */}
        <div className="grid grid-cols-4">
          <StatusCard
            title="System Status"
            value={getStatusText()}
            status={status.emergency_stopped ? 'error' : status.is_running ? 'success' : 'info'}
            icon="activity"
          />
          <StatusCard
            title="Aktuelle Phase"
            value={translatePhase(status.current_phase)}
            subtitle={`${Math.floor(status.phase_elapsed / 60)}m ${Math.floor(status.phase_elapsed % 60)}s`}
            status="info"
            icon="layers"
          />
          <StatusCard
            title="Wasserstand"
            value={`${status.current_level.toFixed(1)} cm`}
            subtitle="vom Sensor"
            status={status.current_level < 20 ? 'warning' : 'success'}
            icon="droplet"
          />
          <StatusCard
            title="Zyklen Abgeschlossen"
            value={status.stats.cycles_completed}
            subtitle={`Gesamt: ${Math.floor(status.stats.total_runtime / 3600)}h`}
            status="info"
            icon="repeat"
          />
        </div>

        {/* Control Panel */}
        <ControlPanel
          isRunning={status.is_running}
          isPaused={status.is_paused}
          emergencyStopped={status.emergency_stopped}
          onStart={handleStartCycle}
          onStop={handleStopCycle}
          onPause={handlePauseCycle}
          onResume={handleResumeCycle}
          onEmergencyStop={handleEmergencyStop}
          onResetEmergency={handleResetEmergency}
          onResetSimulation={handleResetSimulation}
        />

        {/* Middle Row - Phase & Components */}
        <div className="grid grid-cols-2">
          <PhaseTimeline currentPhase={translatePhase(status.current_phase)} phaseElapsed={status.phase_elapsed} />
          <ComponentStatus
            components={status.components}
            aerationMode={status.aeration_mode}
            isRunning={status.is_running}
            onManualControl={handleManualControl}
          />
        </div>

        {/* Stats and Chart Row */}
        <div className="grid grid-cols-2">
          <Statistics stats={status.stats} cycleElapsed={status.cycle_elapsed} />
          <WaterLevelChart data={levelHistory} currentPhase={translatePhase(status.current_phase)} />
        </div>

        {/* Event Log */}
        <EventLog events={events} />

        {/* Configuration Panel */}
        <ConfigPanel
          config={config}
          isRunning={status.is_running}
          onConfigUpdate={handleConfigUpdate}
        />
      </main>

      <footer className="app-footer">
        <p>Hochschule Koblenz - IBC-Versuchskläranlage</p>
        <p>Kooperationsprojekt Elektrotechnik und Siedlungswasserwirtschaft</p>
      </footer>

      {/* Expert Menu Modal */}
      <ExpertMenu
        isOpen={expertMenuOpen}
        onClose={() => setExpertMenuOpen(false)}
      />
    </div>
  )
}

export default App
