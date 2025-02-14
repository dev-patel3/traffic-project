import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

const TrafficDirectionSection = ({ direction }) => {
  const getExitDirections = (currentDirection) => {
    const allDirections = ['North', 'East', 'South', 'West'];
    return allDirections.filter(dir => dir !== getOppositeDirection(currentDirection));
  };

  const getOppositeDirection = (direction) => {
    const opposites = {
      'Northbound': 'South',
      'Eastbound': 'West',
      'Southbound': 'North',
      'Westbound': 'East'
    };
    return opposites[direction];
  };

  const initialExitFlows = getExitDirections(direction).reduce((acc, dir) => {
    acc[dir] = 0;
    return acc;
  }, {});

  const [exitFlows, setExitFlows] = useState(initialExitFlows);

  const handleInputChange = (exitDir, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setExitFlows(prev => ({
      ...prev,
      [exitDir]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const calculateTotal = () => {
    return Object.values(exitFlows).reduce((sum, current) => sum + current, 0);
  };

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded">
            Total: {calculateTotal()} vph
          </span>
        </div>
        <div className="space-y-4">
          {getExitDirections(direction).map((exitDir) => (
            <div key={exitDir}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exiting {exitDir}
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                className="max-w-2xl"
                value={exitFlows[exitDir]}
                onChange={(e) => handleInputChange(exitDir, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TrafficDirectionSection;