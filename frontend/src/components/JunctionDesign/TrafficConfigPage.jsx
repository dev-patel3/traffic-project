import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Save } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = ({ onNavigate, previousPage }) => {
  const [configName, setConfigName] = useState('');
  const [directionData, setDirectionData] = useState({
    Northbound: { total: 0, exits: {} },
    Eastbound: { total: 0, exits: {} },
    Southbound: { total: 0, exits: {} },
    Westbound: { total: 0, exits: {} }
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDirectionUpdate = (direction, data) => {
    setDirectionData(prev => ({
      ...prev,
      [direction]: data
    }));
  };

  const validateForm = () => {
    const newErrors = [];

    // Check configuration name
    if (!configName.trim()) {
      newErrors.push('Configuration name is required');
    }

    // Check traffic flows
    Object.entries(directionData).forEach(([direction, data]) => {
      // Check if total traffic flow is within bounds
      if (data.total < 0 || data.total > 2000) {
        newErrors.push(`${direction} traffic flow must be between 0 and 2000 VPH`);
      }

      // Check if exit flows sum up to total
      const exitSum = Object.values(data.exits).reduce((sum, val) => sum + val, 0);
      if (exitSum !== data.total) {
        newErrors.push(`${direction} exit flows must sum to total traffic flow`);
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
      const response = await fetch('http://localhost:5000/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          flows: {
            northbound: {
              total: directionData.Northbound.total,
              exits: directionData.Northbound.exits
            },
            eastbound: {
              total: directionData.Eastbound.total,
              exits: directionData.Eastbound.exits
            },
            southbound: {
              total: directionData.Southbound.total,
              exits: directionData.Southbound.exits
            },
            westbound: {
              total: directionData.Westbound.total,
              exits: directionData.Westbound.exits
            }
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        setErrors(data.errors || ['Validation failed']);
        setIsSubmitting(false);
        return;
      }

      // If validation successful, proceed to junction design
      onNavigate('junctionDesign');
    } catch (error) {
      setErrors(['Failed to validate configuration. Please try again.']);
      setIsSubmitting(false);
    }
  };

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
              <h2 className="text-lg font-medium">Configuration Name</h2>
              <Input
                placeholder="Name your traffic configuration"
                className="max-w-2xl"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                required
              />
            </div>
          </Card>

          <TrafficDirectionSection 
            direction="Northbound" 
            onUpdate={(data) => handleDirectionUpdate('Northbound', data)}
          />
          <TrafficDirectionSection 
            direction="Eastbound" 
            onUpdate={(data) => handleDirectionUpdate('Eastbound', data)}
          />
          <TrafficDirectionSection 
            direction="Southbound" 
            onUpdate={(data) => handleDirectionUpdate('Southbound', data)}
          />
          <TrafficDirectionSection 
            direction="Westbound" 
            onUpdate={(data) => handleDirectionUpdate('Westbound', data)}
          />
          
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
              <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TrafficConfigPage;