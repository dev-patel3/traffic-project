import json
import os
from backend.models.traffic_flow import TrafficFlow
from backend.models.junction_config import JunctionConfiguation

JSON_FILE_PATH = "backend/database/storing_configs.json"

# returning a list of TRAFFIC FLOW dicts

def loading_traffic_flows() -> list:

    if not os.path.exists(JSON_FILE_PATH):
        return [] # empty list returned if file does not exist

    with open(JSON_FILE_PATH, "r") as file:
        return json.load(file).get("traffic_flow_configurations",[]) # JSON loaded as a list

#saving the whole list of traffic configurations to the JSON file
def saving_traffic_flows(data: list) -> bool:
    try:
        with open(JSON_FILE_PATH, "r+") as file:
            json_data = json.load(file)
            json_data["traffic_flow_configurations"] = data
            file.seek(0)
            json.dump(json_data, file, indent = 3)
            file.truncate()
        return True
    except Exception as e:
        print(f"Traffic flow could not be saved: {e}")
        return False

#getting a traffic flow configuration by name, returns None if it is not found
def getting_traffic_flow(name: str) -> dict | None:

        data = loading_traffic_flows() #loading the traffic flow data
        for config in data:
            if config["name"] == name:
                return config
        return None

# deleting a traffic flow configuration by name
def deleting_traffic_flow(name: str) -> bool:

    data = loading_traffic_flows()

    new_data = [config for config in data if config["name"] != name]

    #if no chnages, traffic flow was not found
    if len(new_data) == len(data):
        print(f"Error, Traffic Flow '{name}' not found")
        return False

    return saving_traffic_flows(new_data) # saving updated data, without deleted entry.

#saving a new traffic flow conif to the JSON file
#making sure no duplicate names exist

def saving_traffic_flow(flow: TrafficFlow) -> bool:

    data = loading_traffic_flows()

    for config in data:
        if config["name"] ==flow.name:
            print(f"Error, Traffic flow configuration '{flow.name}' exists already")
            return False
        
    data.append(flow.to_dict())

    return saving_traffic_flows(data) # updated list saved to JSON

# returning a list of JUNCTION CONFIGURATION dicts

def loading_junctions_configurations() -> list:

    if not os.path.exists(JSON_FILE_PATH):
        return [] # empty list returned if file does not exist

    with open(JSON_FILE_PATH, "r") as file:
            return json.load(file).get("junction_configurations", []) # JSON loaded as a list
    
# saving the whole list of JUNCTION configurations to the JSON file
def saving_junction_configurations(data: list) -> bool:
    try:
        with open(JSON_FILE_PATH, "r+") as file:
            json_data = json.load(file)
            json_data["junction_configurations"] = data
            file.seek(0)    # reset file pointer
            json.dump(json_data, file, indent = 3)
            file.truncate()
        return True
    except Exception as e:
        print(f"Traffic flow could not be saved: {e}")
        return False
    
# getting a JUNCTION configuration by name, returns None if it is not found
def getting_junction_configuration(name: str) -> dict | None:

        data = loading_junctions_configurations() # loading the junction configuration data
        for config in data:
            if config["name"] == name:
                return config
        return None

# deleting a junction configuration by name
def deleting_junction_configuration(name: str) -> bool:

    data = loading_junctions_configurations()

    new_data = [config for config in data if config["name"] != name]

    # if no chnages, junction configuration was not found
    if len(new_data) == len(data):
        print(f"Error, Junction Configuration '{name}' not found")
        return False

    return saving_junction_configurations(new_data) # saving updated data, without deleted entry.

# saving a new JUNCTION congfig to the JSON file
# making sure no duplicate names exist & it belongs to a valid traffic flow configuration

def saving_junction_configuration(junction: JunctionConfiguation) -> bool:

    data = loading_junctions_configurations()

    # check for duplicate junction name
    for config in data:
        if config["name"] == junction.name:
            print(f"Error, Junction configuration '{junction.name}' exists already")
            return False
    
    # validate junction is linked to an existing traffic flow
    if getting_traffic_flow(junction.traffic_flow_name) is None:
        print(f"Error, Traffic Flow '{junction.traffic_flow_name}' does not exist. Cannot add junction configuration.")
        return False
        
    data.append(junction.to_dict())

    return saving_junction_configurations(data) # updated list saved to JSON

# function that returns all the saved traffic flows to frontend when called
def get_all_traffic_flows() -> list:
    return loading_traffic_flows

# function that takes a unique traffic flow name, and returns all the junction configurations for that traffic flow
def get_functions_for_traffic_flow(flow_name: str) -> list:
    junctions = loading_junctions_configurations()
    return [junction for junction in junctions if junction["traffic_flow_config" == flow_name]]




