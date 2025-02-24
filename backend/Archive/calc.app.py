'''
from .calculations import calculator

@app.route('/api/simulate', methods=['POST'])
def simulate_junction():
    try:
        data = request.get_json()
        
        # Get traffic flow and junction configuration
        traffic_flow = getting_traffic_flow(data['traffic_flow_id'])
        if not traffic_flow:
            return jsonify({"error": "Traffic flow not found"}), 404
            
        # Calculate metrics using the calculator
        metrics = calculator.calculate_junction_metrics(
            junction_config=data['configuration'],
            traffic_flow=traffic_flow
        )
        
        return jsonify({
            "success": True,
            "metrics": metrics
        })
        
    except Exception as e:
        print(f"Error in simulate_junction: {str(e)}")
        return jsonify({"error": str(e)}), 500


'''