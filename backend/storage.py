import json
import os
from typing import Optional
from backend.models.traffic_flow import TrafficFlow
from backend.models.junction_config import JunctionConfiguration

JSON_FILE_PATH = "backend/database/storing_configs.json"

#returning a list of traffic flow dicts

def loading_traffic_flows() -> dict:

    if not os.path.exists(JSON_FILE_PATH):
        return {"traffic_flow_configurations": {}, "junction_configurations": {}}
    with open(JSON_FILE_PATH, "r") as file:
            return json.load(file) # JSON loaded as a list

#saving the whole JSON structure, traffic config and junction config
def saving_traffic_flows(data: dict) -> bool:
    try:
        with open(JSON_FILE_PATH, "w") as file:
            json.dump(data, file, indent = 3)
        return True
    except Exception as e:
        print(f"Traffic flow could not be saved: {e}")
        return False

#getting a traffic flow configuration by name, returns None if it is not found
def getting_traffic_flow(name: str) -> Optional[dict]:

        traffic_config_data = loading_traffic_flows() #loading the traffic flow data
        return traffic_config_data["traffic_flow_configurations"].get(name, None)

def deleting_traffic_flow(name: str) -> bool:

    traffic_config_data = loading_traffic_flows()

    if name not in traffic_config_data["traffic_flow_configurations"]:
        print(f"Error, Traffic Flow '{name}' does not exist")
        return False

    del traffic_config_data["traffic_flow_configurations"][name]

    #removing all jucntion config that are linked to the traffic
    #flow being deleted
    new_junction_config = {} #creating an empty dictionary
    for key, junction_config in traffic_config_data["junction_configurations"].items():
        if junction_config["traffic_flow_config"] != name:
            new_junction_config[key] = junction_config

    #replacing the old junction config with the new data
    traffic_config_data["junction_configurations"] = new_junction_config

    #saving the updated JSON data
    return saving_traffic_flows(traffic_config_data)

#saving a new traffic flow config to the JSON file
#making sure no duplicate names exist

def saving_traffic_flow(flow: TrafficFlow) -> bool:

    traffic_flow_data = loading_traffic_flows()

    if "traffic_flow_configurations" not in traffic_flow_data:
        traffic_flow_data["traffic_flow_configurations"] = {}

    if flow.name in traffic_flow_data["traffic_flow_configurations"]:
        print(f"Error, Traffic flow configuration '{flow.name}' already exists")
        return False

    #saving the new traffic flow with correct structure
    #converting flow into a dictionary to be stored
    traffic_flow_data["traffic_flow_configurations"][flow.name] = flow.to_dict()
    return saving_traffic_flows(traffic_flow_data) # updated list saved to JSON


# returning a list of JUNCTION CONFIGURATION dicts

def loading_junctions_configurations() -> dict:

    if not os.path.exists(JSON_FILE_PATH):
        return {} #empty dictionary if file does not exist

    try:
        with open(JSON_FILE_PATH, "r") as file:
            return json.load(file).get("junction_configurations", {}) # SON loaded as a list
    except Exception:
        return {} 

# saving the whole list of JUNCTION configurations to the JSON file
def saving_junction_configurations(data: list) -> bool:
    try:
        with open(JSON_FILE_PATH, "r+") as file:
            json_data = json.load(file)
            #json_data["junction_configurations"] = data

            if "junction_configurations" not in json_data:
                json_data["junction_configurations"] = {}

            #converting list to dictionary to use update method
            new_junction_data = {config["name"]: config for config in data}
            
            json_data["junction_configurations"].update(new_junction_data)
            file.seek(0)    # reset file pointer
            json.dump(json_data, file, indent = 3)
            file.truncate()
        return True
    except Exception as e:
        print(f"Traffic flow could not be saved: {e}")
        return False
    
# getting a JUNCTION configuration by name, returns None if it is not found
def getting_junction_configuration(name: str) -> Optional[dict]:

        data = loading_junctions_configurations() # loading the junction configuration data
        #for config in data:
            #if config["name"] == name:
             #   return config
        #return None
        return data.get(name, None) #avoids looping

# deleting a junction configuration by name
def deleting_junction_configuration(name: str) -> bool:

    data = loading_junctions_configurations()

    #new_data = [config for config in data if config["name"] != name]

    # if no chnages, junction configuration was not found
    if name not in data:
        print(f"Error, Junction Configuration '{name}' not found")
        return False
    
    #delete the junction configuration
    del data[name]
    return saving_junction_configurations(list(data.values())) # saving updated data, without deleted entry.

# saving a new JUNCTION congfig to the JSON file
# making sure no duplicate names exist & it belongs to a valid traffic flow configuration

def saving_junction_configuration(junction: JunctionConfiguration) -> bool:

    data = loading_junctions_configurations()

    # check for duplicate junction name
    #for config in data:
    if junction.name in data:
        print(f"Error, Junction configuration '{junction.name}' exists already")
        return False
    
    # validate junction is linked to an existing traffic flow
    if getting_traffic_flow(junction.traffic_flow_name) is None:
        print(f"Error, Traffic Flow '{junction.traffic_flow_name}' does not exist. Cannot add junction configuration.")
        return False
        
    data[junction.name] = junction.to_dict()
    #data.append(junction.to_dict())

    return saving_junction_configurations(list(data.values())) # updated list saved to JSON

# function that returns all the saved traffic flows to frontend when called
def get_all_traffic_flows() -> list:
    data = loading_traffic_flows()
    #returning only traffic flows from key
    return list(data["traffic_flow_configurations"].values())

# function that takes a unique traffic flow name, and returns all the junction configurations for that traffic flow
def get_functions_for_traffic_flow(flow_name: str) -> list:
    junctions = loading_junctions_configurations()
    return [junction for junction in junctions.values() if junction["traffic_flow_config"] == flow_name]




