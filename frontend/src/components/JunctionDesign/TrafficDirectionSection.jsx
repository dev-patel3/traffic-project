import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

const TrafficDirectionSection = ({ direction, initialData = null, onUpdate }) => {
  const [totalFlow, setTotalFlow] = useState(initialData?.total || 0);
  const [exitFlows, setExitFlows] = useState(initialData?.exits || {});
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTotalFlow(initialData.total);
      setExitFlows(initialData.exits);
    }
  }, [initialData]);

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

  useEffect(() => {
    // Initialize exit flows if not set
    if (Object.keys(exitFlows).length === 0) {
      const initialExits = getExitDirections(direction).reduce((acc, dir) => {
        acc[dir.toLowerCase()] = 0;
        return acc;
      }, {});
      setExitFlows(initialExits);
    }
  }, [direction]);

  useEffect(() => {
    onUpdate({
      total: totalFlow,
      exits: exitFlows
    });
  }, [totalFlow, exitFlows, onUpdate]);

  const handleTotalFlowChange = (e) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    if (value < 0 || value > 2000) {
      setError('Traffic flow must be between 0 and 2000 VPH');
    } else {
      setError('');
    }
    setTotalFlow(value);
  };

  const handleExitFlowChange = (exitDir, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;

    const newExitFlows = {
      ...exitFlows,
      [exitDir.toLowerCase()]: numValue
    };
    setExitFlows(newExitFlows);

    const exitSum = Object.values(newExitFlows).reduce((sum, val) => sum + val, 0);
    if (exitSum > totalFlow) {
      setError('Sum of exit flows cannot exceed total traffic flow');
    } else if (exitSum < totalFlow) {
      setError('Sum of exit flows must equal total traffic flow');
    } else {
      setError('');
    }
  };

  const calculateExitTotal = () => {
    return Object.values(exitFlows).reduce((sum, current) => sum + current, 0);
  };

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded">
            Total Exits: {calculateExitTotal()} / {totalFlow} vph
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Traffic Flow (VPH)
            </label>
            <Input
              type="number"
              min="0"
              max="2000"
              value={totalFlow}
              onChange={handleTotalFlowChange}
              placeholder="Enter total traffic flow (0-2000 VPH)"
              className="max-w-2xl"
            />
          </div>

          {getExitDirections(direction).map((exitDir) => (
            <div key={exitDir}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exiting {exitDir}
              </label>
              <Input
                type="number"
                min="0"
                max={totalFlow}
                value={exitFlows[exitDir.toLowerCase()] || initialData?.exits[exitDir.toLowerCase()] || 0}
                onChange={(e) => handleExitFlowChange(exitDir, e.target.value)}
                placeholder="0"
                className="max-w-2xl"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TrafficDirectionSection;