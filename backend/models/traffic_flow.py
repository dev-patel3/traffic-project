class TrafficFlow:
    def __init__(self, name: str, flow_rates: dict[str, int], exit_distributions: dict[str, dict[str, int]]):
        
        self.name = name  # Name of the traffic flow
        self.incoming_flows = flow_rates  # Stores the incoming flow for each direction
        self.exit_flows = exit_distributions  # Stores the exit flows

    def to_dict(self) -> dict:
        '''
        Converting the TrafficFlow object into a dictionary for JSON storage.
        Updated to match the new format.
        '''
        flows = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            flows[direction] = {
                "incoming_flow": self.incoming_flows.get(direction, 0),
                "exits": self.exit_flows.get(direction, {})
            }
        
        return {
            "name": self.name,
            "flows": flows
        }