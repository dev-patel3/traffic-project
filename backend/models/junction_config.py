class JunctionConfiguration:
    def __init__(self, name: str, 
                 lanes: dict[str, int] = None, 
                 exit_lanes: dict[str, int] = None, 
                 has_left_turn_lane: bool = False, 
                 left_turn_lane_position: str = "",
                 has_bus_cycle_lane: bool = False, 
                 bus_cycle_lane_type: str = "", 
                 bus_cycle_incoming_flow: dict[str, int] = None,  
                 bus_cycle_outgoing_flow: dict[str, dict[str, int]] = None,
                 has_pedestrian_crossing: bool = False, 
                 pedestrian_crossing_duration: int = 0, 
                 pedestrian_requests_per_hour: int = 0,
                 is_priority: bool = False, 
                 traffic_light_priority: dict[str, int] = None, 
                 traffic_flow_name: str = ""):
        
        self.name = name
        self.lanes = lanes or {}
        self.exit_lanes = exit_lanes or {}
        self.has_left_turn_lane = has_left_turn_lane
        self.left_turn_lane_position = left_turn_lane_position
        self.has_bus_cycle_lane = has_bus_cycle_lane
        self.bus_cycle_lane_type = bus_cycle_lane_type
        self.bus_cycle_incoming_flow = bus_cycle_incoming_flow or {}
        self.bus_cycle_outgoing_flow = bus_cycle_outgoing_flow or {}
        self.has_pedestrian_crossing = has_pedestrian_crossing
        self.pedestrian_crossing_duration = pedestrian_crossing_duration
        self.pedestrian_requests_per_hour = pedestrian_requests_per_hour
        self.is_priority = is_priority
        self.traffic_light_priority = traffic_light_priority or {}
        self.traffic_flow_name = traffic_flow_name

    # Allows objects to be stored in database
    def to_dict(self) -> dict:
        """Convert the JunctionConfiguration object to a dictionary."""
        return {
            "name": self.name,
            "northbound": {
                "num_lanes": self.lanes.get("northbound", 1),
                "enable_left_turn_lane": self.has_left_turn_lane,
                "enable_bus_cycle_lane": self.has_bus_cycle_lane,
                "bus_cycle_lane_type": self.bus_cycle_lane_type,
                "flow_rate": self.bus_cycle_incoming_flow.get("northbound", 0),
                "pedestrian_crossing_enabled": self.has_pedestrian_crossing,
                "pedestrian_crossing_duration": self.pedestrian_crossing_duration,
                "pedestrian_crossing_requests_per_hour": self.pedestrian_requests_per_hour,
                "traffic_priority": self.traffic_light_priority.get("northbound", 0)
            },
            "southbound": {
                "num_lanes": self.lanes.get("southbound", 1),
                "enable_left_turn_lane": self.has_left_turn_lane,
                "enable_bus_cycle_lane": self.has_bus_cycle_lane,
                "bus_cycle_lane_type": self.bus_cycle_lane_type,
                "flow_rate": self.bus_cycle_incoming_flow.get("southbound", 0),
                "pedestrian_crossing_enabled": self.has_pedestrian_crossing,
                "pedestrian_crossing_duration": self.pedestrian_crossing_duration,
                "pedestrian_crossing_requests_per_hour": self.pedestrian_requests_per_hour,
                "traffic_priority": self.traffic_light_priority.get("southbound", 0)
            },
            "eastbound": {
                "num_lanes": self.lanes.get("eastbound", 1),
                "enable_left_turn_lane": self.has_left_turn_lane,
                "enable_bus_cycle_lane": self.has_bus_cycle_lane,
                "bus_cycle_lane_type": self.bus_cycle_lane_type,
                "flow_rate": self.bus_cycle_incoming_flow.get("eastbound", 0),
                "pedestrian_crossing_enabled": self.has_pedestrian_crossing,
                "pedestrian_crossing_duration": self.pedestrian_crossing_duration,
                "pedestrian_crossing_requests_per_hour": self.pedestrian_requests_per_hour,
                "traffic_priority": self.traffic_light_priority.get("eastbound", 0)
            },
            "westbound": {
                "num_lanes": self.lanes.get("westbound", 1),
                "enable_left_turn_lane": self.has_left_turn_lane,
                "enable_bus_cycle_lane": self.has_bus_cycle_lane,
                "bus_cycle_lane_type": self.bus_cycle_lane_type,
                "flow_rate": self.bus_cycle_incoming_flow.get("westbound", 0),
                "pedestrian_crossing_enabled": self.has_pedestrian_crossing,
                "pedestrian_crossing_duration": self.pedestrian_crossing_duration,
                "pedestrian_crossing_requests_per_hour": self.pedestrian_requests_per_hour,
                "traffic_priority": self.traffic_light_priority.get("westbound", 0)
            },
            "traffic_flow_config": self.traffic_flow_name
        }

    # To recreate object from dictionary
    @staticmethod
    def from_dict(data: dict) -> 'JunctionConfiguration':
        """Reconstructs a JunctionConfiguration object from a dictionary."""
        lanes = {}
        traffic_light_priority = {}
        bus_cycle_incoming_flow = {}

        # Extract direction-specific data
        for direction in ["northbound", "southbound", "eastbound", "westbound"]:
            if direction in data:
                dir_data = data[direction]
                lanes[direction] = dir_data.get("num_lanes", 1)
                traffic_light_priority[direction] = dir_data.get("traffic_priority", 0)
                bus_cycle_incoming_flow[direction] = dir_data.get("flow_rate", 0)

        # Use one direction as reference for shared attributes
        reference_direction = data.get("northbound", {})
        
        return JunctionConfiguration(
            name=data.get("name", ""),
            lanes=lanes,
            exit_lanes={},  # Not directly used in frontend currently
            has_left_turn_lane=reference_direction.get("enable_left_turn_lane", False),
            left_turn_lane_position="",  # Not directly used in frontend currently
            has_bus_cycle_lane=reference_direction.get("enable_bus_cycle_lane", False),
            bus_cycle_lane_type=reference_direction.get("bus_cycle_lane_type", ""),
            bus_cycle_incoming_flow=bus_cycle_incoming_flow,
            bus_cycle_outgoing_flow={},  # Not directly used in frontend currently
            has_pedestrian_crossing=reference_direction.get("pedestrian_crossing_enabled", False),
            pedestrian_crossing_duration=reference_direction.get("pedestrian_crossing_duration", 0),
            pedestrian_requests_per_hour=reference_direction.get("pedestrian_crossing_requests_per_hour", 0),
            is_priority=any(p > 0 for p in traffic_light_priority.values()),
            traffic_light_priority=traffic_light_priority,
            traffic_flow_name=data.get("traffic_flow_config", "")
        )