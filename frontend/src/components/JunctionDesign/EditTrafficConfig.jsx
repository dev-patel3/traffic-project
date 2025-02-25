import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Save } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

const DirectionInputs = ({ direction, values, onChange }) => {
  const [error, setError] = useState('');
  const [remainingFlow, setRemainingFlow] = useState(0);

  const exits = {
    Northbound: ['north', 'east', 'west'],
    Southbound: ['south', 'east', 'west'],
    Eastbound: ['east', 'north', 'south'],
    Westbound: ['west', 'north', 'south']
  };

  useEffect(() => {
    // Calculate remaining flow for distribution
    const totalExits = Object.entries(values)
      .filter(([key]) => key.startsWith('exit_'))
      .reduce((sum, [_, val]) => sum + (parseInt(val) || 0), 0);
    
    setRemainingFlow(calculateTotal() - totalExits);
  }, [values]);

  const handleExitChange = (exit, value) => {
    const numValue = parseInt(value) || 0;
    
    // Calculate the current total of all other exits
    const otherExitsTotal = Object.entries(values)
      .filter(([key]) => key.startsWith('exit_') && key !== `exit_${exit}`)
      .reduce((sum, [_, val]) => sum + (parseInt(val) || 0), 0);
    
    // Don't allow values that would make total exceed 2000
    if (numValue + otherExitsTotal > 2000) {
      setError(`Exit flows cannot exceed 2000 VPH`);
      return;
    }

    const newValues = {
      ...values,
      [`exit_${exit}`]: numValue
    };
    
    setError('');
    onChange(newValues);
  };

  const handleSliderChange = (exit, sliderValue) => {
    const numValue = parseInt(sliderValue[0] || 0);
    handleExitChange(exit, numValue);
  };

  const calculateTotal = () => {
    return Object.entries(values)
      .filter(([key]) => key.startsWith('exit_'))
      .reduce((sum, [_, value]) => sum + (parseInt(value) || 0), 0);
  };

  const total = calculateTotal();

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
          <span className={`text-sm font-medium px-3 py-1 rounded ${
            total <= 2000 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            Total: {total} VPH
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-6">
          {exits[direction].map(exit => (
            <div key={exit}>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Exiting {exit.charAt(0).toUpperCase() + exit.slice(1)}
              </Label>
              <div className="space-y-4">
                <Input
                  type="number"
                  min="0"
                  max="2000"
                  value={values[`exit_${exit}`] || ''}
                  onChange={(e) => handleExitChange(exit, e.target.value)}
                  placeholder={`Enter vehicles per hour exiting ${exit}`}
                  className="max-w-2xl"
                />
                <div className="pt-2 pb-4 px-1 max-w-2xl">
                  <Slider
                    defaultValue={[values[`exit_${exit}`] || 0]}
                    value={[values[`exit_${exit}`] || 0]}
                    max={2000}
                    step={5}
                    onValueChange={(value) => handleSliderChange(exit, value)}
                  />
                </div>
              </div>
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
        
        // Fetch specific traffic flow by ID
        const response = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch configuration: ${response.status}`);
        }
        
        const config = await response.json();
        
        console.log("Found config:", config);
        
        setConfigName(config.name || config.id);
        
        // Handle different possible data structures
        if (config.flows) {
          // New format with flows property
          const newDirectionData = {};
          
          ['northbound', 'southbound', 'eastbound', 'westbound'].forEach(dir => {
            if (config.flows[dir]) {
              newDirectionData[dir] = config.flows[dir].exits || {};
            } else {
              newDirectionData[dir] = {};
            }
          });
          
          setDirectionData(newDirectionData);
        } else {
          // Legacy format - create exits based on total traffic
          const directions = [
            { key: 'northbound', total: config.northVPH || 0, exits: ['north', 'east', 'west'] },
            { key: 'southbound', total: config.southVPH || 0, exits: ['south', 'east', 'west'] },
            { key: 'eastbound', total: config.eastVPH || 0, exits: ['east', 'north', 'south'] },
            { key: 'westbound', total: config.westVPH || 0, exits: ['west', 'north', 'south'] }
          ];
          
          const newDirectionData = {};
          
          directions.forEach(({ key, total, exits }) => {
            const exitData = {};
            if (total > 0) {
              const mainExitShare = Math.round(total * 0.6);
              const otherExitShare = Math.round((total - mainExitShare) / 2);
              
              exitData[`exit_${exits[0]}`] = mainExitShare;
              exitData[`exit_${exits[1]}`] = otherExitShare;
              exitData[`exit_${exits[2]}`] = total - mainExitShare - otherExitShare; // Ensure they sum to total
            }
            newDirectionData[key] = exitData;
          });
          
          setDirectionData(newDirectionData);
        }
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
      
      // Prepare data according to new format
      const newConfig = {
        name: configName,
        flows: {}
      };
      
      // Calculate incoming flow and format exits for each direction
      Object.entries(directionData).forEach(([direction, exits]) => {
        const incoming_flow = Object.values(exits).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        
        newConfig.flows[direction] = {
          incoming_flow: incoming_flow,
          exits: exits
        };
      });
      
      console.log("Submitting updated configuration:", JSON.stringify(newConfig, null, 2));
      
      // Send PUT request with the updated data
      const response = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig)
      });
      
      const result = await response.json();
      console.log("Update result:", result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors || `Update failed with status: ${response.status}`);
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
              <Label htmlFor="config-name">Configuration Name</Label>
              <Input
                id="config-name"
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