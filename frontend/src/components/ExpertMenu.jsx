import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin

function ExpertMenu({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('measurements')
  const [measurements, setMeasurements] = useState([])
  const [events, setEvents] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [logRange, setLogRange] = useState('100') // Last N lines

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'measurements') {
        fetchMeasurements()
      } else if (activeTab === 'events') {
        fetchEvents()
      } else if (activeTab === 'logs') {
        fetchLogs()
      }
    }
  }, [isOpen, activeTab])

  const fetchMeasurements = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/expert/measurements?limit=100`)
      const data = await response.json()
      setMeasurements(data.readings || [])
    } catch (error) {
      console.error('Fehler beim Laden der Messungen:', error)
    }
    setLoading(false)
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/expert/events?limit=100`)
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Fehler beim Laden der Ereignisse:', error)
    }
    setLoading(false)
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/expert/logs?lines=${logRange}`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Fehler beim Laden der Logs:', error)
    }
    setLoading(false)
  }

  const downloadData = (type) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    let dataStr, filename

    if (type === 'measurements') {
      dataStr = JSON.stringify(measurements, null, 2)
      filename = `measurements_${timestamp}.json`
    } else if (type === 'events') {
      dataStr = JSON.stringify(events, null, 2)
      filename = `events_${timestamp}.json`
    } else if (type === 'logs') {
      dataStr = logs.join('\n')
      filename = `logs_${timestamp}.txt`
    }

    const blob = new Blob([dataStr], { type: type === 'logs' ? 'text/plain' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="expert-menu-overlay" onClick={onClose}>
      <div className="expert-menu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="expert-menu-header">
          <h2>🔧 Experten-Menü</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="expert-menu-tabs">
          <button
            className={`tab ${activeTab === 'measurements' ? 'active' : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            📊 Messungen
          </button>
          <button
            className={`tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            📋 System-Ereignisse
          </button>
          <button
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📄 Log-Dateien
          </button>
        </div>

        <div className="expert-menu-content">
          {loading && <div className="loading">Lädt...</div>}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && !loading && (
            <div className="measurements-tab">
              <div className="tab-header">
                <h3>Sensor-Messungen (letzte 100)</h3>
                <button className="download-btn" onClick={() => downloadData('measurements')}>
                  ⬇ Herunterladen
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zeitstempel</th>
                      <th>Wasserstand (cm)</th>
                      <th>Zulaufpumpe</th>
                      <th>Umwälzpumpe</th>
                      <th>Ablaufpumpe</th>
                      <th>Gebläse</th>
                      <th>Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, idx) => (
                      <tr key={idx}>
                        <td>{new Date(m.timestamp).toLocaleString('de-DE')}</td>
                        <td>{m.water_level?.toFixed(1)}</td>
                        <td>{m.inlet_pump_state ? '✓' : '✗'}</td>
                        <td>{m.recirculation_pump_state ? '✓' : '✗'}</td>
                        <td>{m.outlet_pump_state ? '✓' : '✗'}</td>
                        <td>{m.blower_state ? '✓' : '✗'}</td>
                        <td>{m.current_phase}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && !loading && (
            <div className="events-tab">
              <div className="tab-header">
                <h3>System-Ereignisse (letzte 100)</h3>
                <button className="download-btn" onClick={() => downloadData('events')}>
                  ⬇ Herunterladen
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zeitstempel</th>
                      <th>Typ</th>
                      <th>Schweregrad</th>
                      <th>Nachricht</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, idx) => (
                      <tr key={idx} className={`severity-${e.severity}`}>
                        <td>{new Date(e.timestamp).toLocaleString('de-DE')}</td>
                        <td>{e.event_type}</td>
                        <td>
                          <span className={`severity-badge ${e.severity}`}>
                            {e.severity}
                          </span>
                        </td>
                        <td>{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && !loading && (
            <div className="logs-tab">
              <div className="tab-header">
                <h3>Backend Log-Datei</h3>
                <div className="log-controls">
                  <select
                    value={logRange}
                    onChange={(e) => {
                      setLogRange(e.target.value)
                      setTimeout(fetchLogs, 100)
                    }}
                  >
                    <option value="50">Letzte 50 Zeilen</option>
                    <option value="100">Letzte 100 Zeilen</option>
                    <option value="500">Letzte 500 Zeilen</option>
                    <option value="1000">Letzte 1000 Zeilen</option>
                  </select>
                  <button className="download-btn" onClick={() => downloadData('logs')}>
                    ⬇ Herunterladen
                  </button>
                </div>
              </div>
              <div className="logs-container">
                <pre className="log-content">
                  {logs.map((line, idx) => (
                    <div key={idx} className="log-line">
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

ExpertMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ExpertMenu
