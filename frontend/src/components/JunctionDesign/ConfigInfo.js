import React from 'react';
import { Card } from '../ui/card';
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

const DirectionIndicator = ({ direction }) => {
  const icons = {
    Northbound: ArrowUp,
    Southbound: ArrowDown,
    Eastbound: ArrowRight,
    Westbound: ArrowLeft
  };
  const Icon = icons[direction];
  return <Icon className="h-5 w-5 text-gray-600" />;
};

const defaultConfig = {
  name: "Traffic Configuration Name",
  flows: {
    Northbound: 200,
    Southbound: 300,
    Eastbound: 200,
    Westbound: 300
  }
};

const ConfigInfo = () => {
  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">{defaultConfig.name}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(defaultConfig.flows).map(([direction, vph]) => (
            <div 
              key={direction} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">{direction}</span>
              <span className="text-sm font-medium text-blue-600">{vph} VPH</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Traffic Volume:</span>
            <span className="font-medium">
              {Object.values(defaultConfig.flows).reduce((sum, vph) => sum + vph, 0)} VPH
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfigInfo;