import React from 'react'
import './ComponentStatus.css'

const componentLabels = {
  inlet_pump: { icon: '🚰', name: 'Zulaufpumpe', subtitle: 'Inlet Pump' },
  drain_valve: { icon: '🚿', name: 'Ablaufventil', subtitle: 'Drain Valve' },
  blower: { icon: '💨', name: 'Verdichter', subtitle: 'Air Blower' }
}

const aerationModeLabels = {
  none: 'Aus (Off)',
  continuous: 'Belüftung (Continuous)',
  pulse: 'Stoßbelüftung (Pulse)'
}

function ComponentStatus({ components, aerationMode, isRunning, onManualControl }) {
  // Filter out recirculation_pump and outlet_pump if they exist (legacy)
  const validComponents = Object.entries(components).filter(([key]) =>
    key === 'inlet_pump' || key === 'drain_valve' || key === 'blower'
  )

  return (
    <div className="component-status card">
      <div className="card-header">
        <h2 className="card-title">⚙️ Komponenten-Status</h2>
        {aerationMode && aerationMode !== 'none' && (
          <div className={`aeration-badge ${aerationMode}`}>
            <span className="aeration-icon">🌪️</span>
            <span>{aerationModeLabels[aerationMode]}</span>
          </div>
        )}
      </div>

      <div className="components-grid">
        {validComponents.map(([key, state]) => {
          const component = componentLabels[key]
          return (
            <div key={key} className={`component-card ${state ? 'active' : 'inactive'}`}>
              <div className="component-visual">
                <div className={`component-icon-wrapper ${state ? 'running' : ''}`}>
                  <span className="component-icon">{component.icon}</span>
                  {state && (
                    <div className="pulse-ring"></div>
                  )}
                </div>
                <div className={`status-indicator ${state ? 'on' : 'off'}`}>
                  <div className="indicator-dot"></div>
                </div>
              </div>

              <div className="component-details">
                <h3 className="component-name">{component.name}</h3>
                <p className="component-subtitle">{component.subtitle}</p>
                <div className={`status-badge ${state ? 'on' : 'off'}`}>
                  {state ? 'AKTIV' : 'INAKTIV'}
                </div>
              </div>

              {!isRunning && (
                <button
                  className={`component-toggle-btn ${state ? 'active' : ''}`}
                  onClick={() => onManualControl(key, !state)}
                  title={state ? 'Ausschalten' : 'Einschalten'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {state ? (
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    ) : (
                      <circle cx="12" cy="12" r="9" />
                    )}
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {!isRunning && (
        <div className="manual-mode-notice">
          <span className="notice-icon">💡</span>
          <span>Manuelle Steuerung aktiv</span>
        </div>
      )}
    </div>
  )
}

export default ComponentStatus
