import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

const TrafficDirectionSection = ({ direction, initialData = null, onUpdate }) => {
  const [incomingFlow, setIncomingFlow] = useState(initialData?.incoming_flow || 0);
  const [exitFlows, setExitFlows] = useState(initialData?.exits || {});
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setIncomingFlow(initialData.incoming_flow || 0);
      setExitFlows(initialData.exits || {});
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
        acc[`exit_${dir.toLowerCase()}`] = 0;
        return acc;
      }, {});
      setExitFlows(initialExits);
    }
  }, [direction]);

  useEffect(() => {
    onUpdate({
      incoming_flow: incomingFlow,
      exits: exitFlows
    });
  }, [incomingFlow, exitFlows, onUpdate]);

  const handleIncomingFlowChange = (e) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    if (value < 0 || value > 2000) {
      setError('Traffic flow must be between 0 and 2000 VPH');
    } else {
      setError('');
    }
    setIncomingFlow(value);
  };

  const handleExitFlowChange = (exitDir, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;

    const exitKey = `exit_${exitDir.toLowerCase()}`;
    const newExitFlows = {
      ...exitFlows,
      [exitKey]: numValue
    };
    setExitFlows(newExitFlows);

    const exitSum = Object.values(newExitFlows).reduce((sum, val) => sum + val, 0);
    if (exitSum > incomingFlow) {
      setError('Sum of exit flows cannot exceed total traffic flow');
    } else if (exitSum < incomingFlow) {
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
            Total Exits: {calculateExitTotal()} / {incomingFlow} vph
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incoming Traffic Flow (VPH)
            </label>
            <Input
              type="number"
              min="0"
              max="2000"
              value={incomingFlow}
              onChange={handleIncomingFlowChange}
              placeholder="Enter incoming traffic flow (0-2000 VPH)"
              className="max-w-2xl"
            />
          </div>

          {getExitDirections(direction).map((exitDir) => {
            const exitKey = `exit_${exitDir.toLowerCase()}`;
            return (
              <div key={exitDir}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exiting {exitDir}
                </label>
                <Input
                  type="number"
                  min="0"
                  max={incomingFlow}
                  value={exitFlows[exitKey] || 0}
                  onChange={(e) => handleExitFlowChange(exitDir, e.target.value)}
                  placeholder="0"
                  className="max-w-2xl"
                />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default TrafficDirectionSection;