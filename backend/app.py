from flask import Flask, request, jsonify
from flask_cors import CORS

from .storage import (
    loading_traffic_flows,
    saving_traffic_flows,
    getting_traffic_flow,
    deleting_traffic_flow,
    saving_traffic_flow,
    updating_traffic_flow,
    loading_junctions_configurations,
    saving_junction_configurations,
    getting_junction_configuration,
    deleting_junction_configuration,
    saving_junction_configuration,
    get_all_traffic_flows,
    get_functions_for_traffic_flow
)

from .models.traffic_flow import TrafficFlow
from .models.junction_config import JunctionConfiguration
from .models.traffic_flow_input import TrafficFlowInput
from .models.junction_config_input import JunctionConfigurationInput

app = Flask(__name__)
CORS(app, resources={
     r"/api/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"]
     }
})

@app.route('/api/traffic-flows', methods=['GET'])
def get_traffic_flows():
    """Gets all traffic flow configurations."""
    try:
        data = loading_traffic_flows()
        traffic_configurations = data.get("traffic_flow_configurations", {})
        junction_configurations = data.get("junction_configurations", {})

        # Transform the data for frontend
        traffic_flows = []
        
        for name, flow in traffic_configurations.items():
            # Handle both old and new formats
            if isinstance(flow, dict) and "flows" in flow:
                # New format
                flows = flow["flows"]
                northVPH = (flows.get("northbound", {}).get("incoming_flow", 0) or 
                         sum(flows.get("northbound", {}).get("exits", {}).values(), 0))
                southVPH = (flows.get("southbound", {}).get("incoming_flow", 0) or 
                         sum(flows.get("southbound", {}).get("exits", {}).values(), 0))
                eastVPH = (flows.get("eastbound", {}).get("incoming_flow", 0) or 
                        sum(flows.get("eastbound", {}).get("exits", {}).values(), 0))
                westVPH = (flows.get("westbound", {}).get("incoming_flow", 0) or 
                        sum(flows.get("westbound", {}).get("exits", {}).values(), 0))
            else:
                # Old format
                northVPH = sum(flow.get("northbound", {}).values(), 0)
                southVPH = sum(flow.get("southbound", {}).values(), 0)
                eastVPH = sum(flow.get("eastbound", {}).values(), 0)
                westVPH = sum(flow.get("westbound", {}).values(), 0)
            
            traffic_flows.append({
                "id": name,
                "name": flow.get("name", name),
                "northVPH": northVPH,
                "southVPH": southVPH,
                "eastVPH": eastVPH,
                "westVPH": westVPH,
                "junctionCount": sum(
                    1 for junction in junction_configurations.values()
                    if junction.get("traffic_flow_config") == name
                )
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
            
        # Transform the data for frontend, handling both old and new formats
        if isinstance(flow_config, dict) and "flows" in flow_config:
            # New format - keep as is
            transformed_flow = {
                "id": flow_id,
                "name": flow_config.get("name", flow_id),
                "flows": flow_config["flows"]
            }
        else:
            # Old format - convert to new format
            transformed_flow = {
                "id": flow_id,
                "name": flow_id,
                "flows": {
                    "northbound": {
                        "incoming_flow": sum(flow_config.get("northbound", {}).values(), 0),
                        "exits": flow_config.get("northbound", {})
                    },
                    "southbound": {
                        "incoming_flow": sum(flow_config.get("southbound", {}).values(), 0),
                        "exits": flow_config.get("southbound", {})
                    },
                    "eastbound": {
                        "incoming_flow": sum(flow_config.get("eastbound", {}).values(), 0),
                        "exits": flow_config.get("eastbound", {})
                    },
                    "westbound": {
                        "incoming_flow": sum(flow_config.get("westbound", {}).values(), 0),
                        "exits": flow_config.get("westbound", {})
                    }
                }
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
        data = loading_traffic_flows()
        existing_names = set(data["traffic_flow_configurations"].keys())

        # Extract flow rates from new format
        flow_rates = {}
        exit_distributions = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in new_config["flows"]:
                direction_data = new_config["flows"][direction]
                flow_rates[direction] = direction_data.get("incoming_flow", 0)
                exit_distributions[direction] = direction_data.get("exits", {})

        # Creates and validates TrafficFlowInput
        traffic_flow_input = TrafficFlowInput(
            name=new_config["name"],
            flows=new_config["flows"],
            existing_traffic_config_names=existing_names
        )

        if not traffic_flow_input.validate():
            return jsonify({
                "success": False,
                "error": traffic_flow_input.errors
            }), 400

        # Constructing a TrafficFlow object after validation
        traffic_flow = TrafficFlow(
            name=new_config["name"],
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

        data = loading_traffic_flows()

        if new_name != flow_id and new_name in data["traffic_flow_configurations"]:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{new_name}' already exists."
            }), 400
        
        # Extract flow rates and exit distributions from new format
        flow_rates = {}
        exit_distributions = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in update_config["flows"]:
                direction_data = update_config["flows"][direction]
                flow_rates[direction] = direction_data.get("incoming_flow", 0)
                exit_distributions[direction] = direction_data.get("exits", {})
        
        traffic_flow_input = TrafficFlowInput(
            name=new_name,
            flows=update_config["flows"],
            existing_traffic_config_names=set(data["traffic_flow_configurations"].keys()) - {flow_id}
        )

        if not traffic_flow_input.validate():
            return jsonify({
                "success": False,
                "errors": traffic_flow_input.errors
            }), 400

        traffic_flow = TrafficFlow(
            name=new_name,
            flow_rates=flow_rates,
            exit_distributions=exit_distributions
        )

        if new_name != flow_id:
            # Update references to this traffic flow in junction configurations
            for junction in data.get("junction_configurations", {}).values():
                if junction.get("traffic_flow_config") == flow_id:
                    junction["traffic_flow_config"] = new_name

            # Delete the old traffic flow first
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
            "newId": new_name if new_name else flow_id
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
            
            total_lanes = sum(junction.get(direction, {}).get("num_lanes", 0) for direction in directions)
            has_left_turn = any(junction.get(direction, {}).get("enable_left_turn_lane", False) for direction in directions)
            has_bus_cycle = any(junction.get(direction, {}).get("enable_bus_cycle_lane", False) for direction in directions)
            
            transformed_junctions.append({
                "id": junction["name"],
                "name": junction["name"],
                "lanes": total_lanes // len(directions),
                "hasLeftTurnLanes": has_left_turn,
                "hasBusCycleLanes": has_bus_cycle,
                "metrics": junction.get("metrics", {})
            })
        
        return jsonify(transformed_junctions)
        
    except Exception as e:
        print(f"Error in get_junction_configurations: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)