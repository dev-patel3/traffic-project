import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResultBox = ({ value, label }) => (
  <div className="text-center p-4 bg-white rounded-lg shadow-sm space-y-2">
    <div className="text-3xl font-bold">{value}</div>
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

const JunctionPreview = () => (
  <div className="aspect-square w-full max-w-md mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
    <span className="text-gray-500 text-sm">Junction Preview</span>
  </div>
);

const SimulationPage = () => {
  const [currentDirection, setCurrentDirection] = useState('Northbound');
  
  const simulationData = {
    configName: "Morning Peak Traffic",
    junctionName: "City Center Junction",
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
        <div className="text-xl font-medium mb-6">
          {simulationData.configName} - {simulationData.junctionName}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section - Junction Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <JunctionPreview />
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
              <div className="flex-grow flex flex-col justify-between mb-4">
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
    </div>
  );
};

export default SimulationPage;