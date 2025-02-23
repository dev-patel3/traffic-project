from junction_config import JunctionConfiguration 

class JunctionConfigurationInput:
    def __init__(self, name: str, junctionConfig: JunctionConfiguration, 
    existing_junction_config_names: set, existing_traffic_config_names: set):
        self.name = name  
        self.junctionConfig = junctionConfig  
        self.errors: list[str] = []
        self.existing_junction_config_names = existing_junction_config_names
        self.existing_traffic_config_names = existing_traffic_config_names

    def validating_name(self):
        """Validate junction name is a non-empty string and is unique (doesn't already exist)"""
        if not self.name or not isinstance(self.name, str):
            self.errors.append("Junction configuration name must be a non-empty string.")
        if self.name in self.existing_junction_config_names:
            self.errors.append(f"Junction configuration name '{self.name}' already exists.")

    def validating_lanes(self):
        """Validate that the number of lanes is between 1 and 5 for all directions."""
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            lanes = self.junctionConfig.lanes.get(direction, 0)
            if not isinstance(lanes, int) or not (1 <= lanes <= 5):
                self.errors.append(f"Number of lanes for {direction} must be an integer between 1 and 5.")

    def validating_bus_cycle_lane(self):
        """Validate bus/cycle lane to have a valid flow rate that is an integer between 1 and 2000 """
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if self.junctionConfig.has_bus_cycle_lane:
                flow_rate = self.junctionConfig.bus_cycle_incoming_flow.get(direction, None)
                if flow_rate is None or not isinstance(flow_rate, int) or not (0 <= flow_rate <= 2000):
                    self.errors.append(
                    f"Flow rate for the bus/cycle lane in {direction} must be a "
                    f"non-negative whole number in vph, between 0 and 2000."
                    )

    def validating_crossing_durations(self):
        """Validate crossing durations for each direction, which must be between 10 and 60 seconds"""
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            if self.junctionConfig.has_pedestrian_crossing:
                duration = self.junctionConfig.pedestrian_crossing_duration
                if not isinstance(duration, int) or not (10 <= duration <= 60):
                    self.errors.append(f"Crossing duration for {direction} must be an integer and between 10 and 60 seconds.")
    
    def validating_priority_levels(self):
        """Validating that priority levels include exactly 0, 1, 2, 3, and 4 with no duplicates."""
    
        priority_levels = []
        required_priorities = {0, 1, 2, 3, 4}  #expected values
        
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound', 'pedestrian']:
            priority = self.junctionConfig.traffic_light_priority.get(direction, 0)

            # Ensuring priority is an integer within the valid range
            if not isinstance(priority, int) or not (0 <= priority <= 4):
                self.errors.append(f"Priority for {direction} must be an integer between 0 and 4.")
            
            priority_levels.append(priority)

        # Converting it to a set to check there's one of each
        if sorted(priority_levels) != list(required_priorities):
            self.errors.append("Traffic priorities must contain exactly one of each: 0, 1, 2, 3, and 4.")

    def validating_maximum_junctions(self):
        """Validate that a maximum of 10 junctions per traffic flow is not exceeded."""
        count = sum(
         1 for junction in self.existing_junction_config_names.values()
         if junction.get('traffic_flow_name') == self.junctionConfig.traffic_flow_name
        )

        if count >= 10:
            self.errors.append(
                f"Traffic flow configuration '{self.junctionConfig.traffic_flow_name}' has already reached the maximum of 10 junction configurations."
            )

    def validate(self) -> bool:
        """Runs all validation methods and returns True if valid."""
        self.validating_name()
        self.validating_lanes()
        self.validating_bus_cycle_lane()
        self.validating_crossing_durations()
        self.validating_priority_levels()
        self.validating_maximum_junctions()

        return len(self.errors) == 0

    def saveConfiguration(self) -> bool:
        """
        Saves the junction configuration after validation.
        """
        if not self.validate():
            print("Cannot save: Validation failed")
            return False

        return saving_junction_configuration(self.junctionConfig)



        '''
        # 1) Validate that none of the necessary input boxes are empty (and for the conditional boxes as well)
        if not junction_config_name:
            errors.append("Junction configuration name must be non-empty.")
        for direction in ['north', 'south', 'east', 'west']:
            direction_config = config.get(direction, {})
            # number of lanes not empty
            lanes = direction_config.get('lanes')
            if lanes is None:
                errors.append(f"Number of lanes for {direction} must be non-empty.")
            # CONDITIONAL - bus/cycle lane flow rate not empty
            if direction_config.get('bus_cycle_lane', False):
                flow_rate = direction_config.get('bus_cycle_flow_rate')
                if flow_rate is None:
                    errors.append(f"Flow rate for bus/cycle lane must be non-empty.")
            # CONDITIONAL - pedestrian crossing duration & requests not empty
            if direction_config.get('has_crossing', False):
                crossing_duration = direction_config.get('crossing_duration', None)
                crossing_requests = direction_config.get('crossing_requests', None)
                if crossing_duration is None:
                    errors.append(f"Crossing duration for {direction} must be non-empty.")
                if crossing_requests is None:
                    errors.append(f"Crossing requests for {direction} must be non-empty.")
            # priority not empty (defaulted to 0 if not specified)
            priority = direction_config.get('priority', 0)

        # 3) Validate if left-turn enabled, lane must change 1 of the existing lanes which must be chosen

        # 5) Validate only 1 bus/cycle lane per direction, CAN be ignored because slider now - maybe specify which one

        # 8) Validate that the priority levels are unique (except for 0)
        non_zero_priorities = [p for p in priority_levels if p > 0]     # list stores duplicates, set does not
        if len(non_zero_priorities) != len(set(non_zero_priorities)):
            errors.append("Priority levels (1-4) must be unique for each direction.")

        # 9) Validate number of outgoing lanes matches maximum incoming lanes, for all directions

        # 10) Validate that each incoming lane routees to a dedicated outgoing lane (no merging permitted)
        


        
        def validateConfiguration(self, data, existing_junction_config_names: set, existing_traffic_config_names: set) -> dict:
        """
        This is how input data is validated for junction configuration inputs.
        """
        config = data.get('configuration', {})
        junction_config_name = data.get('junction_config_name', None)

        errors = []

        # Now implement the valdiation rules for each input

        # Junction configuration rules validation
        '''
