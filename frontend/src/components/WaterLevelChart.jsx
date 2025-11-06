import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './WaterLevelChart.css'

function WaterLevelChart({ data, currentPhase }) {
  return (
    <div className="water-level-chart card">
      <div className="card-header">
        <h2 className="card-title">📈 Wasserstand Verlauf</h2>
        <span className="badge badge-info">{currentPhase}</span>
      </div>
      <div className="chart-container">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '0.75rem' }}
                label={{ value: 'Pegel (cm)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0'
                }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Wasserstand (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>Noch keine Daten. Starten Sie einen Behandlungszyklus, um Echtzeit-Daten zu sehen.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaterLevelChart
