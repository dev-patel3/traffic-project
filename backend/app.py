from flask import Flask, request, jsonify
from flask_cors import CORS
import json

from .models.traffic_flow import TrafficFlow as TrafficFlowModel
from .models.junction_config import JunctionConfiguration as JunctionConfigModel
from .models.traffic_flow_input import TrafficFlowInput
from .models.junction_config_input import JunctionConfigurationInput

from .storage import (
    getting_traffic_flow,
    deleting_traffic_flow,
    saving_traffic_flow,
    updating_traffic_flow,
    getting_junction_configuration,
    deleting_junction_configuration,
    saving_junction_configuration,
    get_all_traffic_flows,
    get_functions_for_traffic_flow,
    migrate_json_to_db
)

app = Flask(__name__)
CORS(app, resources={
     r"/api/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"]
     }
})

# Migrate data from JSON to SQLite database on first run
@app.before_first_request
def initialize_db():
    migrate_json_to_db()

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Backend API is running"})

@app.route('/api/traffic-flows', methods=['GET'])
def get_traffic_flows():
    """Gets all traffic flow configurations."""
    try:
        # Get all traffic flows from the database
        traffic_flows_data = get_all_traffic_flows()
        
        # Transform the data for frontend
        traffic_flows = []
        
        for flow in traffic_flows_data:
            # New format handled by SQLAlchemy models
            flows = flow.get("flows", {})
            
            # Calculate total flows
            northVPH = (flows.get("northbound", {}).get("incoming_flow", 0) or 
                       sum(flows.get("northbound", {}).get("exits", {}).values(), 0))
            southVPH = (flows.get("southbound", {}).get("incoming_flow", 0) or 
                       sum(flows.get("southbound", {}).get("exits", {}).values(), 0))
            eastVPH = (flows.get("eastbound", {}).get("incoming_flow", 0) or 
                      sum(flows.get("eastbound", {}).get("exits", {}).values(), 0))
            westVPH = (flows.get("westbound", {}).get("incoming_flow", 0) or 
                      sum(flows.get("westbound", {}).get("exits", {}).values(), 0))
            
            # Get junctions for this traffic flow
            junctions = get_functions_for_traffic_flow(flow.get("id") or flow.get("name", ""))
            
            traffic_flows.append({
                "id": str(flow.get("id", "")),
                "name": flow.get("name", ""),
                "northVPH": northVPH,
                "southVPH": southVPH,
                "eastVPH": eastVPH,
                "westVPH": westVPH,
                "junctionCount": len(junctions) if junctions else 0
            })
            
        return jsonify(traffic_flows)
        
    except Exception as e:
        print(f"Error in get_traffic_flows: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/traffic-flows/<flow_id>', methods=['GET'])
def get_traffic_flow(flow_id):
    """Gets a specific traffic flow configuration."""
    try:
        flow_config = getting_traffic_flow(flow_id)
        
        if not flow_config:
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Transform the data for frontend in new format
        transformed_flow = {
            "id": str(flow_config.get("id", "")),
            "name": flow_config.get("name", ""),
            "flows": flow_config.get("flows", {})
        }
        
        return jsonify(transformed_flow)
        
    except Exception as e:
        print(f"Error in get_traffic_flow: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/traffic-flows', methods=['POST'])
def create_traffic_flow():
    """Creates a new traffic flow configuration."""
    try:
        new_config = request.get_json()
        
        # Get all traffic flows to check for name uniqueness
        all_flows = get_all_traffic_flows()
        existing_names = {flow.get("name") for flow in all_flows}

        # Extract flow rates from new format
        flow_rates = {}
        exit_distributions = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in new_config.get("flows", {}):
                direction_data = new_config["flows"][direction]
                flow_rates[direction] = direction_data.get("incoming_flow", 0)
                exit_distributions[direction] = direction_data.get("exits", {})

        # Creates and validates TrafficFlowInput
        traffic_flow_input = TrafficFlowInput(
            name=new_config.get("name", ""),
            flows=new_config.get("flows", {}),
            existing_traffic_config_names=existing_names
        )

        if not traffic_flow_input.validate():
            return jsonify({
                "success": False,
                "error": traffic_flow_input.errors
            }), 400

        # Constructing a TrafficFlow object after validation
        traffic_flow = TrafficFlowModel(
            name=new_config.get("name", ""),
            flow_rates=flow_rates,
            exit_distributions=exit_distributions
        )
        
        if not saving_traffic_flow(traffic_flow):
            return jsonify({
                "success": False,
                "error": "Traffic flow configuration already exists or could not be saved"
            }), 400
        
        return jsonify({
            "success": True,
            "message": "Traffic flow created successfully"
        })
        
    except Exception as e:
        print(f"Error in create_traffic_flow: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/traffic-flows/<flow_id>', methods=['PUT'])
def update_traffic_flow(flow_id):
    """Updates an existing traffic flow configuration."""
    try:
        existing_flow = getting_traffic_flow(flow_id)
        
        if not existing_flow:
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
            
        update_config = request.get_json()
        new_name = update_config.get("name", flow_id)

        # Get all traffic flows to check for name uniqueness
        all_flows = get_all_traffic_flows()
        existing_names = {flow.get("name") for flow in all_flows if str(flow.get("id")) != str(flow_id)}

        if new_name in existing_names:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{new_name}' already exists."
            }), 400
        
        # Extract flow rates and exit distributions from new format
        flow_rates = {}
        exit_distributions = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in update_config.get("flows", {}):
                direction_data = update_config["flows"][direction]
                flow_rates[direction] = direction_data.get("incoming_flow", 0)
                exit_distributions[direction] = direction_data.get("exits", {})
        
        traffic_flow_input = TrafficFlowInput(
            name=new_name,
            flows=update_config.get("flows", {}),
            existing_traffic_config_names=existing_names
        )

        if not traffic_flow_input.validate():
            return jsonify({
                "success": False,
                "errors": traffic_flow_input.errors
            }), 400

        traffic_flow = TrafficFlowModel(
            name=new_name,
            flow_rates=flow_rates,
            exit_distributions=exit_distributions
        )

        if new_name != existing_flow.get("name"):
            # Need to handle name change by delete and recreate
            if not deleting_traffic_flow(flow_id):
                return jsonify({
                    "success": False,
                    "error": "Failed to delete the old traffic flow configuration"
                }), 500
                
            # Then save the new one
            if not saving_traffic_flow(traffic_flow):
                return jsonify({
                    "success": False,
                    "error": "Failed to save the updated traffic flow configuration"
                }), 500
        else:
            # If the name hasn't changed, use the updating function instead
            if not updating_traffic_flow(traffic_flow):
                return jsonify({
                    "success": False,
                    "error": "Failed to update the traffic flow configuration"
                }), 500
        
        return jsonify({
            "success": True,
            "message": "Traffic flow updated successfully",
            "newId": new_name
        })
        
    except Exception as e:
        print(f"Error in update_traffic_flow: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/traffic-flows/<flow_id>', methods=['DELETE'])
def delete_traffic_flow(flow_id):
    """Deletes a traffic flow and its associated junctions."""
    try:
        existing_flow = getting_traffic_flow(flow_id)

        if not existing_flow:
            return jsonify({"success": False, "error": "Traffic flow not found"}), 404

        if not deleting_traffic_flow(flow_id):
            return jsonify({"success": False, "error": "Failed to delete traffic flow"}), 500
        
        return jsonify({
            "success": True,
            "message": "Traffic flow and associated junctions deleted successfully"
        })
        
    except Exception as e:
        print(f"Error in delete_traffic_flow: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/traffic-flows/<flow_id>/junctions', methods=['GET'])
def get_junction_configurations(flow_id):
    """Gets junction configurations for a specific traffic flow."""
    try:
        junctions = get_functions_for_traffic_flow(flow_id)
        
        if junctions is None:
            return jsonify({"error": "Traffic flow not found"}), 404
            
        transformed_junctions = []
        for junction in junctions:
            directions = ["northbound", "southbound", "eastbound", "westbound"]
            
            # Extract lane counts and boolean options
            total_lanes = 0
            has_left_turn = False
            has_bus_cycle = False
            
            for direction in directions:
                if direction in junction:
                    dir_data = junction[direction]
                    total_lanes += dir_data.get("num_lanes", 0)
                    has_left_turn = has_left_turn or dir_data.get("enable_left_turn_lane", False)
                    has_bus_cycle = has_bus_cycle or dir_data.get("enable_bus_cycle_lane", False)
            
            average_lanes = total_lanes // len(directions) if directions else 0
            
            transformed_junctions.append({
                "id": str(junction.get("id", "")),
                "name": junction.get("name", ""),
                "lanes": average_lanes,
                "hasLeftTurnLanes": has_left_turn,
                "hasBusCycleLanes": has_bus_cycle,
                "metrics": junction.get("metrics", {})
            })
        
        return jsonify(transformed_junctions)
        
    except Exception as e:
        print(f"Error in get_junction_configurations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/junctions', methods=['POST'])
def create_junction():
    """Creates a new junction configuration."""
    try:
        junction_data = request.get_json()
        
        # Validate that the associated traffic flow exists
        traffic_flow_name = junction_data.get("traffic_flow_config")
        traffic_flow = getting_traffic_flow(traffic_flow_name)
        
        if not traffic_flow:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{traffic_flow_name}' not found"
            }), 404
        
        # Create a JunctionConfiguration object
        junction_config = JunctionConfigModel(
            name=junction_data.get("name"),
            lanes=junction_data.get("lanes", {}),
            exit_lanes=junction_data.get("exit_lanes", {}),
            has_left_turn_lane=junction_data.get("has_left_turn_lane", False),
            left_turn_lane_position=junction_data.get("left_turn_lane_position", ""),
            has_bus_cycle_lane=junction_data.get("has_bus_cycle_lane", False), 
            bus_cycle_lane_type=junction_data.get("bus_cycle_lane_type", ""), 
            bus_cycle_incoming_flow=junction_data.get("bus_cycle_incoming_flow", {}),  
            bus_cycle_outgoing_flow=junction_data.get("bus_cycle_outgoing_flow", {}),
            has_pedestrian_crossing=junction_data.get("has_pedestrian_crossing", False), 
            pedestrian_crossing_duration=junction_data.get("pedestrian_crossing_duration", 0), 
            pedestrian_requests_per_hour=junction_data.get("pedestrian_requests_per_hour", 0),
            is_priority=junction_data.get("is_priority", False), 
            traffic_light_priority=junction_data.get("traffic_light_priority", {}), 
            traffic_flow_name=traffic_flow_name
        )
        
        if not saving_junction_configuration(junction_config):
            return jsonify({
                "success": False,
                "error": "Junction configuration could not be saved"
            }), 400
        
        return jsonify({
            "success": True,
            "message": "Junction configuration created successfully"
        })
        
    except Exception as e:
        print(f"Error in create_junction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/junctions/<junction_id>', methods=['GET'])
def get_junction(junction_id):
    """Gets a specific junction configuration."""
    try:
        junction = getting_junction_configuration(junction_id)
        
        if not junction:
            return jsonify({"error": "Junction configuration not found"}), 404
        
        return jsonify(junction)
        
    except Exception as e:
        print(f"Error in get_junction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/junctions/<junction_id>', methods=['DELETE'])
def delete_junction(junction_id):
    """Deletes a junction configuration."""
    try:
        if not deleting_junction_configuration(junction_id):
            return jsonify({
                "success": False, 
                "error": "Junction configuration not found or could not be deleted"
            }), 404
            
        return jsonify({
            "success": True,
            "message": "Junction configuration deleted successfully"
        })
        
    except Exception as e:
        print(f"Error in delete_junction: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/junctions/<junction_id>/simulate', methods=['GET'])
def simulate_junction(junction_id):
    """Runs a simulation for a specific junction configuration."""
    try:
        junction = getting_junction_configuration(junction_id)
        
        if not junction:
            return jsonify({"error": "Junction configuration not found"}), 404
        
        # In a real implementation, we would run the simulation
        # For now, we'll return mock simulation results
        
        # Mock simulation results
        simulation_results = {
            "average_wait_times": {
                "northbound": 15.2,
                "southbound": 18.5,
                "eastbound": 12.8,
                "westbound": 14.3
            },
            "max_wait_times": {
                "northbound": 38,
                "southbound": 45,
                "eastbound": 32,
                "westbound": 36
            },
            "max_queue_lengths": {
                "northbound": 8,
                "southbound": 12,
                "eastbound": 6,
                "westbound": 7
            },
            "efficiency_score": 0.75,
            "sustainability_score": 0.68
        }
        
        return jsonify({
            "success": True,
            "junction_id": junction_id,
            "junction_name": junction.get("name", ""),
            "results": simulation_results
        })
        
    except Exception as e:
        print(f"Error in simulate_junction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/api/junctions/<junction_id>', methods=['PUT'])
def update_junction(junction_id):
    """Updates an existing junction configuration."""
    try:
        existing_junction = getting_junction_configuration(junction_id)
        
        if not existing_junction:
            return jsonify({
                "success": False,
                "error": "Junction configuration not found"
            }), 404
            
        junction_data = request.get_json()
        
        # Validate that the associated traffic flow exists
        traffic_flow_name = junction_data.get("traffic_flow_config")
        traffic_flow = getting_traffic_flow(traffic_flow_name)
        
        if not traffic_flow:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{traffic_flow_name}' not found"
            }), 404
        
        # Delete the old junction configuration
        if not deleting_junction_configuration(junction_id):
            return jsonify({
                "success": False,
                "error": "Failed to delete existing junction configuration"
            }), 500
        
        # Create a new junction configuration with the updated data
        junction_config = JunctionConfigModel(
            name=junction_data.get("name"),
            lanes=junction_data.get("lanes", {}),
            exit_lanes=junction_data.get("exit_lanes", {}),
            has_left_turn_lane=junction_data.get("has_left_turn_lane", False),
            left_turn_lane_position=junction_data.get("left_turn_lane_position", ""),
            has_bus_cycle_lane=junction_data.get("has_bus_cycle_lane", False), 
            bus_cycle_lane_type=junction_data.get("bus_cycle_lane_type", ""), 
            bus_cycle_incoming_flow=junction_data.get("bus_cycle_incoming_flow", {}),  
            bus_cycle_outgoing_flow=junction_data.get("bus_cycle_outgoing_flow", {}),
            has_pedestrian_crossing=junction_data.get("has_pedestrian_crossing", False), 
            pedestrian_crossing_duration=junction_data.get("pedestrian_crossing_duration", 0), 
            pedestrian_requests_per_hour=junction_data.get("pedestrian_requests_per_hour", 0),
            is_priority=junction_data.get("is_priority", False), 
            traffic_light_priority=junction_data.get("traffic_light_priority", {}), 
            traffic_flow_name=traffic_flow_name
        )
        
        if not saving_junction_configuration(junction_config):
            return jsonify({
                "success": False,
                "error": "Junction configuration could not be saved"
            }), 400
        
        return jsonify({
            "success": True,
            "message": "Junction configuration updated successfully"
        })
        
    except Exception as e:
        print(f"Error in update_junction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500