import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Save } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = ({ onNavigate, previousPage, editFlowId = null }) => {
  const [configName, setConfigName] = useState('');
  const [directionData, setDirectionData] = useState({
    northbound: { incoming_flow: 0, exits: {} },
    eastbound: { incoming_flow: 0, exits: {} },
    southbound: { incoming_flow: 0, exits: {} },
    westbound: { incoming_flow: 0, exits: {} }
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editFlowId);

  useEffect(() => {
    const fetchExistingConfig = async () => {
      if (!editFlowId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/traffic-flows/${editFlowId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }
        
        const data = await response.json();
        console.log("Fetched configuration:", data);
        
        // Set configuration name
        setConfigName(data.name || data.id);
        
        // Handle different possible data structures
        if (data.flows) {
          // New format with flows property
          setDirectionData({
            northbound: data.flows.northbound || { incoming_flow: 0, exits: {} },
            eastbound: data.flows.eastbound || { incoming_flow: 0, exits: {} },
            southbound: data.flows.southbound || { incoming_flow: 0, exits: {} },
            westbound: data.flows.westbound || { incoming_flow: 0, exits: {} }
          });
        } else {
          // Try to adapt from old format
          const directions = ['northbound', 'eastbound', 'southbound', 'westbound'];
          const adaptedData = {};
          
          directions.forEach(dir => {
            const totalFlow = data[`${dir}VPH`] || 0;
            // Create a distribution of exits if we have a total
            if (totalFlow > 0) {
              const exits = {};
              const exitDirs = getExitDirections(dir);
              const exitShare = Math.floor(totalFlow / exitDirs.length);
              
              exitDirs.forEach(exitDir => {
                exits[`exit_${exitDir.toLowerCase()}`] = exitShare;
              });
              
              // Adjust the last one to make sure they sum to total
              if (exitDirs.length > 0) {
                const lastDir = exitDirs[exitDirs.length - 1];
                exits[`exit_${lastDir.toLowerCase()}`] += totalFlow - (exitShare * exitDirs.length);
              }
              
              adaptedData[dir] = {
                incoming_flow: totalFlow,
                exits: exits
              };
            } else {
              adaptedData[dir] = { incoming_flow: 0, exits: {} };
            }
          });
          
          setDirectionData(adaptedData);
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        setErrors([`Failed to load configuration: ${error.message}`]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingConfig();
  }, [editFlowId]);

  // Helper function to get exit directions
  const getExitDirections = (direction) => {
    const dirMap = {
      'northbound': ['north', 'east', 'west'],
      'southbound': ['south', 'east', 'west'],
      'eastbound': ['east', 'north', 'south'],
      'westbound': ['west', 'north', 'south']
    };
    return dirMap[direction] || [];
  };

  const handleDirectionUpdate = (direction, data) => {
    setDirectionData(prev => ({
      ...prev,
      [direction.toLowerCase()]: data
    }));
  };

  const validateForm = () => {
    const newErrors = [];

    if (!configName.trim()) {
      newErrors.push('Configuration name is required');
    }

    Object.entries(directionData).forEach(([direction, data]) => {
      if (data.incoming_flow < 0 || data.incoming_flow > 2000) {
        newErrors.push(`${direction} traffic flow must be between 0 and 2000 VPH`);
      }

      const exitSum = Object.values(data.exits).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      if (Math.abs(exitSum - data.incoming_flow) > 1) { // Using small epsilon for float comparison
        newErrors.push(`${direction} exit flows (${exitSum}) must sum to incoming traffic flow (${data.incoming_flow})`);
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = editFlowId 
        ? `http://localhost:5000/api/traffic-flows/${editFlowId}`
        : 'http://localhost:5000/api/traffic-flows';
        
      const method = editFlowId ? 'PUT' : 'POST';

      const requestData = {
        name: configName,
        flows: directionData
      };

      console.log("Submitting data:", JSON.stringify(requestData, null, 2));

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!data.success) {
        setErrors(Array.isArray(data.errors) ? data.errors : [data.error || 'Save failed']);
        setIsSubmitting(false);
        return;
      }

      onNavigate('saved');
    } catch (error) {
      console.error("Error saving configuration:", error);
      setErrors(['Failed to save configuration. Please try again.']);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">
                {editFlowId ? 'Edit Traffic Configuration' : 'New Traffic Configuration'}
              </h2>
              <Input
                placeholder="Name your traffic configuration"
                className="max-w-2xl"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                required
              />
            </div>
          </Card>

          {['Northbound', 'Eastbound', 'Southbound', 'Westbound'].map(direction => (
            <TrafficDirectionSection 
              key={direction}
              direction={direction}
              initialData={directionData[direction.toLowerCase()]}
              onUpdate={(data) => handleDirectionUpdate(direction, data)}
            />
          ))}
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onNavigate(previousPage || 'home')}
              className="px-6 py-3 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
              style={{ backgroundColor: '#313131' }}
              disabled={isSubmitting}
            >
              <Save className="h-5 w-5" />
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : editFlowId 
                    ? 'Update Configuration' 
                    : 'Save Configuration'}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TrafficConfigPage;