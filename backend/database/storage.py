import json
import os
from backend.models.traffic_flow import TrafficFlow

JSON_FILE_PATH = "backend/database/storing_configs.json"

#returning a list of traffic flow dicts

def loading_traffic_flows() -> list:

    if not os.path.exists(JSON_FILE_PATH):
        return [] # empty list returned if file does not exist

    with open(JSON_FILE_PATH, "r") as file:
            return json.load(file) # JSON loaded as a list

#saving the whole list of traffic configurations to the JSON file
def saving_traffic_flows(data: list) -> bool:
    try:
        with open(JSON_FILE_PATH, "w") as file:
            json.dump(data, file, indent = 3)
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









