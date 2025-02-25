import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Save } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const DirectionInputs = ({ direction, values, onChange }) => {
  const exits = {
    Northbound: ['north', 'east', 'west'],
    Southbound: ['south', 'east', 'west'],
    Eastbound: ['east', 'north', 'south'],
    Westbound: ['west', 'north', 'south']
  };

  const handleExitChange = (exit, value) => {
    const newValues = {
      ...values,
      [`exit_${exit}`]: parseInt(value) || 0
    };
    onChange(newValues);
  };

  const calculateTotal = () => {
    return Object.entries(values)
      .filter(([key]) => key.startsWith('exit_'))
      .reduce((sum, [_, value]) => sum + (parseInt(value) || 0), 0);
  };

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded">
            Total: {calculateTotal()} VPH
          </span>
        </div>
        <div className="space-y-4">
          {exits[direction].map(exit => (
            <div key={exit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exiting {exit.charAt(0).toUpperCase() + exit.slice(1)}
              </label>
              <Input
                type="number"
                min="0"
                max="2000"
                value={values[`exit_${exit}`] || ''}
                onChange={(e) => handleExitChange(exit, e.target.value)}
                placeholder={`Enter vehicles per hour exiting ${exit}`}
                className="max-w-2xl"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const EditTrafficConfig = ({ configId, onNavigate }) => {
  console.log("EditTrafficConfig rendered with configId:", configId);
  const [configName, setConfigName] = useState('');
  const [directionData, setDirectionData] = useState({
    northbound: {},
    southbound: {},
    eastbound: {},
    westbound: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("Fetching config with ID:", configId);
        setLoading(true);
        
        // Get all traffic flows
        const response = await fetch('http://localhost:5000/api/traffic-flows');
        if (!response.ok) {
          throw new Error(`Failed to fetch configurations: ${response.status}`);
        }
        
        const configs = await response.json();
        const config = configs.find(c => c.id === configId);
        
        if (!config) {
          throw new Error(`Configuration with ID ${configId} not found`);
        }
        
        console.log("Found config:", config);
        
        setConfigName(config.name);
        
        // Initialize directionData based on the API response
        setDirectionData({
          northbound: {
            exit_north: Math.round(config.northVPH * 0.6),
            exit_east: Math.round(config.northVPH * 0.2),
            exit_west: Math.round(config.northVPH * 0.2)
          },
          southbound: {
            exit_south: Math.round(config.southVPH * 0.6),
            exit_east: Math.round(config.southVPH * 0.2),
            exit_west: Math.round(config.southVPH * 0.2)
          },
          eastbound: {
            exit_east: Math.round(config.eastVPH * 0.6),
            exit_north: Math.round(config.eastVPH * 0.2),
            exit_south: Math.round(config.eastVPH * 0.2)
          },
          westbound: {
            exit_west: Math.round(config.westVPH * 0.6),
            exit_north: Math.round(config.westVPH * 0.2),
            exit_south: Math.round(config.westVPH * 0.2)
          }
        });
      } catch (err) {
        console.error("Error loading configuration:", err);
        setError(`Error loading configuration: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (configId) {
      fetchConfig();
    }
  }, [configId]);

  const handleDirectionUpdate = (direction, newValues) => {
    setDirectionData(prev => ({
      ...prev,
      [direction.toLowerCase()]: newValues
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!configName.trim()) {
      errors.push('Configuration name is required');
    }

    // Validate total flows for each direction
    Object.entries(directionData).forEach(([direction, exits]) => {
      const total = Object.values(exits).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      if (total > 2000) {
        errors.push(`${direction} total flow exceeds 2000 VPH`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setError(formErrors.join(', '));
      return;
    }
  
    try {
      setSaving(true);
      
      // Step 1: Delete the existing configuration
      console.log("Deleting existing configuration:", configId);
      const deleteResponse = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete existing configuration: ${deleteResponse.status}`);
      }
      
      // Step 2: Create a new configuration with the updated data
      console.log("Creating new configuration with name:", configName);
      
      // Calculate totals for each direction
      const calculateTotal = (exits) => {
        return Object.values(exits).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      };
      
      // IMPORTANT: Use 'incoming' field instead of 'total'
      const createData = {
        name: configName,
        flows: {
          northbound: {
            incoming: calculateTotal(directionData.northbound),
            exits: directionData.northbound
          },
          southbound: {
            incoming: calculateTotal(directionData.southbound),
            exits: directionData.southbound
          },
          eastbound: {
            incoming: calculateTotal(directionData.eastbound),
            exits: directionData.eastbound
          },
          westbound: {
            incoming: calculateTotal(directionData.westbound),
            exits: directionData.westbound
          }
        }
      };
      
      console.log("Create data:", JSON.stringify(createData, null, 2));
      
      const createResponse = await fetch('http://localhost:5000/api/traffic-flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData)
      });
      
      const createResult = await createResponse.json();
      console.log("Create result:", createResult);
      
      if (!createResponse.ok || !createResult.success) {
        throw new Error(createResult.error || createResult.errors || `Create failed with status: ${createResponse.status}`);
      }
      
      console.log("Configuration successfully updated");
      onNavigate('saved');
    } catch (err) {
      console.error("Error updating configuration:", err);
      setError(`Error saving configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Edit Traffic Configuration</h2>
              <Input
                placeholder="Configuration name"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                className="max-w-2xl"
                required
              />
            </div>
          </Card>

          {['Northbound', 'Southbound', 'Eastbound', 'Westbound'].map(direction => (
            <DirectionInputs
              key={direction}
              direction={direction}
              values={directionData[direction.toLowerCase()]}
              onChange={(newValues) => handleDirectionUpdate(direction, newValues)}
            />
          ))}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onNavigate('saved')}
              className="px-6 py-3 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
              style={{ backgroundColor: '#313131' }}
              disabled={saving}
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditTrafficConfig;