import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

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

const ConfigInfo = ({ configId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        let response;
        
        if (configId) {
          // Fetch specific configuration
          response = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`);
        } else {
          // Fetch all configurations and use the first one
          response = await fetch('http://localhost:5000/api/traffic-flows');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }

        let data = await response.json();
        
        if (!configId && Array.isArray(data)) {
          // If fetching all configs, use the first one
          data = data[0];
        }

        // Transform the data to match the expected format
        const transformedData = {
          name: data.name,
          flows: {
            Northbound: data.northVPH || Object.values(data.northbound || {}).reduce((sum, val) => sum + val, 0),
            Southbound: data.southVPH || Object.values(data.southbound || {}).reduce((sum, val) => sum + val, 0),
            Eastbound: data.eastVPH || Object.values(data.eastbound || {}).reduce((sum, val) => sum + val, 0),
            Westbound: data.westVPH || Object.values(data.westbound || {}).reduce((sum, val) => sum + val, 0)
          }
        };

        setConfigData(transformedData);
      } catch (err) {
        console.error('Raw error:', err);
        setError(`Error loading configuration: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [configId]);

  if (loading) {
    return (
      <Card className="p-6 shadow-sm bg-white border-gray-100">
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-600">Loading configuration...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!configData) {
    return (
      <Card className="p-6 shadow-sm bg-white border-gray-100">
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-600">No configuration available</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">{configData.name}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(configData.flows).map(([direction, vph]) => (
            <div
              key={direction}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <DirectionIndicator direction={direction} />
                <span className="text-sm font-medium text-gray-700">{direction}</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{vph} VPH</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Traffic Volume:</span>
            <span className="font-medium">
              {Object.values(configData.flows).reduce((sum, vph) => sum + vph, 0)} VPH
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfigInfo;