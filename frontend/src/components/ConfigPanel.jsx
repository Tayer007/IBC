import { useState, useEffect } from 'react'
import './ConfigPanel.css'

// Backend API URL configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin

function ConfigPanel({ config, isRunning, onConfigUpdate }) {
  const [phaseDurations, setPhaseDurations] = useState({
    t_z1: 0,
    t_d1: 0,
    t_n1: 0,
    t_z2: 0,
    t_d2: 0,
    t_n2: 0,
    t_z3: 900,
    t_d3: 900,
    t_n3: 1800,
    t_sed: 3600,
    t_abzug: 3600,
    t_still: 0
  })

  const [aerationSettings, setAerationSettings] = useState({
    t_luftan: 300,
    t_luftpause: 180,
    t_stossan: 6,
    t_stosspause: 300
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Load configuration from props
  useEffect(() => {
    if (config?.phase_durations) {
      setPhaseDurations(config.phase_durations)
    }
    if (config?.aeration) {
      setAerationSettings({
        t_luftan: config.aeration.continuous.t_luftan,
        t_luftpause: config.aeration.continuous.t_luftpause,
        t_stossan: config.aeration.pulse.t_stossan,
        t_stosspause: config.aeration.pulse.t_stosspause
      })
    }
  }, [config])

  const convertToMinutes = (seconds) => {
    return (seconds / 60).toFixed(1)
  }

  const convertToSeconds = (minutes) => {
    return parseFloat(minutes) * 60
  }

  const handlePhaseChange = (key, valueInMinutes) => {
    const value = parseFloat(valueInMinutes)
    if (isNaN(value) || value < 0) {
      setErrors({ ...errors, [key]: 'Bitte eine Zahl zwischen 0 und 999 eingeben' })
      setTimeout(() => {
        setErrors({ ...errors, [key]: '' })
      }, 3000)
      return
    }

    const seconds = convertToSeconds(value)
    setPhaseDurations({ ...phaseDurations, [key]: seconds })
    setErrors({ ...errors, [key]: '' })
  }

  const handleAerationChange = (key, valueInMinutes) => {
    const value = parseFloat(valueInMinutes)
    if (isNaN(value) || value < 0) {
      setErrors({ ...errors, [key]: 'Bitte eine Zahl zwischen 0 und 999 eingeben' })
      setTimeout(() => {
        setErrors({ ...errors, [key]: '' })
      }, 3000)
      return
    }

    const seconds = convertToSeconds(value)
    setAerationSettings({ ...aerationSettings, [key]: seconds })
    setErrors({ ...errors, [key]: '' })
  }

  const handleSavePhases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/phase-durations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phaseDurations)
      })
      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Phasendauern erfolgreich aktualisiert!')
        setTimeout(() => setSuccessMessage(''), 3000)
        if (onConfigUpdate) onConfigUpdate()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren: ' + error.message)
    }
  }

  const handleSaveAeration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/aeration`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aerationSettings)
      })
      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Belüftungseinstellungen erfolgreich aktualisiert!')
        setTimeout(() => setSuccessMessage(''), 3000)
        if (onConfigUpdate) onConfigUpdate()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren: ' + error.message)
    }
  }

  // Calculate total cycle duration
  const totalDuration = Object.values(phaseDurations).reduce((sum, val) => sum + val, 0)

  return (
    <div className="config-panel card">
      <div className="card-header">
        <h2 className="card-title">⚙️ Konfiguration - Phasendauern</h2>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {isRunning && (
        <div className="warning-message">
          ⚠️ Konfiguration kann nur geändert werden, wenn der Zyklus nicht läuft
        </div>
      )}

      <div className="config-grid">
        {/* Cycle 1 */}
        <div className="config-section">
          <h3>Zyklus 1</h3>

          <ConfigInput
            label="Zulauf 1:"
            value={convertToMinutes(phaseDurations.t_z1)}
            onChange={(val) => handlePhaseChange('t_z1', val)}
            disabled={isRunning}
            error={errors.t_z1}
          />

          <ConfigInput
            label="Unbelüftet 1:"
            value={convertToMinutes(phaseDurations.t_d1)}
            onChange={(val) => handlePhaseChange('t_d1', val)}
            disabled={isRunning}
            error={errors.t_d1}
          />

          <ConfigInput
            label="Belüftung 1:"
            value={convertToMinutes(phaseDurations.t_n1)}
            onChange={(val) => handlePhaseChange('t_n1', val)}
            disabled={isRunning}
            error={errors.t_n1}
          />
        </div>

        {/* Cycle 2 */}
        <div className="config-section">
          <h3>Zyklus 2</h3>

          <ConfigInput
            label="Zulauf 2:"
            value={convertToMinutes(phaseDurations.t_z2)}
            onChange={(val) => handlePhaseChange('t_z2', val)}
            disabled={isRunning}
            error={errors.t_z2}
          />

          <ConfigInput
            label="Unbelüftet 2:"
            value={convertToMinutes(phaseDurations.t_d2)}
            onChange={(val) => handlePhaseChange('t_d2', val)}
            disabled={isRunning}
            error={errors.t_d2}
          />

          <ConfigInput
            label="Belüftung 2:"
            value={convertToMinutes(phaseDurations.t_n2)}
            onChange={(val) => handlePhaseChange('t_n2', val)}
            disabled={isRunning}
            error={errors.t_n2}
          />
        </div>

        {/* Cycle 3 */}
        <div className="config-section">
          <h3>Zyklus 3</h3>

          <ConfigInput
            label="Zulauf 3:"
            value={convertToMinutes(phaseDurations.t_z3)}
            onChange={(val) => handlePhaseChange('t_z3', val)}
            disabled={isRunning}
            error={errors.t_z3}
          />

          <ConfigInput
            label="Unbelüftet 3:"
            value={convertToMinutes(phaseDurations.t_d3)}
            onChange={(val) => handlePhaseChange('t_d3', val)}
            disabled={isRunning}
            error={errors.t_d3}
          />

          <ConfigInput
            label="Belüftung 3:"
            value={convertToMinutes(phaseDurations.t_n3)}
            onChange={(val) => handlePhaseChange('t_n3', val)}
            disabled={isRunning}
            error={errors.t_n3}
          />
        </div>

        {/* Final Phases */}
        <div className="config-section">
          <h3>Abschluss-Phasen</h3>

          <ConfigInput
            label="Sedimentation:"
            value={convertToMinutes(phaseDurations.t_sed)}
            onChange={(val) => handlePhaseChange('t_sed', val)}
            disabled={isRunning}
            error={errors.t_sed}
          />

          <ConfigInput
            label="Klarwasserabzug:"
            value={convertToMinutes(phaseDurations.t_abzug)}
            onChange={(val) => handlePhaseChange('t_abzug', val)}
            disabled={isRunning}
            error={errors.t_abzug}
          />

          <ConfigInput
            label="Stillstandszeit:"
            value={convertToMinutes(phaseDurations.t_still)}
            onChange={(val) => handlePhaseChange('t_still', val)}
            disabled={isRunning}
            error={errors.t_still}
          />
        </div>

        {/* Aeration Settings */}
        <div className="config-section">
          <h3>Belüftung</h3>

          <ConfigInput
            label="Belüftung An:"
            value={convertToMinutes(aerationSettings.t_luftan)}
            onChange={(val) => handleAerationChange('t_luftan', val)}
            disabled={isRunning}
            error={errors.t_luftan}
          />

          <ConfigInput
            label="Belüftung Pause:"
            value={convertToMinutes(aerationSettings.t_luftpause)}
            onChange={(val) => handleAerationChange('t_luftpause', val)}
            disabled={isRunning}
            error={errors.t_luftpause}
          />
        </div>

        {/* Pulse Aeration Settings */}
        <div className="config-section">
          <h3>Stoßbelüftung</h3>

          <ConfigInput
            label="Stoßluft An:"
            value={convertToMinutes(aerationSettings.t_stossan)}
            onChange={(val) => handleAerationChange('t_stossan', val)}
            disabled={isRunning}
            error={errors.t_stossan}
          />

          <ConfigInput
            label="Stoßluft Pause:"
            value={convertToMinutes(aerationSettings.t_stosspause)}
            onChange={(val) => handleAerationChange('t_stosspause', val)}
            disabled={isRunning}
            error={errors.t_stosspause}
          />
        </div>
      </div>

      {/* Total Cycle Time */}
      <div className="total-time">
        <span className="total-label">Zykluszeit gesamt:</span>
        <span className="total-value">{convertToMinutes(totalDuration)} Min.</span>
      </div>

      {/* Save Buttons */}
      <div className="save-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSavePhases}
          disabled={isRunning}
        >
          Phasendauern Speichern
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSaveAeration}
          disabled={isRunning}
        >
          Belüftung Speichern
        </button>
      </div>
    </div>
  )
}

function ConfigInput({ label, value, onChange, disabled, error }) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSliderChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)  // Update immediately on slider change
  }

  const handleBlur = () => {
    onChange(inputValue)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onChange(inputValue)
    }
  }

  // Determine max value for slider (reasonable defaults)
  const maxValue = Math.max(120, parseFloat(value) * 2 || 120)  // At least 120 min (2 hours)

  return (
    <div className="config-input-row">
      <label className="config-label">{label}</label>
      <div className="config-input-container">
        <input
          type="range"
          className="config-slider"
          value={inputValue}
          onChange={handleSliderChange}
          disabled={disabled}
          min="0"
          max={maxValue}
          step="0.5"
        />
        <div className="config-value-group">
          <input
            type="number"
            className="config-input"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            step="0.1"
            min="0"
          />
          <span className="config-unit">Min.</span>
          <button
            className="config-ok-btn"
            onClick={() => onChange(inputValue)}
            disabled={disabled}
          >
            ✓
          </button>
        </div>
      </div>
      {error && <span className="config-error">{error}</span>}
    </div>
  )
}

export default ConfigPanel
