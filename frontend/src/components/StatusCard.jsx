import React from 'react'
import './StatusCard.css'

const icons = {
  activity: '📊',
  layers: '📑',
  droplet: '💧',
  repeat: '🔄'
}

function StatusCard({ title, value, subtitle, status = 'info', icon }) {
  return (
    <div className={`status-card card status-${status}`}>
      <div className="status-card-header">
        <span className="status-icon">{icons[icon] || '📌'}</span>
        <h3>{title}</h3>
      </div>
      <div className="status-card-value">{value}</div>
      {subtitle && <div className="status-card-subtitle">{subtitle}</div>}
    </div>
  )
}

export default StatusCard
