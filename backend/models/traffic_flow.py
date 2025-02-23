class TrafficFlow:
    def __init__(self, name: str, flow_rates: dict[str, int], exit_distributions: dict[str, dict[str, int]]):
        
        
        self.name = name  # Name of the traffic flow
        self.incoming_flows = flow_rates  # Stores the incoming flow for each direction
        self.exit_flows = exit_distributions  # Stores the exit flows

    def to_dict(self) -> dict:
        '''
        Converting the TrafficFlow object into a dictionary for JSON storage.
        '''
        return {
            "name": self.name,
            "flows": {
                "northbound": {
                    "incoming_flow": self.incoming_flows.get("northbound", 0),
                    "exits": self.exit_flows.get("northbound", {})
                },
                "southbound": {
                    "incoming_flow": self.incoming_flows.get("southbound", 0),
                    "exits": self.exit_flows.get("southbound", {})
                },
                "eastbound": {
                    "incoming_flow": self.incoming_flows.get("eastbound", 0),
                    "exits": self.exit_flows.get("eastbound", {})
                },
                "westbound": {
                    "incoming_flow": self.incoming_flows.get("westbound", 0),
                    "exits": self.exit_flows.get("westbound", {})
                }
            }
        }
