from junction_config import JunctionConfiguration 

class JunctionConfigurationInput:
    def __init__(self, name: str, junctionConfig: JunctionConfiguration):
        self.name = name  
        self.junctionConfig = junctionConfig  
        self.errors = "" 

    def validateConfiguration(self, data) -> None:
        """
        This is how input data is validated for junction configuration inputs.
        """
        config = data.get('configuration', {})
        junction_config_name = data.get('junction_config_name', None)

        errors = []

        # Now implement the valdiation rules for each input

        # Junction configuration rules validation

        # 1) Validate that none of the necessary input boxes are empty (and for the conditional boxes as well)
        if not junction_config_name:
            return("Junction configuration name must be non-empty.")
        for direction in ['north', 'south', 'east', 'west']:
            direction_config = config.get(direction, {})
            # number of lanes not empty
            lanes = direction_config.get('lanes')
            if lanes is None:
                errors.append(f"Number of lanes for {direction} must be non-empty.")
            # CONDITIONAL - bus/cycle lane flow rate not empty
            if direction_config('bus_cycle_lane', False):
                flow_rate = direction_config.get('bus_cycle_flow_rate')
                if flow_rate is None:
                    errors.append(f"Flow rate for bus/cycle lane must be non-empty.")
            # CONDITIONAL - pedestrian crossing duration & requests not empty
            if direction_config('has_crossing', False):
                crossing_duration = direction_config.get('crossing_duration')
                crossing_requests = direction_config.get('crossing_requests')
                if crossing_duration is None:
                    errors.append(f"Crossing duration for {direction} must be non-empty.")
                if crossing_requests is None:
                    errors.append(f"Crossing requests for {direction} must be non-empty.")
            # priority not empty (defaulted to 0 if not specified)
            priority = direction_config.get('priority', 0)

        # 2) Validate number of lanes in each direction between 1 and 5
        for direction in ['north', 'south', 'east', 'west']:
            lanes = config.get(direction, {}).get('lanes', 0)
            if not isinstance(lanes, int) or not (1 <= lanes <= 5):
                errors.append(f"Number of lanes for {direction} must be an integer between 1 and 5.")

        # 3) Validate if left-turn enabled, lane must change 1 of the existing lanes which must be chosen

        # 4) Validate bus/cycle lane to have a valid flow rate that is an integer between 1 and 2000 (ignore matrix for now)
        for direction in ['north', 'south', 'east', 'west']:
            direction_config = config.get(direction, {})
            has_bus_cycle_lane = direction_config.get('bus_cycle_lane', False)
            flow_rate = direction_config.get('bus_cycle_flow_rate', None)
            if has_bus_cycle_lane:
                if not isinstance(flow_rate, int) or not (0 <= flow_rate <= 2000):
                    errors.append(f"Flow rate for the bus/cycle lane in {direction} must be a non-negative whole number in vph, between 0 and 2000.")

        # 5) Validate only 1 bus/cycle lane per direction, CAN be ignored because slider now - maybe specify which one

        # 6) Validate crossing durations for each direction, which must be between 10 and 60 seconds
        priority_levels = []
        for direction in ['north', 'south', 'east', 'west']:
            if not config.get(direction, {}).get('has_crossing', False):
                continue
            duration = config.get(direction, {}).get(direction, {}).get('crossing_duration', 0)
            if not isinstance(duration, int) or not (10 <= duration <= 60):
                errors.append(f"Crossing duration for {direction} must be an integer and between 10 and 60 seconds.")


        # 7) Validate priority levels range from 0 (no priority) to 4 (highest priority)
        for direction in ['north', 'south', 'east', 'west']:
            priority = config.get(direction, {}).get('priority', 0)     # default to 0 priority if not specified
            if not isinstance(priority, int) or not (0 <= priority <= 4):
                errors.append(f"Priority for {direction} must be an integer between 0 and 4.")
            priority_levels.append(priority)

        # 8) Validate that the priority levels are unique (except for 0)
        non_zero_priorities = [p for p in priority_levels if p > 0]     # list stores duplicates, set does not
        if len(non_zero_priorities) != len(set(non_zero_priorities)):
            errors.append("Priority levels (1-4) must be unique for each direction.")

        # 9) Validate number of outgoing lanes matches maximum incoming lanes, for all directions



        # 10) Validate that each incoming lane routees to a dedicated outgoing lane (no merging permitted)

            

        # 11) Validate junction name is a non-empty string and is unique (doesn't already exist)
        if not junction_config_name or not isinstance(junction_config_name, str):
            return("Junction configuration name must be a non-empty string.")
        if junction_config_name in existing_junction_config_names:
            return(f"Junction configuration name '{traffic_config_name}' already exists.")


        return {'success': len(errors) == 0, 'errors': errors}

    def saveConfiguration(self) -> None:
        pass

