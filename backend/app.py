from flask import Flask
from flask_cors import CORS

from typing import Dict, List, Union
import math

app = Flask(__name__)
CORS(app)

@app.route('/api/test')
def test():
    return {'message': 'Connected to Flask!'}

class TrafficJunctionCalculator:
    """
    Handles all traffic junction calculations for the simulation
    Implements formulas from the specification to evaluate junction efficiency
    """
    
    # Priority factor constants
    PRIORITY_FACTORS = {
        'pedestrian': 0.25,  # Level 3
        'bus_cycle': 0.5,    # Level 2
        'directional': 0.75, # Level 1
        'regular': 1.0       # Level 0
    }
    
    # Vehicle Equivalency Units (EVUs)
    EVU_FACTORS = {
        'car': 1.0,
        'bus': 2.0,
        'bicycle': 0.5
    }
    
    # Environmental score constants
    ENVIRONMENTAL_BONUSES = {
        'bus_lane': 20,
        'cycle_lane': 15,
        'pedestrian_crossing': 10
    }

    def __init__(self):
        """Initialises calculator with default values"""
        self.max_red_duration = 120  # Maximum red light duration in seconds
        self.cycle_duration = 240    # Total traffic light cycle duration
        self.base_processing_rate = 1800  # Vehicles per hour through green light

    def calculate_average_wait_time(
        self, 
        red_light_duration: float,
        queue_size: int,
        priority_factor: float,
        num_lanes: int,
        processing_rate: float
    ) -> float:
        """
        Calculates average wait time for vehicles in a direction
        Returns wait time in seconds
        """
        return (red_light_duration * queue_size * priority_factor) / (num_lanes * processing_rate)

    def calculate_maximum_queue_length(
        self,
        arrival_rate: float,
        max_red_duration: float,
        service_rate: float,
        num_lanes: int,
        evu_factor: float
    ) -> float:
        """Calculate maximum queue length in a given direction"""
        return ((arrival_rate * max_red_duration) - (service_rate * num_lanes)) * evu_factor

    def adjust_wait_time_for_priority(
        self,
        base_wait_time: float,
        priority_level: int
    ) -> float:
        """Adjust wait time based on priority level (0-4)"""
        return base_wait_time * (1 - (priority_level * 0.2))

    def calculate_direction_flow_score(
        self,
        direction1_flow: float,
        direction2_flow: float
    ) -> float:
        """Calculate flow score for simultaneous directions"""
        return (direction1_flow + direction2_flow) / 1.25

    def calculate_left_turn_impact(
        self,
        queue_length: float,
        lane_capacity: float
    ) -> float:
        """Calculate impact score for left turn lanes"""
        lane_efficiency = queue_length / lane_capacity
        return (lane_efficiency / queue_length / lane_capacity) * 100

    def calculate_bus_cycle_lane_impact(
        self,
        actual_evu_flow: float,
        max_evu_capacity: float,
        bus_flow: float,
        max_bus_flow: float
    ) -> Dict[str, float]:
        """Calculate efficiency impact and sustainability score for bus/cycle lanes"""
        lane_utilisation = (actual_evu_flow / max_evu_capacity) * 100
        efficiency_impact = -0.2  # 20% reduction in efficiency
        
        # Calculate sustainability bonus
        sustainability_bonus = 0.4  # 40% sustainability bonus
        bus_lane_sustainability = 100 * (1 + (bus_flow / max_bus_flow) * 0.3) * sustainability_bonus
        
        return {
            'efficiency_impact': lane_utilisation * efficiency_impact,
            'sustainability_score': bus_lane_sustainability
        }

    def calculate_sustainability_score(
        self,
        config: Dict[str, Union[float, int, bool]],
        flow_rates: Dict[str, float]
    ) -> float:
        """
        Calculate overall sustainability score based on environmental factors
        and configuration choices
        """
        # Calculate public transport factor
        total_evus = sum(flow_rates.values())
        bus_evus = flow_rates.get('bus', 0) * self.EVU_FACTORS['bus']
        cycle_evus = flow_rates.get('cycle', 0) * self.EVU_FACTORS['bicycle']
        public_transport_factor = (bus_evus * 2 + cycle_evus * 0.5) / total_evus if total_evus > 0 else 0
        
        # Calculate pedestrian factor
        crossing_frequency = config.get('crossing_frequency', 0)
        crossing_duration = config.get('crossing_duration', 0)
        pedestrian_factor = (crossing_frequency * crossing_duration) / self.cycle_duration
        
        # Calculate environmental bonuses
        env_bonus = 0
        if config.get('has_bus_lane', False):
            env_bonus += self.ENVIRONMENTAL_BONUSES['bus_lane']
        if config.get('has_cycle_lane', False):
            env_bonus += self.ENVIRONMENTAL_BONUSES['cycle_lane']
        if config.get('has_pedestrian_crossing', False):
            env_bonus += self.ENVIRONMENTAL_BONUSES['pedestrian_crossing']
            
        # Calculate high traffic volume penalty
        total_flow = sum(flow_rates.values())
        volume_penalty = max(0, math.ceil((total_flow - 1000) / 100) * 2)
        
        # Calculate final sustainability score
        base_score = 100
        environmental_factors = (public_transport_factor + pedestrian_factor) * 100
        
        return base_score + environmental_factors + env_bonus - volume_penalty

    def calculate_final_efficiency(
        self,
        wait_time_score: float,
        queue_length_score: float,
        sustainability_score: float,
        direction_flow_score: float,
        special_lane_score: float
    ) -> float:
        """
        Calculate final efficiency score combining all metrics
        Returns a score between 0 and 100
        """
        return (
            (wait_time_score * 0.35) +
            (queue_length_score * 0.25) +
            (sustainability_score * 0.2) +
            (direction_flow_score * 0.1) +
            (special_lane_score * 0.1)
        )

# Initialise calculator
calculator = TrafficJunctionCalculator()

@app.route('/api/flows', methods=['POST'])
def validate_flows_data(data):
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

@app.route('/api/config', methods=['POST'])
def validate_junction_data(data):
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

@app.route('/api/simulate', methods=['POST'])
def simulate_junction():
    """
    Main endpoint for junction simulation
    Expects JSON with junction configuration and traffic flow data
    Returns simulation results including efficiency scores and metrics
    """
    try:
        data = request.get_json()
        
        # Extract configuration and flow data
        config = data.get('configuration', {})
        flows = data.get('flows', {})
        
        # Calculate base metrics for each direction
        metrics = {}
        for direction in ['north', 'south', 'east', 'west']:
            direction_config = config.get(direction, {})
            flow_rate = flows.get(direction, {}).get('incoming', 0)
            
            # Calculate wait times
            base_wait_time = calculator.calculate_average_wait_time(
                red_light_duration=60,  # Default red light duration
                queue_size=math.ceil(flow_rate / 60),  # Approximate queue size
                priority_factor=calculator.PRIORITY_FACTORS['regular'],
                num_lanes=direction_config.get('lanes', 1),
                processing_rate=calculator.base_processing_rate
            )
            
            # Adjust for priority if specified
            priority_level = direction_config.get('priority', 0)
            adjusted_wait_time = calculator.adjust_wait_time_for_priority(
                base_wait_time,
                priority_level
            )
            
            # Calculate queue length
            queue_length = calculator.calculate_maximum_queue_length(
                arrival_rate=flow_rate,
                max_red_duration=calculator.max_red_duration,
                service_rate=calculator.base_processing_rate,
                num_lanes=direction_config.get('lanes', 1),
                evu_factor=calculator.EVU_FACTORS['car']
            )
            
            metrics[direction] = {
                'average_wait_time': adjusted_wait_time,
                'max_wait_time': adjusted_wait_time * 1.5,  # Estimate max wait time
                'max_queue_length': queue_length
            }
        
        # Calculate sustainability score
        sustainability_score = calculator.calculate_sustainability_score(config, flows)
        
        # Calculate final efficiency score
        final_score = calculator.calculate_final_efficiency(
            wait_time_score=100 - (sum(d['average_wait_time'] for d in metrics.values()) / 4),
            queue_length_score=100 - (sum(d['max_queue_length'] for d in metrics.values()) / 4),
            sustainability_score=sustainability_score,
            direction_flow_score=sum(flows.values()) / len(flows) if flows else 0,
            special_lane_score=config.get('special_lane_score', 0)
        )
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'sustainability_score': sustainability_score,
            'final_efficiency_score': final_score
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/validate', methods=['POST'])
def validate_configuration():
    """
    Endpoint to validate junction configuration
    Checks all constraints and rules before simulation
    """
    try:
        data = request.get_json()
        config = data.get('configuration', {})
        
        # Validation rules from requirements
        errors = []
        
        # Check lane counts
        for direction in ['north', 'south', 'east', 'west']:
            lanes = config.get(direction, {}).get('lanes', 0)
            if not 1 <= lanes <= 5:
                errors.append(f"Number of lanes for {direction} must be between 1 and 5")
        
        # Check priority levels
        priorities = [
            config.get(direction, {}).get('priority', 0)
            for direction in ['north', 'south', 'east', 'west']
        ]
        if len([p for p in priorities if p == 4]) > 1:
            errors.append("Only one direction can have maximum priority (4)")
            
        # Check crossing durations
        for direction in ['north', 'south', 'east', 'west']:
            if config.get(direction, {}).get('has_crossing', False):
                duration = config.get(direction, {}).get('crossing_duration', 0)
                if not 10 <= duration <= 60:
                    errors.append(f"Crossing duration for {direction} must be between 10 and 60 seconds")
        
        return jsonify({
            'success': len(errors) == 0,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)