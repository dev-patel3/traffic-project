import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Maximize2, X } from 'lucide-react';
import { Card } from '../ui/card';
import JunctionVisualization from './JunctionVisualization';

const ResultBox = ({ value, label }) => (
  <div className="text-center p-4 bg-white rounded-lg shadow-sm flex flex-col justify-center items-center h-28">
    <div className="text-3xl font-bold mb-2">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const DirectionSelector = ({ currentDirection, onDirectionChange }) => {
  const directions = ['Northbound', 'Eastbound', 'Southbound', 'Westbound'];
  const currentIndex = directions.indexOf(currentDirection);

  const goNext = () => {
    const nextIndex = (currentIndex + 1) % directions.length;
    onDirectionChange(directions[nextIndex]);
  };

  const goPrevious = () => {
    const prevIndex = (currentIndex - 1 + directions.length) % directions.length;
    onDirectionChange(directions[prevIndex]);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mt-4">
      <button 
        onClick={goPrevious}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="text-lg font-medium">{currentDirection}</div>
      <button 
        onClick={goNext}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

const JunctionSimulation = ({ onNavigate }) => {
  const [currentDirection, setCurrentDirection] = useState('Northbound');
  const [showFullVisualization, setShowFullVisualization] = useState(false);

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showFullVisualization) {
        setShowFullVisualization(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    
    // Prevent scrolling when in full screen
    if (showFullVisualization) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [showFullVisualization]);

  // Preset junction configuration (using the format matching what would be received from the backend)
  const sampleJunctionConfig = {
    name: "Example Junction Name",
    traffic_flow_config: "Traffic Config Name",
    northbound: {
      num_lanes: 3,
      enable_left_turn_lane: true,
      enable_bus_cycle_lane: true,
      transport_type: 'bus',
      pedestrian_crossing_duration: 15,
      pedestrian_crossing_requests_per_hour: 30,
      traffic_priority: 3
    },
    southbound: {
      num_lanes: 3,
      enable_left_turn_lane: true,
      enable_bus_cycle_lane: false,
      pedestrian_crossing_duration: 15,
      pedestrian_crossing_requests_per_hour: 30,
      traffic_priority: 3
    },
    eastbound: {
      num_lanes: 2,
      enable_left_turn_lane: true,
      enable_bus_cycle_lane: false,
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 20,
      traffic_priority: 2
    },
    westbound: {
      num_lanes: 2,
      enable_left_turn_lane: true,
      enable_bus_cycle_lane: true,
      transport_type: 'bicycle',
      pedestrian_crossing_duration: 10,
      pedestrian_crossing_requests_per_hour: 20,
      traffic_priority: 2
    }
  };
  
  // Using placeholder data for simulation results
  const simulationData = {
    results: {
      Northbound: {
        avgWaitTime: "2:50",
        maxWaitTime: "4:30",
        maxQueueTime: "3:15"
      },
      Southbound: {
        avgWaitTime: "2:30",
        maxWaitTime: "4:00",
        maxQueueTime: "3:00"
      },
      Eastbound: {
        avgWaitTime: "2:40",
        maxWaitTime: "4:15",
        maxQueueTime: "3:10"
      },
      Westbound: {
        avgWaitTime: "2:45",
        maxWaitTime: "4:20",
        maxQueueTime: "3:20"
      }
    },
    scores: {
      efficiency: 95,
      sustainability: 88,
      average: 92
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-[1920px] mx-auto px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-medium">
            {sampleJunctionConfig.traffic_flow_config} - {sampleJunctionConfig.name}
          </div>
          <button
            onClick={() => onNavigate('junctionSaved')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Junctions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section - Junction Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Cropped visualization with expand button */}
              <div className="cropped-visualization">
                <button 
                  className="expand-button"
                  onClick={() => setShowFullVisualization(true)}
                  aria-label="Expand visualization"
                >
                  <Maximize2 size={20} />
                </button>
                <JunctionVisualization junctionConfig={sampleJunctionConfig} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ResultBox value={`${simulationData.scores.efficiency}%`} label="Efficiency Score" />
              <ResultBox value={`${simulationData.scores.sustainability}%`} label="Sustainability Score" />
              <ResultBox value={`${simulationData.scores.average}%`} label="Average Score" />
            </div>
          </div>

          {/* Right section - Results */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Results</h2>
              <div className="flex-grow flex flex-col justify-between gap-4">
                <ResultBox 
                  value={simulationData.results[currentDirection].avgWaitTime} 
                  label="Average Wait Time" 
                />
                <ResultBox 
                  value={simulationData.results[currentDirection].maxWaitTime} 
                  label="Maximum Wait Time" 
                />
                <ResultBox 
                  value={simulationData.results[currentDirection].maxQueueTime} 
                  label="Maximum Queue Time" 
                />
              </div>
              <DirectionSelector 
                currentDirection={currentDirection}
                onDirectionChange={setCurrentDirection}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Full-screen visualization modal */}
      {showFullVisualization && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-medium">Junction Visualization</h2>
              <button 
                className="close-button" 
                onClick={() => setShowFullVisualization(false)}
                aria-label="Close full view"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <JunctionVisualization junctionConfig={sampleJunctionConfig} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JunctionSimulation;