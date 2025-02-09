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
        self.exitLanes = exit_lanes
        self.hasLeftTurnLane = has_left_turn_lane
        self.leftTurnLanePosition = left_turn_lane_position
        self.hasBusCycleLane = has_bus_cycle_lane
        self.busCycleLaneType = bus_cycle_lane_type
        self.busCycleIncomingFlow = bus_cycle_incoming_flow
        self.busCycleOutgoingFlow = bus_cycle_outgoing_flow
        self.hasPedestrianCrossing = has_pedestrian_crossing
        self.pedestrianCrossingDuration = pedestrian_crossing_duration
        self.pedestrianRequestsPerHour = pedestrian_requests_per_hour
        self.isPriority = is_priority
        self.trafficLightPriority = traffic_light_priority
        self.trafficFlowName = traffic_flow_name

    #checking junction configuration is correct
    def validateConfiguration(self) -> bool:
        pass

    #allows objects to be stored as JSON
    #converting object to dict
    def to_dict(self) -> dict:
        pass

    #to recreate object from dictionary
    @staticmethod
    def from_dict(data: dict) -> 'JunctionConfiguration':
        pass
