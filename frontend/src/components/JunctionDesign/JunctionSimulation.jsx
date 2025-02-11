import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

const ResultsDisplay = ({ direction, results }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm space-y-4">
    <h3 className="text-lg font-medium">{direction} Results</h3>
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Average Wait Time</span>
          <span className="text-2xl font-bold">{results.avgWaitTime}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Maximum Wait Time</span>
          <span className="text-2xl font-bold">{results.maxWaitTime}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Maximum Queue Time</span>
          <span className="text-2xl font-bold">{results.maxQueueTime}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const ScoreCard = ({ score, label }) => (
  <div className="text-center p-4 bg-white rounded-lg shadow-sm space-y-2">
    <div className="text-3xl font-bold">{score}%</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const JunctionPreview = () => (
  <div className="aspect-square w-full max-w-md mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
    <span className="text-gray-500 text-sm">Junction Preview</span>
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="h-5 w-5 cursor-pointer" />
            <span className="text-sm font-medium">Back to Junction Configuration</span>
          </div>
          <h1 className="text-xl font-semibold">Junction Simulation</h1>
          <div className="flex items-center space-x-1">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm">Help</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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
              <ScoreCard score={simulationData.scores.efficiency} label="Efficiency Score" />
              <ScoreCard score={simulationData.scores.sustainability} label="Sustainability Score" />
              <ScoreCard score={simulationData.scores.average} label="Average Score" />
            </div>
          </div>

          {/* Right section - Results */}
          <div>
            <ResultsDisplay 
              direction={currentDirection} 
              results={simulationData.results[currentDirection]} 
            />
            <DirectionSelector 
              currentDirection={currentDirection}
              onDirectionChange={setCurrentDirection}
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default SimulationPage;