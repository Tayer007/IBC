import React from 'react'
import './Statistics.css'

function Statistics({ stats, cycleElapsed }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const formatCycleTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  return (
    <div className="statistics card">
      <div className="card-header">
        <h2 className="card-title">📊 Statistiken</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Abgeschlossene Zyklen</div>
          <div className="stat-value">{stats.cycles_completed}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Gesamtlaufzeit</div>
          <div className="stat-value">{formatTime(stats.total_runtime)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Aktueller Zyklus</div>
          <div className="stat-value">{formatCycleTime(cycleElapsed)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Fehler</div>
          <div className={`stat-value ${stats.errors.length > 0 ? 'error' : ''}`}>
            {stats.errors.length}
          </div>
        </div>
      </div>

      {stats.last_cycle_start && (
        <div className="stat-detail">
          <div className="stat-detail-label">Letzter Zyklus gestartet:</div>
          <div className="stat-detail-value">
            {new Date(stats.last_cycle_start).toLocaleString('de-DE')}
          </div>
        </div>
      )}

      {stats.last_cycle_end && (
        <div className="stat-detail">
          <div className="stat-detail-label">Letzter Zyklus beendet:</div>
          <div className="stat-detail-value">
            {new Date(stats.last_cycle_end).toLocaleString('de-DE')}
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics
