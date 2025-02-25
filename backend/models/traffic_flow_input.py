from ..models.traffic_flow import TrafficFlow
from ..storage import saving_traffic_flow, loading_traffic_flows

class TrafficFlowInput:
    def __init__(self, name: str, flows: dict, existing_traffic_config_names: set):
        self.name = name  
        self.flows = flows # input data from frontend in new format
        self.errors: list[str] = []
        self.existing_traffic_config_names = existing_traffic_config_names #tracks the existing names

    def validating_flow_rates(self) -> bool:
        # Validate incoming traffic flow rate to be integers between 0 and 2000
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in self.flows:
                flow_data = self.flows[direction]
                incoming_flow = flow_data.get('incoming_flow', 0)
                
                if not isinstance(incoming_flow, int) or not (0 <= incoming_flow <= 2000):
                    self.errors.append(f"Traffic flow for {direction} must be a non-negative whole number in vph, between 0 and 2000.")
            else:
                self.errors.append(f"Missing {direction} flow data.")

        return len(self.errors) == 0

    def validating_exit_distributions(self) -> bool:
        # Validate sum of exit distributions for each direction to EQUAL incoming flow for that direction
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in self.flows:
                flow_data = self.flows[direction]
                incoming_flow = flow_data.get('incoming_flow', 0)
                exit_flows = flow_data.get('exits', {})
                
                # Sum all exit flow values
                total_exit_flow = sum(exit_flows.values())

                # Ensure incoming flow is defined correctly
                if incoming_flow <= 0 or incoming_flow > 2000:
                    self.errors.append(f"Incoming flow for {direction} ({incoming_flow} vph) is invalid.")
            
                # Check if sum matches incoming flow
            
                if abs(total_exit_flow - incoming_flow) > 0.01:
                    self.errors.append(f"Total exit flow ({total_exit_flow} vph) for {direction} does not match incoming flow ({incoming_flow} vph).")

        return len(self.errors) == 0

    def validating_name(self) -> bool:
        # Validate that name for traffic flow configuration is a non-empty string and is unique (doesn't already exist) 
        if not self.name or not isinstance(self.name, str):
            self.errors.append("Traffic configuration name must be a non-empty string.")

        if self.name in self.existing_traffic_config_names:
            self.errors.append(f"Traffic configuration name '{self.name}' already exists.")

        return len(self.errors) == 0

    def validating_max_configurations(self) -> bool:
        # Validate that the number of existing traffic configurations is <= 9 (maximum is 10)
        if len(self.existing_traffic_config_names) >= 10:
            self.errors.append(f"The maximum number of traffic configurations (10) are already being stored.")
            return False
        return True

    def validate(self) -> bool:
        """
        Runs all validation checks and returns True if valid
        """
        self.validating_flow_rates()
        self.validating_exit_distributions()
        self.validating_name()
        self.validating_max_configurations()

        return len(self.errors) == 0 #if no errors, it return True

    #To save traffic flow after validation
    def save_traffic_flow(self) -> bool:
        """
        If validation passes, it saves the traffic flow
        """
        if not self.validate():
            print("Cannot save: Validation failed")
            return False

        # Extract flow rates and exit distributions from the new format
        flow_rates = {}
        exit_distributions = {}
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if direction in self.flows:
                flow_data = self.flows[direction]
                flow_rates[direction] = flow_data.get('incoming_flow', 0)
                exit_distributions[direction] = flow_data.get('exits', {})

        #Constructing TrafficFlow object with extracted data
        traffic_flow = TrafficFlow(
            name=self.name,
            flow_rates=flow_rates,
            exit_distributions=exit_distributions
        )

        return saving_traffic_flow(traffic_flow)