"""
Database models for logging treatment data
"""

from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

Base = declarative_base()


class SensorReading(Base):
    """Log sensor readings"""
    __tablename__ = 'sensor_readings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    water_level = Column(Float, nullable=False)  # in cm
    inlet_pump_state = Column(Boolean, default=False)
    recirculation_pump_state = Column(Boolean, default=False)
    outlet_pump_state = Column(Boolean, default=False)
    blower_state = Column(Boolean, default=False)
    current_phase = Column(String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'water_level': self.water_level,
            'inlet_pump_state': self.inlet_pump_state,
            'recirculation_pump_state': self.recirculation_pump_state,
            'outlet_pump_state': self.outlet_pump_state,
            'blower_state': self.blower_state,
            'current_phase': self.current_phase
        }


class TreatmentCycle(Base):
    """Log complete treatment cycles"""
    __tablename__ = 'treatment_cycles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    start_time = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    end_time = Column(DateTime)
    duration_seconds = Column(Integer)
    status = Column(String(50))  # completed, stopped, error
    filling_duration = Column(Integer)
    aeration_duration = Column(Integer)
    settling_duration = Column(Integer)
    draining_duration = Column(Integer)
    notes = Column(Text)

    def to_dict(self):
        return {
            'id': self.id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_seconds': self.duration_seconds,
            'status': self.status,
            'filling_duration': self.filling_duration,
            'aeration_duration': self.aeration_duration,
            'settling_duration': self.settling_duration,
            'draining_duration': self.draining_duration,
            'notes': self.notes
        }


class SystemEvent(Base):
    """Log system events and errors"""
    __tablename__ = 'system_events'

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # start, stop, error, alarm, etc.
    severity = Column(String(20))  # info, warning, error, critical
    message = Column(Text)
    data = Column(Text)  # JSON string for additional data

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'event_type': self.event_type,
            'severity': self.severity,
            'message': self.message,
            'data': json.loads(self.data) if self.data else None
        }


class Database:
    """Database manager"""

    def __init__(self, database_url: str = "sqlite:///ibc_treatment.db"):
        """
        Initialize database connection

        Args:
            database_url: SQLAlchemy database URL
        """
        self.engine = create_engine(database_url, echo=False)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        print(f"[DATABASE] Connected to {database_url}")

    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()

    def log_sensor_reading(self, level: float, components: dict, phase: str):
        """Log a sensor reading"""
        session = self.get_session()
        try:
            reading = SensorReading(
                water_level=level,
                inlet_pump_state=components.get('inlet_pump', False),
                recirculation_pump_state=components.get('recirculation_pump', False),
                outlet_pump_state=components.get('outlet_pump', False),
                blower_state=components.get('blower', False),
                current_phase=phase
            )
            session.add(reading)
            session.commit()
        finally:
            session.close()

    def log_system_event(self, event_type: str, message: str, severity: str = "info", data: dict = None):
        """Log a system event"""
        session = self.get_session()
        try:
            event = SystemEvent(
                event_type=event_type,
                severity=severity,
                message=message,
                data=json.dumps(data) if data else None
            )
            session.add(event)
            session.commit()
        finally:
            session.close()

    def start_treatment_cycle(self) -> int:
        """Start a new treatment cycle log"""
        session = self.get_session()
        try:
            cycle = TreatmentCycle(status='running')
            session.add(cycle)
            session.commit()
            cycle_id = cycle.id
            return cycle_id
        finally:
            session.close()

    def end_treatment_cycle(self, cycle_id: int, status: str, phase_durations: dict = None, notes: str = None):
        """End a treatment cycle log"""
        session = self.get_session()
        try:
            cycle = session.query(TreatmentCycle).filter_by(id=cycle_id).first()
            if cycle:
                cycle.end_time = datetime.utcnow()
                cycle.duration_seconds = int((cycle.end_time - cycle.start_time).total_seconds())
                cycle.status = status

                if phase_durations:
                    cycle.filling_duration = phase_durations.get('filling', 0)
                    cycle.aeration_duration = phase_durations.get('aeration', 0)
                    cycle.settling_duration = phase_durations.get('settling', 0)
                    cycle.draining_duration = phase_durations.get('draining', 0)

                if notes:
                    cycle.notes = notes

                session.commit()
        finally:
            session.close()

    def get_recent_readings(self, limit: int = 100):
        """Get recent sensor readings"""
        session = self.get_session()
        try:
            readings = session.query(SensorReading)\
                .order_by(SensorReading.timestamp.desc())\
                .limit(limit)\
                .all()
            return [r.to_dict() for r in readings]
        finally:
            session.close()

    def get_recent_events(self, limit: int = 50):
        """Get recent system events"""
        session = self.get_session()
        try:
            events = session.query(SystemEvent)\
                .order_by(SystemEvent.timestamp.desc())\
                .limit(limit)\
                .all()
            return [e.to_dict() for e in events]
        finally:
            session.close()

    def get_treatment_cycles(self, limit: int = 20):
        """Get recent treatment cycles"""
        session = self.get_session()
        try:
            cycles = session.query(TreatmentCycle)\
                .order_by(TreatmentCycle.start_time.desc())\
                .limit(limit)\
                .all()
            return [c.to_dict() for c in cycles]
        finally:
            session.close()

    def get_readings_by_timerange(self, start_time: datetime, end_time: datetime):
        """Get sensor readings within a time range"""
        session = self.get_session()
        try:
            readings = session.query(SensorReading)\
                .filter(SensorReading.timestamp >= start_time)\
                .filter(SensorReading.timestamp <= end_time)\
                .order_by(SensorReading.timestamp.asc())\
                .all()
            return [r.to_dict() for r in readings]
        finally:
            session.close()
