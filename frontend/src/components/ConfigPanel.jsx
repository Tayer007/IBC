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

  const [numCycles, setNumCycles] = useState(3)
  const [cycleRepetitions, setCycleRepetitions] = useState(1)

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
    if (config?.num_cycles !== undefined) {
      setNumCycles(config.num_cycles)
    }
    if (config?.cycle_repetitions !== undefined) {
      setCycleRepetitions(config.cycle_repetitions)
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

  const handleSaveNumCycles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/num-cycles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_cycles: parseInt(numCycles) })
      })
      const data = await response.json()

      if (data.success) {
        setSuccessMessage(`Anzahl Zyklen erfolgreich auf ${numCycles} gesetzt!`)
        setTimeout(() => setSuccessMessage(''), 3000)
        if (onConfigUpdate) onConfigUpdate()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren: ' + error.message)
    }
  }

  const handleSaveCycleRepetitions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/cycle-repetitions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_repetitions: parseInt(cycleRepetitions) })
      })
      const data = await response.json()

      if (data.success) {
        setSuccessMessage(`Zykluswiederholungen erfolgreich auf ${cycleRepetitions} gesetzt!`)
        setTimeout(() => setSuccessMessage(''), 3000)
        if (onConfigUpdate) onConfigUpdate()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren: ' + error.message)
    }
  }

  // Calculate total cycle duration based on active cycles
  const calculateActiveDuration = () => {
    let total = 0

    // Add cycle 1 phases if numCycles >= 1
    if (numCycles >= 1) {
      total += phaseDurations.t_z1 + phaseDurations.t_d1 + phaseDurations.t_n1
    }

    // Add cycle 2 phases if numCycles >= 2
    if (numCycles >= 2) {
      total += phaseDurations.t_z2 + phaseDurations.t_d2 + phaseDurations.t_n2
    }

    // Add cycle 3+ phases (cycles 3-9999 use the same durations as cycle 3)
    if (numCycles >= 3) {
      const cycleDuration = phaseDurations.t_z3 + phaseDurations.t_d3 + phaseDurations.t_n3
      const additionalCycles = numCycles - 2 // cycles 3, 4, 5, ..., numCycles
      total += cycleDuration * additionalCycles
    }

    // Always add final phases
    total += phaseDurations.t_sed + phaseDurations.t_abzug + phaseDurations.t_still

    return total
  }

  const totalDuration = calculateActiveDuration()
  const totalWithRepetitions = totalDuration * cycleRepetitions

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

      {/* Cycle Configuration Section */}
      <div className="config-section" style={{marginBottom: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px'}}>
        <h3>🔄 Zyklussteuerung</h3>

        <div style={{display: 'flex', gap: '20px', alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <label className="config-label">Anzahl Zyklen:</label>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <input
                type="number"
                className="config-input"
                value={numCycles}
                onChange={(e) => setNumCycles(Math.max(0, Math.min(9999, parseInt(e.target.value) || 0)))}
                disabled={isRunning}
                min="0"
                max="9999"
                style={{width: '120px'}}
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveNumCycles}
                disabled={isRunning}
                style={{whiteSpace: 'nowrap'}}
              >
                Speichern
              </button>
            </div>
            <small style={{color: '#888', fontSize: '0.85em'}}>
              Anzahl der Fütterungszyklen (Zulauf → Unbel. → Bel.)
            </small>
          </div>

          <div style={{flex: 1}}>
            <label className="config-label">Wiederholungen (min: 1):</label>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <input
                type="number"
                className="config-input"
                value={cycleRepetitions}
                onChange={(e) => setCycleRepetitions(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isRunning}
                min="1"
                style={{width: '80px'}}
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveCycleRepetitions}
                disabled={isRunning}
                style={{whiteSpace: 'nowrap'}}
              >
                Speichern
              </button>
            </div>
            <small style={{color: '#888', fontSize: '0.85em'}}>
              Wie oft soll die gesamte Sequenz wiederholt werden?
            </small>
          </div>
        </div>
      </div>

      <div className="config-grid">
        {/* Dynamically render cycles based on numCycles */}
        {Array.from({ length: Math.min(numCycles, 3) }, (_, i) => i + 1).map(cycleNum => (
          <div className="config-section" key={`cycle-${cycleNum}`}>
            <h3>Zyklus {cycleNum}</h3>

            <ConfigInput
              label={`Zulauf ${cycleNum}:`}
              value={convertToMinutes(phaseDurations[`t_z${cycleNum}`])}
              onChange={(val) => handlePhaseChange(`t_z${cycleNum}`, val)}
              disabled={isRunning}
              error={errors[`t_z${cycleNum}`]}
            />

            <ConfigInput
              label={`Unbelüftet ${cycleNum}:`}
              value={convertToMinutes(phaseDurations[`t_d${cycleNum}`])}
              onChange={(val) => handlePhaseChange(`t_d${cycleNum}`, val)}
              disabled={isRunning}
              error={errors[`t_d${cycleNum}`]}
            />

            <ConfigInput
              label={`Belüftung ${cycleNum}:`}
              value={convertToMinutes(phaseDurations[`t_n${cycleNum}`])}
              onChange={(val) => handlePhaseChange(`t_n${cycleNum}`, val)}
              disabled={isRunning}
              error={errors[`t_n${cycleNum}`]}
            />
          </div>
        ))}

        {/* Show info if cycles > 3 */}
        {numCycles > 3 && (
          <div className="config-section" style={{gridColumn: '1 / -1', backgroundColor: '#fff3cd', border: '1px solid #ffc107'}}>
            <p style={{margin: '10px', color: '#856404'}}>
              ⚠️ <strong>Hinweis:</strong> Zyklen 4-{numCycles} verwenden dieselben Phasendauern wie Zyklus 3.
              <br/>
              Alle {numCycles} Zyklen werden nacheinander ausgeführt.
            </p>
          </div>
        )}

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
        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
          <div>
            <span className="total-label">Sequenzdauer (1x):</span>
            <span className="total-value">{convertToMinutes(totalDuration)} Min.</span>
          </div>
          <div style={{borderTop: '1px solid #ddd', paddingTop: '5px'}}>
            <span className="total-label">Gesamtdauer ({cycleRepetitions} Wiederholung{cycleRepetitions > 1 ? 'en' : ''}):</span>
            <span className="total-value" style={{color: '#059669', fontWeight: 'bold'}}>
              {convertToMinutes(totalWithRepetitions)} Min.
            </span>
          </div>
        </div>
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
