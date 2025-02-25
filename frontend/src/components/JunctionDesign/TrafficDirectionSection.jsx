import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

const TrafficDirectionSection = ({ direction, initialData = null, onUpdate }) => {
  const [incomingFlow, setIncomingFlow] = useState(initialData?.incoming_flow || 0);
  const [exitFlows, setExitFlows] = useState(initialData?.exits || {});
  const [error, setError] = useState('');
  const [remainingFlow, setRemainingFlow] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);

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
    // Don't trigger the parent update during adjustments to prevent glitches
    if (!isAdjusting) {
      onUpdate({
        incoming_flow: incomingFlow,
        exits: exitFlows
      });
    }

    // Calculate remaining flow for distribution
    const totalExits = Object.values(exitFlows).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    setRemainingFlow(incomingFlow - totalExits);
  }, [incomingFlow, exitFlows, onUpdate, isAdjusting]);

  const handleIncomingFlowChange = (e) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    if (value < 0 || value > 2000) {
      setError('Traffic flow must be between 0 and 2000 VPH');
      return;
    } else {
      setError('');
    }
    
    setIsAdjusting(true);
    setIncomingFlow(value);
    
    // Adjust exit flows proportionally
    const currentTotal = Object.values(exitFlows).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    if (currentTotal > 0) {
      const ratio = value / currentTotal;
      const newExitFlows = {};
      
      // Distribute the remaining amount proportionally
      let distributableFlow = value;
      const exitKeys = Object.keys(exitFlows);
      
      for (let i = 0; i < exitKeys.length; i++) {
        const exitKey = exitKeys[i];
        
        if (i === exitKeys.length - 1) {
          // For the last exit, assign all remaining flow
          newExitFlows[exitKey] = Math.max(0, distributableFlow);
        } else {
          // For other exits, assign proportionally
          const adjustedValue = Math.max(0, Math.round(exitFlows[exitKey] * ratio));
          newExitFlows[exitKey] = adjustedValue;
          distributableFlow -= adjustedValue;
        }
      }
      
      setExitFlows(newExitFlows);
    }
    
    // Delay ending the adjustment to prevent glitches
    setTimeout(() => {
      setIsAdjusting(false);
    }, 50);
  };

  const handleSliderChange = (value) => {
    const newValue = parseInt(value[0] || 0);
    handleIncomingFlowChange({ target: { value: newValue } });
  };

  const handleExitFlowChange = (exitDir, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    const exitKey = `exit_${exitDir.toLowerCase()}`;
    
    setIsAdjusting(true);
    
    // Create a new exits object to avoid mutating state directly
    const newExitFlows = { ...exitFlows, [exitKey]: numValue };
    
    // Calculate the total of all exits with the new value
    const newTotal = Object.values(newExitFlows).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    
    // Validate if the new total exceeds incoming flow
    if (newTotal > incomingFlow) {
      setError(`Exit flows cannot exceed total incoming flow of ${incomingFlow}`);
      
      // Try to adjust other exits down to make room for this change
      if (incomingFlow > 0) {
        const otherExits = Object.keys(newExitFlows).filter(key => key !== exitKey);
        
        if (otherExits.length > 0) {
          const excessFlow = newTotal - incomingFlow;
          let remainingExcess = excessFlow;
          
          // Try to reduce other exits proportionally
          for (let i = 0; i < otherExits.length; i++) {
            const otherKey = otherExits[i];
            const currentValue = newExitFlows[otherKey];
            
            if (i === otherExits.length - 1) {
              // Last exit gets whatever adjustment is still needed
              newExitFlows[otherKey] = Math.max(0, currentValue - remainingExcess);
            } else {
              // Calculate proportional reduction
              const reduction = Math.min(currentValue, Math.ceil(excessFlow * (currentValue / (newTotal - numValue))));
              newExitFlows[otherKey] = currentValue - reduction;
              remainingExcess -= reduction;
            }
          }
          
          // If we couldn't reduce other exits enough, cap this exit
          if (Object.values(newExitFlows).reduce((sum, val) => sum + val, 0) > incomingFlow) {
            newExitFlows[exitKey] = numValue - (Object.values(newExitFlows).reduce((sum, val) => sum + val, 0) - incomingFlow);
          }
        } else {
          // If this is the only exit, cap it at incoming flow
          newExitFlows[exitKey] = incomingFlow;
        }
      } else {
        // If incoming flow is 0, cap all exits at 0
        Object.keys(newExitFlows).forEach(key => {
          newExitFlows[key] = 0;
        });
      }
    } else {
      setError('');
    }
    
    setExitFlows(newExitFlows);
    
    // Delay ending the adjustment to prevent glitches
    setTimeout(() => {
      setIsAdjusting(false);
    }, 50);
  };

  const handleExitSliderChange = (exitDir, value) => {
    const numValue = parseInt(value[0] || 0);
    handleExitFlowChange(exitDir, numValue);
  };

  const calculateExitTotal = () => {
    return Object.values(exitFlows).reduce((sum, current) => sum + (parseInt(current) || 0), 0);
  };

  return (
    <Card className="p-6 shadow-sm bg-white border-gray-100">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{direction} Traffic Flow</h2>
          <span className={`text-sm font-medium px-3 py-1 rounded ${
            Math.abs(calculateExitTotal() - incomingFlow) <= 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            Total Exits: {calculateExitTotal()} / {incomingFlow} vph
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Incoming Traffic Flow (VPH)
            </Label>
            <div className="space-y-4">
              <Input
                type="number"
                min="0"
                max="2000"
                value={incomingFlow}
                onChange={handleIncomingFlowChange}
                placeholder="Enter incoming traffic flow (0-2000 VPH)"
                className="max-w-2xl"
              />
              <div className="pt-2 pb-4 px-1 max-w-2xl">
                <Slider
                  defaultValue={[incomingFlow]}
                  value={[incomingFlow]}
                  max={2000}
                  step={10}
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>500</span>
                  <span>1000</span>
                  <span>1500</span>
                  <span>2000</span>
                </div>
              </div>
            </div>
          </div>

          {getExitDirections(direction).map((exitDir) => {
            const exitKey = `exit_${exitDir.toLowerCase()}`;
            return (
              <div key={exitDir}>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Exiting {exitDir}
                </Label>
                <div className="space-y-4">
                  <Input
                    type="number"
                    min="0"
                    max={incomingFlow}
                    value={exitFlows[exitKey] || 0}
                    onChange={(e) => handleExitFlowChange(exitDir, e.target.value)}
                    placeholder="0"
                    className="max-w-2xl"
                  />
                  <div className="pt-2 pb-4 px-1 max-w-2xl">
                    <Slider
                      defaultValue={[exitFlows[exitKey] || 0]}
                      value={[exitFlows[exitKey] || 0]}
                      max={incomingFlow}
                      step={5}
                      onValueChange={(value) => handleExitSliderChange(exitDir, value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {Math.abs(remainingFlow) > 1 && (
            <div className={`text-sm font-medium rounded-md p-2 ${
              remainingFlow > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
            }`}>
              {remainingFlow > 0 
                ? `${remainingFlow} VPH unallocated. Please distribute to exit routes.` 
                : `Exit flows exceed incoming flow by ${Math.abs(remainingFlow)} VPH. Please adjust.`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TrafficDirectionSection;