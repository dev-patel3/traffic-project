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

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
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
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`);
        if (!response.ok) throw new Error('Failed to fetch configuration');
        
        const data = await response.json();
        setConfigName(data.name);
        setDirectionData({
          northbound: data.flows.northbound.exits,
          southbound: data.flows.southbound.exits,
          eastbound: data.flows.eastbound.exits,
          westbound: data.flows.westbound.exits
        });
      } catch (err) {
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
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5000/api/traffic-flows/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          flows: {
            northbound: { exits: directionData.northbound },
            southbound: { exits: directionData.southbound },
            eastbound: { exits: directionData.eastbound },
            westbound: { exits: directionData.westbound }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update configuration');
      }

      const result = await response.json();
      if (result.success) {
        onNavigate('saved');  // Navigate back to saved configurations
      } else {
        throw new Error(result.error || 'Failed to update configuration');
      }
    } catch (err) {
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