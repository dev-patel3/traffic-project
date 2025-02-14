import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';

const DirectionSection = ({ direction }) => {
  const [isBusLaneEnabled, setIsBusLaneEnabled] = useState(false);
  const [transportType, setTransportType] = useState('');
  const [isLeftTurnEnabled, setIsLeftTurnEnabled] = useState(false);
  const [isPedestrianEnabled, setIsPedestrianEnabled] = useState(false);
  const [exitFlows, setExitFlows] = useState({
    northbound: 0,
    eastbound: 0,
    southbound: 0,
    westbound: 0
  });

  const getExitDirections = (currentDirection) => {
    const allDirections = ['Northbound', 'Eastbound', 'Southbound', 'Westbound'];
    return allDirections.filter(dir => dir !== getOppositeDirection(currentDirection));
  };

  const getOppositeDirection = (direction) => {
    const opposites = {
      'Northbound': 'Southbound',
      'Eastbound': 'Westbound',
      'Southbound': 'Northbound',
      'Westbound': 'Eastbound'
    };
    return opposites[direction];
  };

  const handleInputChange = (exitDir, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setExitFlows(prev => ({
      ...prev,
      [exitDir.toLowerCase()]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const calculateTotal = () => {
    return Object.values(exitFlows).reduce((sum, current) => sum + current, 0);
  };

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium">{direction} Road</h2>

        {/* Number of Lanes */}
        <div className="space-y-2">
          <Label>Number of Lanes</Label>
          <Input 
            type="number"
            defaultValue={0}
            min={0}
            max={5}
            placeholder="Maximum number of lanes is 5"
            className="max-w-2xl"
          />
        </div>

        {/* Left Turn Lane */}
        <div className="flex items-center justify-between max-w-2xl">
          <Label>Enable Left Turn Lane</Label>
          <Switch 
            checked={isLeftTurnEnabled}
            onCheckedChange={setIsLeftTurnEnabled}
            className="bg-gray-300 data-[state=checked]:bg-blue-600 [&>span]:bg-white" 
          />
        </div>

        {/* Bus/Bicycle Lane */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-2xl">
            <Label>Enable Bus/Bicycle Lane</Label>
            <Switch 
              checked={isBusLaneEnabled}
              onCheckedChange={setIsBusLaneEnabled}
              className="bg-gray-300 data-[state=checked]:bg-blue-600 [&>span]:bg-white" 
            />
          </div>
          {isBusLaneEnabled && (
            <div className="space-y-4">
              <div className="max-w-2xl">
                <Label className="mb-2 block">Select Transport Type</Label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select type</option>
                  <option value="bus">Bus Lane</option>
                  <option value="bicycle">Bicycle Lane</option>
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Traffic Flow</h3>
                  <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded">
                    Total: {calculateTotal()} vph
                  </span>
                </div>
                {getExitDirections(direction).map((exitDir) => (
                  <div key={exitDir}>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Exiting {exitDir}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={exitFlows[exitDir.toLowerCase()]}
                      onChange={(e) => handleInputChange(exitDir, e.target.value)}
                      placeholder="0"
                      className="max-w-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pedestrian Crossing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-2xl">
            <Label>Pedestrian Crossing</Label>
            <Switch 
              checked={isPedestrianEnabled}
              onCheckedChange={setIsPedestrianEnabled}
              className="bg-gray-300 data-[state=checked]:bg-blue-600 [&>span]:bg-white" 
            />
          </div>
          {isPedestrianEnabled && (
            <>
              <Input 
                type="number"
                defaultValue={0}
                min={0}
                placeholder="Duration of crossing time (in seconds)"
                className="max-w-2xl"
              />
              <Input 
                type="number"
                defaultValue={0}
                min={0}
                placeholder="Crossing requests per hour"
                className="max-w-2xl"
              />
            </>
          )}
        </div>

        {/* Traffic Priority */}
        <div className="space-y-2">
          <Label>Traffic Priority</Label>
          <Input 
            type="number"
            defaultValue={0}
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

export default DirectionSection;