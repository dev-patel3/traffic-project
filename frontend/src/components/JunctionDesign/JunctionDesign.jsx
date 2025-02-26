import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Save, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import ConfigInfo from './ConfigInfo';

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

const JunctionDesign = ({ onNavigate, configId, configName, previousPage }) => {
  const [junctionName, setJunctionName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const priorities = Object.values(formState).map(dir => dir.traffic_priority);
    const nonZeroPriorities = priorities.filter(p => p > 0);
    const uniqueNonZeroPriorities = new Set(nonZeroPriorities);
    if (nonZeroPriorities.length !== uniqueNonZeroPriorities.size) {
      errors.push('Each direction must have a unique priority level (except for 0)');
    }

    return errors;
  };

  const handleSubmit = async (action) => {
    // Validate form
    if (action === 'save') {
      const formErrors = validateForm();
      if (formErrors.length > 0) {
        setError(formErrors.join(', '));
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Process form data
        const formData = {
          name: junctionName,
          traffic_flow_config: configId,
          northbound: formState.northbound,
          southbound: formState.southbound,
          eastbound: formState.eastbound,
          westbound: formState.westbound
        };

        console.log('Saving junction:', formData);

        // Send the data to the backend
        const response = await fetch('http://localhost:5000/api/junctions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to save junction');
        }

        if (!result.success) {
          throw new Error(result.error || 'Failed to save junction');
        }

        // After successful save, navigate back to the configuration junctions page
        onNavigate('configJunctions', { configId, configName });
      } catch (err) {
        console.error('Error saving junction:', err);
        setError(err.message || 'Failed to save junction');
      } finally {
        setIsSubmitting(false);
      }
    } else if (action === 'simulate') {
      // This would be implemented for actual simulation
      console.log('Running simulation with:', formState);
      onNavigate('simulation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Display error if any */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Display Traffic Configuration Info */}
          <ConfigInfo configId={configId} />

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
              onClick={() => onNavigate('configJunctions', { configId, configName })}
              className="px-8 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('save')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              <Save className="h-5 w-5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Design'}</span>
            </button>
            <button
              onClick={() => handleSubmit('simulate')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
              disabled={isSubmitting}
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

export default JunctionDesign;