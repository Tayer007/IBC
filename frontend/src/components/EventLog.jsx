import React from 'react'
import './EventLog.css'

function EventLog({ events }) {
  return (
    <div className="event-log card">
      <div className="card-header">
        <h2 className="card-title">📋 Ereignisprotokoll</h2>
      </div>
      <div className="event-log-container">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className={`event-item event-${event.type}`}>
              <div className="event-time">{event.time}</div>
              <div className="event-content">
                <span className="event-source">{event.source}</span>
                <span className="event-message">{event.message}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>Noch keine Ereignisse</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventLog
