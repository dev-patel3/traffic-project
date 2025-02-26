from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class TrafficFlow(Base):
    __tablename__ = 'traffic_flows'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    
    # Store flow data as JSON
    flow_data = Column(JSON, nullable=False)
    
    # Relationship to junctions
    junctions = relationship("JunctionConfiguration", back_populates="traffic_flow", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert TrafficFlow object to a dictionary representation"""
        return {
            "id": self.id,
            "name": self.name,
            "flows": self.flow_data
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a TrafficFlow instance from a dictionary"""
        flow_data = data.get("flows", {})
        return cls(
            name=data.get("name"),
            flow_data=flow_data
        )


class JunctionConfiguration(Base):
    __tablename__ = 'junction_configurations'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    
    # Foreign key relationship to traffic flow
    traffic_flow_id = Column(Integer, ForeignKey('traffic_flows.id'), nullable=False)
    traffic_flow = relationship("TrafficFlow", back_populates="junctions")
    
    # Junction configuration data as JSON
    junction_data = Column(JSON, nullable=False)
    
    # Metrics data as JSON
    metrics_data = Column(JSON, nullable=True)
    
    def to_dict(self):
        """Convert JunctionConfiguration object to a dictionary representation"""
        result = {
            "id": self.id,
            "name": self.name,
            "traffic_flow_config": self.traffic_flow.name,
            **self.junction_data  # Unpack junction configuration data
        }
        
        if self.metrics_data:
            result["metrics"] = self.metrics_data
            
        return result
    
    @classmethod
    def from_dict(cls, data, traffic_flow_id):
        """Create a JunctionConfiguration instance from a dictionary and traffic flow ID"""
        # Extract junction config data
        junction_data = {}
        metrics_data = {}
        
        # Copy all direction-specific data
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in data:
                junction_data[direction] = data[direction]
        
        # Extract metrics if they exist
        if 'metrics' in data:
            metrics_data = data['metrics']
        
        return cls(
            name=data.get("name"),
            traffic_flow_id=traffic_flow_id,
            junction_data=junction_data,
            metrics_data=metrics_data
        )


# Database connection and session management
def init_db(db_url='sqlite:///junction_sim.db'):
    """Initialize the database connection and create tables"""
    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    return engine


def get_session(engine):
    """Create a new session"""
    Session = sessionmaker(bind=engine)
    return Session()