import React from 'react';
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

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
        <div className="space-y-4">
          {getExitDirections(direction).map((exitDir) => (
            <div key={exitDir}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exiting {exitDir}
              </label>
              <Input
                placeholder={`Total traffic headed ${exitDir}`}
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