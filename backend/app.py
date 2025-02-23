from flask import Flask, request, jsonify
from flask_cors import CORS

from .storage import (
    loading_traffic_flows,
    saving_traffic_flows,
    getting_traffic_flow,
    deleting_traffic_flow,
    saving_traffic_flow,
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
        traffic_flows = [
            {
                "id": name,
                "name": name,
                "northVPH": sum(flow["northbound"].values()),
                "southVPH": sum(flow["southbound"].values()),
                "eastVPH": sum(flow["eastbound"].values()),
                "westVPH": sum(flow["westbound"].values()),
                "junctionCount": sum(
                    1 for junction in junction_configurations.values()
                    if junction.get("traffic_flow_config") == name
                )
            }
            for name, flow in traffic_configurations.items()
        ]
            
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
            
        # Transform the data for frontend
        transformed_flow = {
            "id": flow_id,
            "name": flow_id,
            "flows": {
                "northbound": {
                    "exits": flow_config["northbound"]
                },
                "southbound": {
                    "exits": flow_config["southbound"]
                },
                "eastbound": {
                    "exits": flow_config["eastbound"]
                },
                "westbound": {
                    "exits": flow_config["westbound"]
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
            flow_rates={direction: sum(new_config["flows"][direction]["exits"].values())
                       for direction in ['northbound', 'southbound', 'eastbound', 'westbound']},
            exit_distributions={direction: new_config["flows"][direction]["exits"]
                              for direction in ['northbound', 'southbound', 'eastbound', 'westbound']}
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

        if new_name in data["traffic_flow_configurations"] and new_name != flow_id:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{new_name}' already exists."
            }), 400
        
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
            flow_rates={direction: sum(update_config["flows"][direction]["exits"].values())
                       for direction in ['northbound', 'southbound', 'eastbound', 'westbound']},
            exit_distributions={direction: update_config["flows"][direction]["exits"]
                              for direction in ['northbound', 'southbound', 'eastbound', 'westbound']}
        )

        if new_name != flow_id:
            for junction in data.get("junction_configurations", {}).values():
                if junction.get("traffic_flow_config") == flow_id:
                    junction["traffic_flow_config"] = new_name

            if not deleting_traffic_flow(flow_id):
                return jsonify({
                    "success": False,
                    "error": "Failed to delete the old traffic flow configuration"
                }), 500
                
        if not saving_traffic_flow(traffic_flow):
            return jsonify({
                "success": False,
                "error": "Failed to save the updated traffic flow configuration"
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