import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Save, PlayCircle } from 'lucide-react';
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
            value={values.lanes}
            onChange={(e) => onChange(direction, 'lanes', parseInt(e.target.value))}
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
            checked={values.hasLeftTurn}
            onCheckedChange={(checked) => onChange(direction, 'hasLeftTurn', checked)}
          />
        </div>

        {/* Bus/Bicycle Lane */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-2xl">
            <Label htmlFor={`${direction}-busCycle`}>Enable Bus/Bicycle Lane</Label>
            <Switch 
              id={`${direction}-busCycle`}
              checked={values.hasBusCycle}
              onCheckedChange={(checked) => onChange(direction, 'hasBusCycle', checked)}
            />
          </div>
          
          {values.hasBusCycle && (
            <div className="space-y-4">
              <div className="max-w-2xl">
                <Label htmlFor={`${direction}-transportType`}>Transport Type</Label>
                <select
                  id={`${direction}-transportType`}
                  value={values.transportType}
                  onChange={(e) => onChange(direction, 'transportType', e.target.value)}
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
                  value={values.flowRate}
                  onChange={(e) => onChange(direction, 'flowRate', parseInt(e.target.value))}
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
              checked={values.hasPedestrian}
              onCheckedChange={(checked) => onChange(direction, 'hasPedestrian', checked)}
            />
          </div>
          
          {values.hasPedestrian && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`${direction}-crossingDuration`}>Crossing Duration (seconds)</Label>
                <Input 
                  id={`${direction}-crossingDuration`}
                  type="number"
                  value={values.crossingDuration}
                  onChange={(e) => onChange(direction, 'crossingDuration', parseInt(e.target.value))}
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
                  value={values.crossingRequests}
                  onChange={(e) => onChange(direction, 'crossingRequests', parseInt(e.target.value))}
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
            value={values.priority}
            onChange={(e) => onChange(direction, 'priority', parseInt(e.target.value))}
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
  const [formState, setFormState] = useState({
    northbound: {
      lanes: 1,
      hasLeftTurn: false,
      hasBusCycle: false,
      transportType: '',
      flowRate: 0,
      hasPedestrian: false,
      crossingDuration: 10,
      crossingRequests: 0,
      priority: 0
    },
    eastbound: {
      lanes: 1,
      hasLeftTurn: false,
      hasBusCycle: false,
      transportType: '',
      flowRate: 0,
      hasPedestrian: false,
      crossingDuration: 10,
      crossingRequests: 0,
      priority: 0
    },
    southbound: {
      lanes: 1,
      hasLeftTurn: false,
      hasBusCycle: false,
      transportType: '',
      flowRate: 0,
      hasPedestrian: false,
      crossingDuration: 10,
      crossingRequests: 0,
      priority: 0
    },
    westbound: {
      lanes: 1,
      hasLeftTurn: false,
      hasBusCycle: false,
      transportType: '',
      flowRate: 0,
      hasPedestrian: false,
      crossingDuration: 10,
      crossingRequests: 0,
      priority: 0
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

  const handleSubmit = (action) => {
    // Validate form
    if (!junctionName.trim()) {
      alert('Please enter a junction name');
      return;
    }

    // Check for valid priority assignments
    const priorities = Object.values(formState).map(dir => dir.priority);
    const nonZeroPriorities = priorities.filter(p => p > 0);
    const uniqueNonZeroPriorities = new Set(nonZeroPriorities);
    if (nonZeroPriorities.length !== uniqueNonZeroPriorities.size) {
      alert('Each direction must have a unique priority level (except for 0)');
      return;
    }

    // Process form data
    const formData = {
      name: junctionName,
      traffic_flow_config: configId, // Include the traffic flow configuration ID
      ...formState
    };

    // Handle different actions
    if (action === 'save') {
      console.log('Saving junction:', formData);
      // After successful save, navigate back to the configuration junctions page
      onNavigate('configJunctions', { configId, configName });
    } else if (action === 'simulate') {
      console.log('Running simulation with:', formData);
      onNavigate('simulation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
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
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('save')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
            >
              <Save className="h-5 w-5" />
              <span>Save Design</span>
            </button>
            <button
              onClick={() => handleSubmit('simulate')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2 bg-gray-900 hover:bg-gray-800"
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