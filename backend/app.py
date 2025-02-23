from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.storage import (
loading_traffic_flows,
saving_traffic_flows,
getting_traffic_flow,
deleting_traffic_flow,
saving_traffic_flow,
loading_junctions_configurations,
saving_junction_configurations,
getting_junction_configuration,
deleting_junction_configuration,
saving_junction_configuration)
import json
import os


from backend.models.traffic_flow import TrafficFlow
from backend.models.junction_config import JunctionConfiguration
from backend.models.traffic_flow_input import TrafficFlowInput
from backend.models.junction_config_input import JunctionConfigurationInput

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})
# CORS(app, resources={
#     r"/api/*": {
#         "origins": ["http://localhost:3000"],
#         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#         "allow_headers": ["Content-Type", "Authorization"]
#     }
# })

# Make sure the database directory exists
#BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#DATABASE_DIR = os.path.join(BASE_DIR, 'database')
#DATABASE_FILE = os.path.join(DATABASE_DIR, 'storing_configs.json')

#def init_database():
    #Initialize the database file if it doesn't exist
    #if not os.path.exists(DATABASE_DIR):
        #os.makedirs(DATABASE_DIR)
    
    #if not os.path.exists(DATABASE_FILE):
        #initial_data = {
            #"traffic_flow_configurations": {},
            #"junction_configurations": {}
        #}
        #with open(DATABASE_FILE, 'w') as f:
            #json.dump(initial_data, f, indent=3)


'''
-

def load_database():
    """Load the database file"""
    try:
        with open(DATABASE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        init_database()
        return {"traffic_flow_configurations": {}, "junction_configurations": {}}
    except json.JSONDecodeError:
        print("Error: Database file is corrupted")
        return {"traffic_flow_configurations": {}, "junction_configurations": {}}

def save_database(data):
    """Save data to the database file"""
    with open(DATABASE_FILE, 'w') as f:
        json.dump(data, f, indent=3)

'''

'''
@app.route('/api/traffic-flows', methods=['GET'])
def get_traffic_flows():
    """Gets all traffic flow configurations."""
    try:
        data
        
        # Transform the data for frontend
        traffic_flows = []
        for name, flow in data.get("traffic_flow_configurations", {}).items():
            traffic_flows.append({
                "id": name,
                "name": name,
                "northVPH": sum(flow["northbound"].values()),
                "southVPH": sum(flow["southbound"].values()),
                "eastVPH": sum(flow["eastbound"].values()),
                "westVPH": sum(flow["westbound"].values()),
                "junctionCount": sum(
                    1 for junction in data.get("junction_configurations", {}).values()
                    if junction["traffic_flow_config"] == name
                )
            })
            
        return jsonify(traffic_flows)
        
    except Exception as e:
        print(f"Error in get_traffic_flows: {str(e)}")
        return jsonify({"error": str(e)}), 500

'''

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
                "northVPH": flow.get("northbound", {}).get("incoming_flow", 0), 
                "southVPH": flow.get("southbound", {}).get("incoming_flow", 0),
                "eastVPH": flow.get("eastbound", {}).get("incoming_flow", 0),
                "westVPH": flow.get("westbound", {}).get("incoming_flow", 0),
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

'''
@app.route('/api/traffic-flows/<flow_id>', methods=['GET'])
def get_traffic_flow(flow_id):
    """Gets a specific traffic flow configuration."""
    try:
        data = load_database()
        
        # Get the specific traffic flow
        flow_config = data.get("traffic_flow_configurations", {}).get(flow_id)
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
'''

@app.route('/api/traffic-flows/<flow_id>', methods=['GET'])
def get_traffic_flow(flow_id):
    """Gets a specific traffic flow configuration."""
    try:
        #getting traffic flow config from storage
        flow_config = getting_traffic_flow(flow_id)
    
        if not flow_config:
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Transform the data for frontend
        transformed_flow = {
            "id": flow_id,
            "name": flow_id,
            "flows": {
                "northbound": {
                    "incoming": flow_config.get("northbound", {}).get("incoming_flow", 0), 
                    "exits": flow_config.get("northbound", {}).get("exits", {})
                },
                "southbound": {
                    "incoming": flow_config.get("southbound", {}).get("incoming_flow", 0),
                    "exits": flow_config.get("southbound", {}).get("exits", {})
                },
                "eastbound": {
                    "incoming": flow_config.get("eastbound", {}).get("incoming_flow", 0),
                    "exits": flow_config.get("eastbound", {}).get("exits", {})
                },
                "westbound": {
                    "incoming": flow_config.get("westbound", {}).get("incoming_flow", 0),
                    "exits": flow_config.get("westbound", {}).get("exits", {})
                }
            }
        }
        return jsonify(transformed_flow)
        
    except Exception as e:
        print(f"Error in get_traffic_flow: {str(e)}")
        return jsonify({"error": str(e)}), 500

'''
@app.route('/api/traffic-flows', methods=['POST'])
def create_traffic_flow():
    """Creates a new traffic flow configuration."""
    try:
        data = load_database()
        new_config = request.get_json()
        
        if new_config["name"] in data["traffic_flow_configurations"]:
            return jsonify({
                "success": False,
                "error": "Configuration with this name already exists"
            }), 400
        
        # Transform and store the configuration
        data["traffic_flow_configurations"][new_config["name"]] = {
            "northbound": new_config["flows"]["northbound"]["exits"],
            "southbound": new_config["flows"]["southbound"]["exits"],
            "eastbound": new_config["flows"]["eastbound"]["exits"],
            "westbound": new_config["flows"]["westbound"]["exits"]
        }
        
        save_database(data)
        
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
'''

@app.route('/api/traffic-flows', methods=['POST'])
def create_traffic_flow():
    """Creates a new traffic flow configuration."""
    try:
        new_config = request.get_json()
        #loading the existing traffic
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
        

        # Constructing a TrafficFlow object, after validation succeeds
        traffic_flow = TrafficFlow(
            name=new_config["name"],
            incoming_flows={direction: new_config["flows"].get(direction, {}).get("incoming_flow", 0)
                            for direction in ['northbound', 'southbound', 'eastbound', 'westbound']},
            exit_flows={direction: new_config["flows"].get(direction, {}).get("exits", {})
                        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']}
        )
        
        # Saving using this storage function
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

'''
@app.route('/api/traffic-flows/<flow_id>', methods=['PUT'])
def update_traffic_flow(flow_id):
    """Updates an existing traffic flow configuration."""
    try:
        data = load_database()
        update_config = request.get_json()
        
        # Check if flow exists
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
            
        new_name = update_config.get("name")
        
        if new_name and new_name != flow_id:
            # If name is being changed, we need to create a new entry and delete the old one
            data["traffic_flow_configurations"][new_name] = {
                "northbound": update_config["flows"]["northbound"]["exits"],
                "southbound": update_config["flows"]["southbound"]["exits"],
                "eastbound": update_config["flows"]["eastbound"]["exits"],
                "westbound": update_config["flows"]["westbound"]["exits"]
            }
            
            # Update any junction configurations that reference this flow
            for junction in data.get("junction_configurations", {}).values():
                if junction.get("traffic_flow_config") == flow_id:
                    junction["traffic_flow_config"] = new_name
            
            # Delete the old configuration
            del data["traffic_flow_configurations"][flow_id]
        else:
            # Just update the existing configuration
            data["traffic_flow_configurations"][flow_id] = {
                "northbound": update_config["flows"]["northbound"]["exits"],
                "southbound": update_config["flows"]["southbound"]["exits"],
                "eastbound": update_config["flows"]["eastbound"]["exits"],
                "westbound": update_config["flows"]["westbound"]["exits"]
            }
        
        # Save updated data
        save_database(data)
        
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
'''

@app.route('/api/traffic-flows/<flow_id>', methods=['PUT'])
def update_traffic_flow(flow_id):
    """Updates an existing traffic flow configuration."""
    try:
        
        existing_flow = getting_traffic_flow(flow_id)
        
        # Checking if flow exists
        if not existing_flow:
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
            
        update_config = request.get_json()
        new_name = update_config.get("name", flow_id) #keeps old name if no new name is given

        #loading all the traffic flows
        data = loading_traffic_flows()

        # Ensure new name doesn't already exist, unless it is the same as the old one
        if new_name in data["traffic_flow_configurations"] and new_name != flow_id:
            return jsonify({
                "success": False,
                "error": f"Traffic flow configuration '{new_name}' already exists."
            }), 400
        
        
        # Creating a validation object to check the new configuration
        traffic_flow_input = TrafficFlowInput(
            name=new_name if new_name else flow_id,
            flows=update_config["flows"],
            existing_traffic_config_names=set(data["traffic_flow_configurations"].keys()) - {flow_id}
        )

        if not traffic_flow_input.validate():
            return jsonify({
                "success": False,
                "errors": traffic_flow_input.errors
            }), 400


        #updated TrafficFlow object
        traffic_flow = TrafficFlow(
            name=new_name,
            flow_rates={
                direction: update_config["flows"].get(direction, {}).get("incoming", 0)
                for direction in ['northbound', 'southbound', 'eastbound', 'westbound']
            },
            exit_distributions={
                direction: update_config["flows"].get(direction, {}).get("exits", {})
                for direction in ['northbound', 'southbound', 'eastbound', 'westbound']
            }
        )

        # If name is being changed, we need to create a new entry and delete the old one
        if new_name != flow_id:
            # Updating any junction configurations that reference this flow
            for junction in data.get("junction_configurations", {}).values():
                if junction.get("traffic_flow_config") == flow_id:
                    junction["traffic_flow_config"] = new_name

            # Deleting the old configuration
            if not deleting_traffic_flow(flow_id):
                return jsonify({
                    "success": False,
                    "error": "Failed to delete the old traffic flow configuration"
                }), 500
                
        # Saving the updated traffic flow
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

'''
@app.route('/api/traffic-flows/<flow_id>', methods=['DELETE'])
def delete_traffic_flow(flow_id):
    """Deletes a traffic flow and its associated junctions."""
    try:
        data = load_database()
        
        if flow_id not in data["traffic_flow_configurations"]:
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Remove flow and associated junctions
        del data["traffic_flow_configurations"][flow_id]
        data["junction_configurations"] = {
            name: junction
            for name, junction in data["junction_configurations"].items()
            if junction["traffic_flow_config"] != flow_id
        }
        
        save_database(data)
        
        return jsonify({"message": "Traffic flow and associated junctions deleted successfully"})
        
    except Exception as e:
        print(f"Error in delete_traffic_flow: {str(e)}")
        return jsonify({"error": str(e)}), 500
'''
@app.route('/api/traffic-flows/<flow_id>', methods=['DELETE'])
def delete_traffic_flow(flow_id):
    """Deletes a traffic flow and its associated junctions."""
    try:
        #checking if the traffic flow exists
        existing_flow = getting_traffic_flow(flow_id)

        if not existing_flow:
            return jsonify({"success": False, "error": "Traffic flow not found"}), 404
        
        data = loading_traffic_flows()

        #Removing all junctions associated with the traffic flow
        updated_junctions = {
            name: junction
            for name, junction in data.get("junction_configurations", {}).items()
            if junction.get("traffic_flow_config") != flow_id
        }

        # Updating the stored junction configurations
        data["junction_configurations"] = updated_junctions

        # Delete the traffic flow using the storage function
        if not deleting_traffic_flow(flow_id):
            return jsonify({"success": False, "error": "Failed to delete traffic flow"}), 500
        
        return jsonify({
            "success": True,
            "message": "Traffic flow and associated junctions deleted successfully"
        })

        
    except Exception as e:
        print(f"Error in delete_traffic_flow: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

'''
@app.route('/api/traffic-flows/<flow_id>/junctions', methods=['GET'])
def get_junction_configurations(flow_id):
    """Gets junction configurations for a specific traffic flow."""
    try:
        data = load_database()
        
        # Check if the traffic flow exists
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Get all junctions for this flow
        junctions = []
        for junction_id, junction in data.get("junction_configurations", {}).items():
            if junction.get("traffic_flow_config") == flow_id:
                # Calculate metrics
                directions = ["northbound", "southbound", "eastbound", "westbound"]
                
                # Get lanes and features
                total_lanes = 0
                has_left_turn = False
                has_bus_cycle = False
                
                for direction in directions:
                    dir_config = junction.get(direction, {})
                    total_lanes += dir_config.get("num_lanes", 0)
                    has_left_turn = has_left_turn or dir_config.get("enable_left_turn_lane", False)
                    has_bus_cycle = has_bus_cycle or dir_config.get("enable_bus_cycle_lane", False)
                
                avg_lanes = round(total_lanes / len(directions)) if total_lanes > 0 else 0
                
                junctions.append({
                    "id": junction_id,
                    "name": junction.get("name", junction_id),
                    "lanes": avg_lanes,
                    "hasLeftTurnLanes": has_left_turn,
                    "hasBusCycleLanes": has_bus_cycle,
                    "avgWaitTime": junction.get("metrics", {}).get("avg_wait_time", 0),
                    "maxWaitTime": junction.get("metrics", {}).get("max_wait_time", 0),
                    "maxQueueLength": junction.get("metrics", {}).get("max_queue_length", 0)
                })
        
        # Return empty list if no junctions found
        return jsonify(junctions)
    
    except Exception as e:
        print(f"Error in get_junction_configurations: {str(e)}")
        return jsonify({"error": str(e)}), 500
'''

@app.route('/api/junctions/<junction_id>', methods=['DELETE'])
def delete_junction(junction_id):
    """Deletes a junction configuration."""
    try:
        # Loading existing junctions
        existing_junctions = loading_junctions_configurations()

        # Checking if junction exists
        if junction_id not in existing_junctions:
            return jsonify({"success": False, "error": "Junction not found"}), 404

        # Deleting the junction
        if not deleting_junction_configuration(junction_id):
            return jsonify({"success": False, "error": "Failed to delete junction configuration"}), 500

        return jsonify({
            "success": True,
            "message": "Junction deleted successfully"
        })

    except Exception as e:
        print(f"Error in delete_junction: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

'''
@app.route('/api/traffic-flows/<flow_id>/junctions', methods=['POST'])
def create_junction_configuration(flow_id):
    """Creates a new junction configuration for a traffic flow."""
    try:
        data = load_database()
        
        # Check if the traffic flow exists
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
        
        new_junction = request.get_json()
        junction_id = f"junction_{len(data.get('junction_configurations', {})) + 1}"
        
        # Initialize junction configurations if not exist
        if "junction_configurations" not in data:
            data["junction_configurations"] = {}
        
        # Add traffic flow reference
        new_junction["traffic_flow_config"] = flow_id
        
        # Store the junction
        data["junction_configurations"][junction_id] = new_junction
        
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction configuration created successfully",
            "junctionId": junction_id
        })
        
    except Exception as e:
        print(f"Error in create_junction_configuration: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/traffic-flows/<flow_id>/junctions/<junction_id>', methods=['PUT'])
def update_junction_configuration(flow_id, junction_id):
    """Updates an existing junction configuration."""
    try:
        data = load_database()
        
        # Validate flow and junction existence
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
            
        if junction_id not in data.get("junction_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Junction configuration not found"
            }), 404
        
        update_data = request.get_json()
        
        # Preserve the traffic flow reference
        update_data["traffic_flow_config"] = flow_id
        
        # Update the junction
        data["junction_configurations"][junction_id] = update_data
        
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction configuration updated successfully"
        })
        
    except Exception as e:
        print(f"Error in update_junction_configuration: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/traffic-flows/<flow_id>/junctions/<junction_id>', methods=['DELETE'])
def delete_junction_configuration(flow_id, junction_id):
    """Deletes a junction configuration."""
    try:
        data = load_database()
        
        # Validate flow and junction existence
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({"error": "Traffic flow not found"}), 404
            
        if junction_id not in data.get("junction_configurations", {}):
            return jsonify({"error": "Junction configuration not found"}), 404
        
        # Remove the junction
        del data["junction_configurations"][junction_id]
        
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction configuration deleted successfully"
        })
        
    except Exception as e:
        print(f"Error in delete_junction_configuration: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/junctions', methods=['GET'])
def get_all_junctions():
    """Gets all junction configurations."""
    try:
        data = load_database()
        junctions = []
        
        for junction_id, junction in data.get("junction_configurations", {}).items():
            # Calculate summary metrics for each junction
            max_lanes = max(
                junction["northbound"]["num_lanes"],
                junction["southbound"]["num_lanes"],
                junction["eastbound"]["num_lanes"],
                junction["westbound"]["num_lanes"]
            )
            
            has_left_turn = any(
                junction[direction].get("enable_left_turn_lane", False)
                for direction in ["northbound", "southbound", "eastbound", "westbound"]
            )
            
            has_bus_cycle = any(
                junction[direction].get("enable_bus_cycle_lane", False)
                for direction in ["northbound", "southbound", "eastbound", "westbound"]
            )
            
            junctions.append({
                "id": junction_id,
                "name": junction.get("name", junction_id),
                "traffic_flow_config": junction["traffic_flow_config"],
                "max_lanes": max_lanes,
                "has_left_turn": has_left_turn,
                "has_bus_cycle": has_bus_cycle,
                "northbound": junction["northbound"],
                "southbound": junction["southbound"],
                "eastbound": junction["eastbound"],
                "westbound": junction["westbound"]
            })
            
        return jsonify(junctions)
        
    except Exception as e:
        print(f"Error in get_all_junctions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/junctions/<junction_id>', methods=['GET'])
def get_junction(junction_id):
    """Gets a specific junction configuration."""
    try:
        data = load_database()
        
        # Get the specific junction
        junction = data.get("junction_configurations", {}).get(junction_id)
        if not junction:
            return jsonify({"error": "Junction not found"}), 404
            
        return jsonify({
            "id": junction_id,
            "name": junction.get("name", junction_id),
            "traffic_flow_config": junction["traffic_flow_config"],
            "northbound": junction["northbound"],
            "southbound": junction["southbound"],
            "eastbound": junction["eastbound"],
            "westbound": junction["westbound"]
        })
        
    except Exception as e:
        print(f"Error in get_junction: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/junctions', methods=['POST'])
def create_junction():
    """Creates a new junction configuration."""
    try:
        data = load_database()
        new_junction = request.get_json()
        
        # Validate required fields
        required_fields = ["name", "traffic_flow_config", "northbound", "southbound", "eastbound", "westbound"]
        for field in required_fields:
            if field not in new_junction:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        # Check if traffic flow exists
        if new_junction["traffic_flow_config"] not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Referenced traffic flow configuration does not exist"
            }), 400
        
        # Generate new junction ID
        junction_id = f"junction_{len(data.get('junction_configurations', {})) + 1}"
        
        # Add the junction
        if "junction_configurations" not in data:
            data["junction_configurations"] = {}
            
        data["junction_configurations"][junction_id] = {
            "name": new_junction["name"],
            "traffic_flow_config": new_junction["traffic_flow_config"],
            "northbound": new_junction["northbound"],
            "southbound": new_junction["southbound"],
            "eastbound": new_junction["eastbound"],
            "westbound": new_junction["westbound"]
        }
        
        # Save the updated data
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction created successfully",
            "junction_id": junction_id
        })
        
    except Exception as e:
        print(f"Error in create_junction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/junctions/<junction_id>', methods=['PUT'])
def update_junction(junction_id):
    """Updates an existing junction configuration."""
    try:
        data = load_database()
        update_config = request.get_json()
        
        # Check if junction exists
        if junction_id not in data.get("junction_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Junction not found"
            }), 404
        
        # Validate required fields
        required_fields = ["name", "traffic_flow_config", "northbound", "southbound", "eastbound", "westbound"]
        for field in required_fields:
            if field not in update_config:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        # Check if referenced traffic flow exists
        if update_config["traffic_flow_config"] not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Referenced traffic flow configuration does not exist"
            }), 400
        
        # Update the junction
        data["junction_configurations"][junction_id] = {
            "name": update_config["name"],
            "traffic_flow_config": update_config["traffic_flow_config"],
            "northbound": update_config["northbound"],
            "southbound": update_config["southbound"],
            "eastbound": update_config["eastbound"],
            "westbound": update_config["westbound"]
        }
        
        # Save the updated data
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction updated successfully"
        })
        
    except Exception as e:
        print(f"Error in update_junction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/junctions/<junction_id>', methods=['DELETE'])
def delete_junction(junction_id):
    """Deletes a junction configuration."""
    try:
        data = load_database()
        
        # Check if junction exists
        if junction_id not in data.get("junction_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Junction not found"
            }), 404
        
        # Delete the junction
        del data["junction_configurations"][junction_id]
        
        # Save the updated data
        save_database(data)
        
        return jsonify({
            "success": True,
            "message": "Junction deleted successfully"
        })
        
    except Exception as e:
        print(f"Error in delete_junction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/junctions/traffic-flow/<flow_id>', methods=['GET'])
def get_junctions_for_flow(flow_id):
    """Gets all junctions associated with a specific traffic flow."""
    try:
        data = load_database()
        
        # Check if traffic flow exists
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({
                "success": False,
                "error": "Traffic flow not found"
            }), 404
        
        # Get all junctions for this flow
        junctions = []
        for junction_id, junction in data.get("junction_configurations", {}).items():
            if junction["traffic_flow_config"] == flow_id:
                junctions.append({
                    "id": junction_id,
                    "name": junction.get("name", junction_id),
                    "northbound": junction["northbound"],
                    "southbound": junction["southbound"],
                    "eastbound": junction["eastbound"],
                    "westbound": junction["westbound"]
                })
        
        return jsonify(junctions)
        
    except Exception as e:
        print(f"Error in get_junctions_for_flow: {str(e)}")
        return jsonify({"error": str(e)}), 500

'''
if __name__ == '__main__':
    #init_database()  
    app.run(debug=True)

