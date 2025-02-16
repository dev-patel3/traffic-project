from flask import Flask, request, jsonify
from flask_cors import CORS
from models.history_configuration import HistoryConfiguration
import json
import os

from typing import Dict, List, Union
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # Allow requests from React dev server
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


# Loading configurations directly
def load_configs():
    try:
        json_path = os.path.join("database", "storing_configs.json")
        if not os.path.exists(json_path):
            print(f"File not found: {json_path}")
            return []
            
        with open(json_path, "r") as file:
            data = json.load(file)
            return data
    except Exception as e:
        print(f"Error loading configurations: {e}")
        return []

@app.route('/api/traffic-flows', methods=['GET'])
def get_traffic_flows():
    """Gets all traffic flow configurations."""
    try:
        # Load JSON data
        with open(os.path.join(BASE_DIR, 'database', 'storing_configs.json'), "r") as file:
            data = json.load(file)
        
        # Transform the data for frontend
        traffic_flows = []
        for name, flow in data.get("traffic_flow_configurations", {}).items():
            # Calculate total VPH for each direction
            traffic_flows.append({
                "id": name,
                "name": name,
                "northVPH": sum(flow["northbound"].values()),
                "southVPH": sum(flow["southbound"].values()),
                "eastVPH": sum(flow["eastbound"].values()),
                "westVPH": sum(flow["westbound"].values()),
                "junctionCount": sum(
                    1 for junction in data.get("junction_configurations", {}).values()
                    if junction["traffic_flow_config"] == name
                )
            })
            
        return jsonify(traffic_flows)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/traffic-flows/<flow_id>/junctions', methods=['GET'])
def get_junction_configurations(flow_id):
    """Gets junction configurations for a specific traffic flow."""
    try:
        # Load JSON data
        with open(os.path.join(BASE_DIR, 'database', 'storing_configs.json'), "r") as file:
            data = json.load(file)
            
        # Process junction configurations
        junctions = []
        for name, junction in data.get("junction_configurations", {}).items():
            if junction["traffic_flow_config"] == flow_id:
                directions = ["northbound", "southbound", "eastbound", "westbound"]
                
                junctions.append({
                    "id": name,
                    "name": name,
                    "lanes": round(sum(junction[d]["num_lanes"] for d in directions) / len(directions)),
                    "hasLeftTurnLanes": any(junction[d].get("enable_left_turn_lane", False) for d in directions),
                    "hasBusCycleLanes": any(junction[d].get("enable_bus_cycle_lane", False) for d in directions),
                    "avgWaitTime": 45,
                    "maxQueueLength": 15
                })
        
        return jsonify(junctions)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/traffic-flows/<flow_id>', methods=['DELETE'])
def delete_traffic_flow_config(flow_id):
    """Deletes a traffic flow and its associated junctions."""
    try:
        # Load and update data
        with open(os.path.join(BASE_DIR, 'database', 'storing_configs.json'), "r") as file:
            data = json.load(file)
        
        if flow_id not in data.get("traffic_flow_configurations", {}):
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Remove flow and associated junctions
        del data["traffic_flow_configurations"][flow_id]
        data["junction_configurations"] = {
            name: junction
            for name, junction in data.get("junction_configurations", {}).items()
            if junction["traffic_flow_config"] != flow_id
        }
        
        # Save updated data
        with open(os.path.join(BASE_DIR, 'database', 'storing_configs.json'), "w") as file:
            json.dump(data, file, indent=3)
        
        return jsonify({"message": "Traffic flow and associated junctions deleted successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/test')
def test():
    return {'message': 'Connected to Flask!'}

# @app.route('/api/delete_configuration/<name>', methods=['DELETE'])
# def delete_configuration(name):
#     completed = history_config.deleteConfiguration(name)
#     if completed:
#         return jsonify({'message' : 'The configuration was deleted successfully'}), 200
#     return jsonify(['error' : 'The Configuration could not be found']), 404

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