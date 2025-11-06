import React from 'react'
import './PhaseTimeline.css'

function PhaseTimeline({ currentPhase, phaseElapsed }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  // Translate phase name to German
  const getPhaseInfo = (phase) => {
    const phaseMap = {
      'idle': { name: 'Stillstand', icon: '⏸️' },
      'zulauf_1': { name: 'Zulauf 1', icon: '⬇️' },
      'unbelueftet_1': { name: 'Unbelüftet 1', icon: '🔵' },
      'belueftung_1': { name: 'Belüftung 1', icon: '💨' },
      'zulauf_2': { name: 'Zulauf 2', icon: '⬇️' },
      'unbelueftet_2': { name: 'Unbelüftet 2', icon: '🔵' },
      'belueftung_2': { name: 'Belüftung 2', icon: '💨' },
      'zulauf_3': { name: 'Zulauf 3', icon: '⬇️' },
      'unbelueftet_3': { name: 'Unbelüftet 3', icon: '🔵' },
      'belueftung_3': { name: 'Belüftung 3', icon: '💨' },
      'sedimentation': { name: 'Sedimentation', icon: '⏳' },
      'klarwasserabzug': { name: 'Klarwasserabzug', icon: '⬆️' },
      'stillstand': { name: 'Stillstandszeit', icon: '⏸️' },
      'emergency_stop': { name: 'NOTAUS', icon: '🚨' },
      'error': { name: 'Fehler', icon: '❌' }
    }
    return phaseMap[phase] || { name: phase, icon: '❓' }
  }

  const phaseInfo = getPhaseInfo(currentPhase)

  return (
    <div className="phase-timeline card">
      <div className="card-header">
        <h2 className="card-title">📑 Phasen-Status</h2>
      </div>
      <div className="current-phase-display">
        <div className="phase-icon-large">{phaseInfo.icon}</div>
        <div className="phase-details">
          <div className="phase-name">{phaseInfo.name}</div>
          {phaseElapsed > 0 && (
            <div className="phase-elapsed">Verstrichene Zeit: {formatTime(phaseElapsed)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhaseTimeline
