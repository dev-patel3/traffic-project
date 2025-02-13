from traffic_flow import TrafficFlow

class TrafficFlowInput:
    def __init__(self, name: str, traffic_flow: 'TrafficFlow'):
        self.name = name  
        self.trafficFlow = traffic_flow  
        self.errors: str = ""  

    def validateFlowRates(self, data) -> bool:
        """
        This is how input data is validated for traffic flow inputs.
        """
        flows = data.get('flows', {})
        traffic_config_name = data.get('traffic_config_name', None)

        errors = []

        # Now implement the valdiation rules for each input

        # Traffic flow rules validation

        # 1) Validate that none of the necessary input boxes are empty
        if not traffic_config_name:
            return("Traffic configuration name must be non-empty.")
        for direction in ['north', 'south', 'east', 'west']:
            flow_data = flows.get(direction, {})
            incoming_flow = flow_data.get('incoming', 0)    # defaults to 0 if empty
            exit_flows = flow_data.get('exits', {})
            # each exit flow direction in the exit_flows dictionary must be non-empty
            for exit_direction, exit_value in exit_flows.items():
                if exit_value is None:
                    errors.append(f"Exit flow for {direction} towards {exit_direction} must be non-empty.")

        
        # 2) Validate traffic flow rate to be integers between 0 and 2000
        for direction in ['north', 'south', 'east', 'west']:
            flow_data = flows.get(direction, {})
            incoming_flow = flow_data.get('incoming', 0)
            if not isinstance(incoming_flow, int) or not (0 <= incoming_flow <= 2000):
                errors.append(f"Traffic flow for {direction} must be a non-negative whole number in vph, between 0 and 2000.")

        # 3) Validate sum of exit distributions for each direction to EQUAL incoming flow for that direction
        for direction in ['north', 'south', 'east', 'west']:
            flow_data = flows.get(direction, {})
            incoming_flow = flow_data.get('incoming', 0)
            exit_flows = flow_data.get('exits', {})
            # sum all exit flow values
            total_exit_flow = sum(exit_flows.values())
            # check if sum matches incoming flow
            if total_exit_flow != incoming_flow:
                errors.append(f"Total exit flow ({total_exit_flow} vph) for {direction} does not match incoming flow ({incoming_flow} vph).")

        # 4) Validate that name for traffic flow configuration is a non-empty string and is unique (doesn't already exist) 
        if not traffic_config_name or not isinstance(traffic_config_name, str):
            return("Traffic configuration name must be a non-empty string.")
        if traffic_config_name in existing_traffic_config_names:
            return(f"Traffic configuration name '{traffic_config_name}' already exists.")

        return {'success': len(errors) == 0, 'errors': errors}

    #To save traffic flow after validation
    def saveTrafficFlow(self) -> bool:
        pass
