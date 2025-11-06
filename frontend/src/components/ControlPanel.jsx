import React from 'react'
import './ControlPanel.css'

function ControlPanel({
  isRunning,
  isPaused,
  emergencyStopped,
  onStart,
  onStop,
  onPause,
  onResume,
  onEmergencyStop,
  onResetEmergency
}) {
  return (
    <div className="control-panel card">
      <div className="card-header">
        <h2 className="card-title">⚙️ Steuerung</h2>
      </div>
      <div className="control-panel-content">
        <div className="control-group">
          <h3>Zyklus Steuerung</h3>
          <div className="button-group">
            <button
              className="btn btn-success"
              onClick={onStart}
              disabled={isRunning || emergencyStopped}
            >
              ▶️ Zyklus Starten
            </button>
            <button
              className="btn btn-danger"
              onClick={onStop}
              disabled={!isRunning || emergencyStopped}
            >
              ⏹️ Zyklus Stoppen
            </button>
            {!isPaused ? (
              <button
                className="btn btn-warning"
                onClick={onPause}
                disabled={!isRunning || emergencyStopped}
              >
                ⏸️ Pausieren
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onResume}
                disabled={!isRunning || emergencyStopped}
              >
                ▶️ Fortsetzen
              </button>
            )}
          </div>
        </div>

        <div className="control-group">
          <h3>Notfall-Steuerung</h3>
          <div className="button-group">
            {!emergencyStopped ? (
              <button
                className="btn btn-danger emergency-btn"
                onClick={onEmergencyStop}
              >
                🚨 NOTAUS
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={onResetEmergency}
              >
                ✅ NOTAUS Zurücksetzen
              </button>
            )}
          </div>
        </div>

        {emergencyStopped && (
          <div className="emergency-alert">
            <strong>⚠️ NOTAUS AKTIV</strong>
            <p>Alle Komponenten sind deaktiviert. Setzen Sie den NOTAUS zurück, um den Betrieb fortzusetzen.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ControlPanel
