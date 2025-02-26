from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
import json
import os

from .models.db_models import TrafficFlow, JunctionConfiguration, init_db, get_session

# Initialize the database
engine = init_db()

def get_traffic_flow_by_name_or_id(session, identifier):
    """Helper function to get a traffic flow by name or ID"""
    if isinstance(identifier, int) or identifier.isdigit():
        # If ID is provided as an integer or digit string
        return session.query(TrafficFlow).filter(TrafficFlow.id == int(identifier)).first()
    else:
        # Otherwise try to find by name
        return session.query(TrafficFlow).filter(TrafficFlow.name == identifier).first()

def get_junction_by_name_or_id(session, identifier):
    """Helper function to get a junction by name or ID"""
    if isinstance(identifier, int) or identifier.isdigit():
        # If ID is provided as an integer or digit string
        return session.query(JunctionConfiguration).filter(JunctionConfiguration.id == int(identifier)).first()
    else:
        # Otherwise try to find by name
        return session.query(JunctionConfiguration).filter(JunctionConfiguration.name == identifier).first()

def migrate_json_to_db():
    """
    One-time function to migrate data from JSON file to SQLAlchemy database
    """
    JSON_FILE_PATH = "backend/database/storing_configs.json"
    
    if not os.path.exists(JSON_FILE_PATH):
        print("No JSON file found for migration")
        return False
    
    try:
        with open(JSON_FILE_PATH, "r") as file:
            data = json.load(file)
        
        traffic_flows = data.get("traffic_flow_configurations", {})
        junction_configs = data.get("junction_configurations", {})
        
        session = get_session(engine)
        
        # First, migrate traffic flows
        name_to_id_map = {}  # To map traffic flow names to their new IDs
        
        for name, flow_data in traffic_flows.items():
            # Create a proper flow object structure if needed
            if "flows" not in flow_data:
                # Convert old format to new format
                restructured_data = {
                    "name": name,
                    "flows": {}
                }
                
                for direction in ["northbound", "southbound", "eastbound", "westbound"]:
                    if direction in flow_data:
                        exit_data = flow_data[direction]
                        
                        # Calculate total flow
                        total_flow = sum(exit_data.values())
                        
                        restructured_data["flows"][direction] = {
                            "incoming_flow": total_flow,
                            "exits": exit_data
                        }
                
                flow_data = restructured_data
            
            tf = TrafficFlow.from_dict(flow_data)
            session.add(tf)
            session.flush()  # To get the ID
            name_to_id_map[name] = tf.id
        
        # Then, migrate junction configurations
        for name, junction_data in junction_configs.items():
            traffic_flow_name = junction_data.get("traffic_flow_config")
            
            if traffic_flow_name in name_to_id_map:
                traffic_flow_id = name_to_id_map[traffic_flow_name]
                jc = JunctionConfiguration.from_dict(junction_data, traffic_flow_id)
                session.add(jc)
        
        session.commit()
        return True
    
    except Exception as e:
        print(f"Migration error: {e}")
        session.rollback()
        return False
    finally:
        session.close()

# Main storage functions

def get_all_traffic_flows():
    """Get all traffic flow configurations from the database"""
    session = get_session(engine)
    try:
        flows = session.query(TrafficFlow).all()
        return [flow.to_dict() for flow in flows]
    except SQLAlchemyError as e:
        print(f"Database error getting all traffic flows: {e}")
        return []
    finally:
        session.close()

def getting_traffic_flow(flow_id):
    """Get a specific traffic flow by ID or name"""
    session = get_session(engine)
    try:
        flow = get_traffic_flow_by_name_or_id(session, flow_id)
        if flow:
            return flow.to_dict()
        return None
    except SQLAlchemyError as e:
        print(f"Database error getting traffic flow {flow_id}: {e}")
        return None
    finally:
        session.close()

def saving_traffic_flow(flow_obj):
    """Save a new traffic flow to the database"""
    session = get_session(engine)
    try:
        # Check if a flow with this name already exists
        existing = session.query(TrafficFlow).filter(TrafficFlow.name == flow_obj.name).first()
        if existing:
            print(f"Error: Traffic flow with name '{flow_obj.name}' already exists")
            return False
        
        # Create new TrafficFlow database object
        flow_dict = flow_obj.to_dict()
        db_flow = TrafficFlow(
            name=flow_dict["name"],
            flow_data=flow_dict["flows"]
        )
        
        session.add(db_flow)
        session.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Database error saving traffic flow: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def updating_traffic_flow(flow_obj):
    """Update an existing traffic flow in the database"""
    session = get_session(engine)
    try:
        existing = session.query(TrafficFlow).filter(TrafficFlow.name == flow_obj.name).first()
        if not existing:
            print(f"Error: Traffic flow '{flow_obj.name}' not found for update")
            return False
        
        # Update the flow data
        flow_dict = flow_obj.to_dict()
        existing.flow_data = flow_dict["flows"]
        
        session.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Database error updating traffic flow: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def deleting_traffic_flow(flow_id):
    """Delete a traffic flow and all its associated junctions"""
    session = get_session(engine)
    try:
        flow = get_traffic_flow_by_name_or_id(session, flow_id)
        if not flow:
            print(f"Error: Traffic flow '{flow_id}' not found for deletion")
            return False
        
        # The cascade will delete associated junctions
        session.delete(flow)
        session.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Database error deleting traffic flow: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def loading_junctions_configurations():
    """Get all junction configurations from the database"""
    session = get_session(engine)
    try:
        junctions = session.query(JunctionConfiguration).all()
        return [junction.to_dict() for junction in junctions]
    except SQLAlchemyError as e:
        print(f"Database error getting all junction configurations: {e}")
        return []
    finally:
        session.close()

def getting_junction_configuration(junction_id):
    """Get a specific junction configuration by ID or name"""
    session = get_session(engine)
    try:
        junction = get_junction_by_name_or_id(session, junction_id)
        if junction:
            return junction.to_dict()
        return None
    except SQLAlchemyError as e:
        print(f"Database error getting junction configuration {junction_id}: {e}")
        return None
    finally:
        session.close()

def saving_junction_configuration(junction_obj):
    """Save a new junction configuration to the database"""
    session = get_session(engine)
    try:
        # Check if a junction with this name already exists
        existing = session.query(JunctionConfiguration).filter(
            JunctionConfiguration.name == junction_obj.name
        ).first()
        
        if existing:
            print(f"Error: Junction configuration '{junction_obj.name}' already exists")
            return False
        
        # Get the associated traffic flow
        traffic_flow = session.query(TrafficFlow).filter(
            TrafficFlow.name == junction_obj.traffic_flow_name
        ).first()
        
        if not traffic_flow:
            print(f"Error: Traffic flow '{junction_obj.traffic_flow_name}' not found")
            return False
        
        # Create dictionary representation of junction data
        junction_dict = junction_obj.to_dict()
        
        # Extract junction-specific data
        junction_data = {}
        metrics_data = {}
        
        # Extract direction-specific data
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in junction_dict:
                junction_data[direction] = junction_dict[direction]
        
        # Extract metrics if they exist
        if 'metrics' in junction_dict:
            metrics_data = junction_dict['metrics']
        
        # Create new JunctionConfiguration database object
        db_junction = JunctionConfiguration(
            name=junction_obj.name,
            traffic_flow_id=traffic_flow.id,
            junction_data=junction_data,
            metrics_data=metrics_data
        )
        
        session.add(db_junction)
        session.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Database error saving junction configuration: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def deleting_junction_configuration(junction_id):
    """Delete a junction configuration"""
    session = get_session(engine)
    try:
        junction = get_junction_by_name_or_id(session, junction_id)
        if not junction:
            print(f"Error: Junction configuration '{junction_id}' not found for deletion")
            return False
        
        session.delete(junction)
        session.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Database error deleting junction configuration: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def get_functions_for_traffic_flow(flow_id):
    """Get all junction configurations for a specific traffic flow"""
    session = get_session(engine)
    try:
        flow = get_traffic_flow_by_name_or_id(session, flow_id)
        if not flow:
            print(f"Error: Traffic flow '{flow_id}' not found")
            return None
        
        junctions = session.query(JunctionConfiguration).filter(
            JunctionConfiguration.traffic_flow_id == flow.id
        ).all()
        
        return [junction.to_dict() for junction in junctions]
    except SQLAlchemyError as e:
        print(f"Database error getting junctions for traffic flow {flow_id}: {e}")
        return None
    finally:
        session.close()

# Export the same functions as the original storage module to maintain compatibility
loading_traffic_flows = get_all_traffic_flows
saving_traffic_flows = lambda data: True  # No direct equivalent, handled by individual save functions