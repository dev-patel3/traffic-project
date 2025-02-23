from junction_config_input import JunctionConfigurationInput

class JunctionConfiguration:
    def __init__(self, name: str, 
                 lanes: dict[str, int], 
                 exit_lanes: dict[str, int], 
                 has_left_turn_lane: bool, 
                 left_turn_lane_position: str,
                 has_bus_cycle_lane: bool, 
                 bus_cycle_lane_type: str, 
                 bus_cycle_incoming_flow: dict[str, int],  
                 bus_cycle_outgoing_flow: dict[str, dict[str, int]],
                 has_pedestrian_crossing: bool, 
                 pedestrian_crossing_duration: int, 
                 pedestrian_requests_per_hour: int,
                 is_priority: bool, 
                 traffic_light_priority: dict[str, int], 
                 traffic_flow_name: str):
        
        self.name = name
        self.lanes = lanes
        self.exit_lanes = exit_lanes
        self.has_left_turn_lane = has_left_turn_lane
        self.left_turn_lane_position = left_turn_lane_position
        self.has_bus_cycle_lane = has_bus_cycle_lane
        self.bus_cycle_lane_type = bus_cycle_lane_type
        self.bus_cycle_incoming_flow = bus_cycle_incoming_flow
        self.bus_cycle_outgoing_flow = bus_cycle_outgoing_flow
        self.has_pedestrian_crossing = has_pedestrian_crossing
        self.pedestrian_crossing_duration = pedestrian_crossing_duration
        self.pedestrian_requests_per_hour = pedestrian_requests_per_hour
        self.is_priority = is_priority
        self.traffic_light_priority = traffic_light_priority
        self.traffic_flow_name = traffic_flow_name

    #checking junction configuration is correct
    def validateConfiguration(self) -> bool:
        """
        Validates this junction configuration by calling the validation class ,JunctionConfigurationInput.
        """
        validator = JunctionConfigurationInput(
            name=self.name,
            junctionConfig=self,
            existing_junction_config_names=set(),  # creates empty set, will later be replaced with actual data
            existing_traffic_config_names=set()   
        )

        return validator.validate() # calls the validation method and returns the result


    #allows objects to be stored as JSON
    #converting object to dict
    def to_dict(self) -> dict:
        """Convert the JunctionConfiguration object to a dictionary."""
        return {
            "name": self.name,
            "lanes": self.lanes,
            "exit_lanes": self.exit_lanes,
            "has_left_turn_lane": self.has_left_turn_lane,
            "left_turn_lane_position": self.left_turn_lane_position,
            "has_bus_cycle_lane": self.has_bus_cycle_lane,
            "bus_cycle_lane_type": self.bus_cycle_lane_type,
            "bus_cycle_incoming_flow": self.bus_cycle_incoming_flow,
            "bus_cycle_outgoing_flow": self.bus_cycle_outgoing_flow,
            "has_pedestrian_crossing": self.has_pedestrian_crossing,
            "pedestrian_crossing_duration": self.pedestrian_crossing_duration,
            "pedestrian_requests_per_hour": self.pedestrian_requests_per_hour,
            "is_priority": self.is_priority,
            "traffic_light_priority": self.traffic_light_priority,
            "traffic_flow_name": self.traffic_flow_name
        }

    #to recreate object from dictionary
    @staticmethod
    def from_dict(data: dict) -> 'JunctionConfiguration':
        """Reconstructs a JunctionConfiguration object from a dictionary."""
        return JunctionConfiguration(
            name=data["name"],
            lanes=data["lanes"],
            exit_lanes=data["exit_lanes"],
            has_left_turn_lane=data["has_left_turn_lane"],
            left_turn_lane_position=data["left_turn_lane_position"],
            has_bus_cycle_lane=data["has_bus_cycle_lane"],
            bus_cycle_lane_type=data["bus_cycle_lane_type"],
            bus_cycle_incoming_flow=data["bus_cycle_incoming_flow"],
            bus_cycle_outgoing_flow=data["bus_cycle_outgoing_flow"],
            has_pedestrian_crossing=data["has_pedestrian_crossing"],
            pedestrian_crossing_duration=data["pedestrian_crossing_duration"],
            pedestrian_requests_per_hour=data["pedestrian_requests_per_hour"],
            is_priority=data["is_priority"],
            traffic_light_priority=data["traffic_light_priority"],
            traffic_flow_name=data["traffic_flow_name"]
        )
