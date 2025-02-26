import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Save, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import ConfigInfo from './ConfigInfo';

// DirectionForm component with proper field names matching backend
const DirectionForm = ({ direction, values, onChange }) => {
  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium">{direction} Road</h2>

        {/* Number of Lanes */}
        <div className="space-y-2">
          <Label htmlFor={`${direction}-lanes`}>Number of Lanes</Label>
          <Input 
            id={`${direction}-lanes`}
            type="number"
            value={values.num_lanes || 1}
            onChange={(e) => onChange(direction, 'num_lanes', parseInt(e.target.value))}
            min={1}
            max={5}
            placeholder="Maximum number of lanes is 5"
            className="max-w-2xl"
          />
        </div>

        {/* Left Turn Lane */}
        <div className="flex items-center justify-between max-w-2xl">
          <Label htmlFor={`${direction}-leftTurn`}>Enable Left Turn Lane</Label>
          <Switch 
            id={`${direction}-leftTurn`}
            checked={values.enable_left_turn_lane || false}
            onCheckedChange={(checked) => onChange(direction, 'enable_left_turn_lane', checked)}
          />
        </div>

        {/* Bus/Bicycle Lane */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-2xl">
            <Label htmlFor={`${direction}-busCycle`}>Enable Bus/Bicycle Lane</Label>
            <Switch 
              id={`${direction}-busCycle`}
              checked={values.enable_bus_cycle_lane || false}
              onCheckedChange={(checked) => onChange(direction, 'enable_bus_cycle_lane', checked)}
            />
          </div>
          
          {values.enable_bus_cycle_lane && (
            <div className="space-y-4">
              <div className="max-w-2xl">
                <Label htmlFor={`${direction}-transportType`}>Transport Type</Label>
                <select
                  id={`${direction}-transportType`}
                  value={values.bus_cycle_lane_type || ''}
                  onChange={(e) => onChange(direction, 'bus_cycle_lane_type', e.target.value)}
                  className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="bus">Bus Lane</option>
                  <option value="bicycle">Bicycle Lane</option>
                </select>
              </div>
              <div>
                <Label htmlFor={`${direction}-flowRate`}>Flow Rate (vehicles per hour)</Label>
                <Input
                  id={`${direction}-flowRate`}
                  type="number"
                  value={values.flow_rate || 0}
                  onChange={(e) => onChange(direction, 'flow_rate', parseInt(e.target.value))}
                  min={0}
                  max={2000}
                  className="max-w-2xl mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pedestrian Crossing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-2xl">
            <Label htmlFor={`${direction}-pedestrian`}>Pedestrian Crossing</Label>
            <Switch 
              id={`${direction}-pedestrian`}
              checked={values.pedestrian_crossing_enabled || false}
              onCheckedChange={(checked) => onChange(direction, 'pedestrian_crossing_enabled', checked)}
            />
          </div>
          
          {values.pedestrian_crossing_enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`${direction}-crossingDuration`}>Crossing Duration (seconds)</Label>
                <Input 
                  id={`${direction}-crossingDuration`}
                  type="number"
                  value={values.pedestrian_crossing_duration || 10}
                  onChange={(e) => onChange(direction, 'pedestrian_crossing_duration', parseInt(e.target.value))}
                  min={10}
                  max={60}
                  className="max-w-2xl mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`${direction}-crossingRequests`}>Crossing Requests per Hour</Label>
                <Input 
                  id={`${direction}-crossingRequests`}
                  type="number"
                  value={values.pedestrian_crossing_requests_per_hour || 0}
                  onChange={(e) => onChange(direction, 'pedestrian_crossing_requests_per_hour', parseInt(e.target.value))}
                  min={0}
                  className="max-w-2xl mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Traffic Priority */}
        <div className="space-y-2">
          <Label htmlFor={`${direction}-priority`}>Traffic Priority</Label>
          <Input 
            id={`${direction}-priority`}
            type="number"
            value={values.traffic_priority || 0}
            onChange={(e) => onChange(direction, 'traffic_priority', parseInt(e.target.value))}
            min={0}
            max={4}
            placeholder="Priority level: 0 (no priority) to 4 (highest priority)"
            className="max-w-2xl"
          />
        </div>
      </div>
    </Card>
  );
};

const EditJunctionDesign = ({ junctionId, onNavigate }) => {
  console.log("EditJunctionDesign received junctionId:", junctionId); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [junctionName, setJunctionName] = useState('');
  const [trafficFlowConfig, setTrafficFlowConfig] = useState(''); 
  const [formState, setFormState] = useState({
    northbound: {
      num_lanes: 1,
      enable_left_turn_lane: false,
      enable_bus_cycle_lane: false,
      bus_cycle_lane_type: '',
      flow_rate: 0,
      pedestrian_crossing_enabled: false,
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 0,
      traffic_priority: 0
    },
    eastbound: {
      num_lanes: 1,
      enable_left_turn_lane: false,
      enable_bus_cycle_lane: false,
      bus_cycle_lane_type: '',
      flow_rate: 0,
      pedestrian_crossing_enabled: false,
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 0,
      traffic_priority: 0
    },
    southbound: {
      num_lanes: 1,
      enable_left_turn_lane: false,
      enable_bus_cycle_lane: false,
      bus_cycle_lane_type: '',
      flow_rate: 0,
      pedestrian_crossing_enabled: false,
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 0,
      traffic_priority: 0
    },
    westbound: {
      num_lanes: 1,
      enable_left_turn_lane: false,
      enable_bus_cycle_lane: false,
      bus_cycle_lane_type: '',
      flow_rate: 0,
      pedestrian_crossing_enabled: false,
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 0,
      traffic_priority: 0
    }
  });

  useEffect(() => {
    const fetchJunction = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/junctions/${junctionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch junction');
        }
        
        const data = await response.json();
        console.log("Fetched junction data:", data);
        
        // Set junction name and traffic flow config
        setJunctionName(data.name);
        setTrafficFlowConfig(data.traffic_flow_config);
        
        // Set form state with direction data
        const newFormState = {};
        for (const direction of ['northbound', 'eastbound', 'southbound', 'westbound']) {
          if (data[direction]) {
            // Ensure all required properties exist with defaults
            newFormState[direction] = {
              num_lanes: data[direction].num_lanes || 1,
              enable_left_turn_lane: data[direction].enable_left_turn_lane || false,
              enable_bus_cycle_lane: data[direction].enable_bus_cycle_lane || false,
              bus_cycle_lane_type: data[direction].bus_cycle_lane_type || '',
              flow_rate: data[direction].flow_rate || 0,
              pedestrian_crossing_enabled: data[direction].pedestrian_crossing_enabled || false,
              pedestrian_crossing_duration: data[direction].pedestrian_crossing_duration || 10,
              pedestrian_crossing_requests_per_hour: data[direction].pedestrian_crossing_requests_per_hour || 0,
              traffic_priority: data[direction].traffic_priority || 0
            };
          } else {
            // If direction data doesn't exist, use defaults
            newFormState[direction] = {
              num_lanes: 1,
              enable_left_turn_lane: false,
              enable_bus_cycle_lane: false,
              bus_cycle_lane_type: '',
              flow_rate: 0,
              pedestrian_crossing_enabled: false,
              pedestrian_crossing_duration: 10,
              pedestrian_crossing_requests_per_hour: 0,
              traffic_priority: 0
            };
          }
        }
        
        setFormState(newFormState);
      } catch (err) {
        setError(`Error loading junction: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    if (junctionId) {
      fetchJunction();
    }
  }, [junctionId]);

  const handleDirectionChange = (direction, field, value) => {
    setFormState(prev => ({
      ...prev,
      [direction.toLowerCase()]: {
        ...prev[direction.toLowerCase()],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!junctionName.trim()) {
      errors.push('Junction name is required');
    }

    // Check for valid priority assignments
    const priorities = [];
    for (const direction in formState) {
      if (formState[direction].traffic_priority > 0) {
        priorities.push(formState[direction].traffic_priority);
      }
    }
    
    // Check for duplicates in non-zero priorities
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      errors.push('Each direction must have a unique priority level (except for 0)');
    }

    return errors;
  };

  const handleSubmit = async (action) => {
    if (action === 'save') {
      const errors = validateForm();
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
  
      try {
        setSaving(true);
        setError(null);
        
        const junctionData = {
          name: junctionName,
          traffic_flow_config: trafficFlowConfig,
          northbound: formState.northbound,
          southbound: formState.southbound,
          eastbound: formState.eastbound,
          westbound: formState.westbound
        };

        console.log("Submitting junction update:", junctionData);
        
        const response = await fetch(`http://localhost:5000/api/junctions/${junctionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(junctionData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update junction');
        }
  
        const result = await response.json();
        if (result.success) {
          // Navigate back to junctions listing for this traffic flow
          onNavigate('configJunctions', { configId: trafficFlowConfig, configName: trafficFlowConfig });
        } else {
          throw new Error(result.error || 'Failed to update junction');
        }
      } catch (err) {
        setError(`Error saving junction: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else if (action === 'simulate') {
      // Navigate to simulation page with junction ID
      onNavigate('simulation', { junctionId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading junction...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        <ConfigInfo configId={trafficFlowConfig} />

          {/* Junction Name */}
          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <Label htmlFor="junction-name">Junction Name</Label>
              <Input 
                id="junction-name"
                value={junctionName}
                onChange={(e) => setJunctionName(e.target.value)}
                placeholder="Name your junction design"
                className="max-w-2xl"
              />
            </div>
          </Card>

          {/* Direction Forms */}
          {Object.entries(formState).map(([direction, values]) => (
            <DirectionForm
              key={direction}
              direction={direction.charAt(0).toUpperCase() + direction.slice(1)}
              values={values}
              onChange={handleDirectionChange}
            />
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => onNavigate('configJunctions', { configId: trafficFlowConfig, configName: trafficFlowConfig })}
              className="px-8 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('save')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
              disabled={saving}
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={() => handleSubmit('simulate')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
              disabled={saving}
            >
              <PlayCircle className="h-5 w-5" />
              <span>Run Simulation</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditJunctionDesign;