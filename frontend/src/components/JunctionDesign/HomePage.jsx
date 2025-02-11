import React from 'react';
import { Card } from '../ui/card';
import { HelpCircle, Plus, FolderOpen } from 'lucide-react';

const JunctionPlaceholder = () => (
  <div className="aspect-square w-full max-w-md mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
    <span className="text-gray-500 text-sm">Junction Simulation Preview</span>
  </div>
);

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Traffic Junction Modeler</h1>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('saved')}
              className="flex items-center space-x-1 hover:text-gray-600"
            >
              <FolderOpen className="h-5 w-5" />
              <span className="text-sm">Saved Configurations</span>
            </button>
            <div className="flex items-center space-x-1">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Help</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card className="shadow-sm bg-white border-gray-100">
          {/* Create New Configuration Section */}
          <div 
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => onNavigate('traffic')}
          >
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-100 p-2">
                <Plus className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New Traffic Configuration</h3>
                <p className="text-sm text-gray-500">Create a new traffic configuration to test optimal junction layouts</p>
              </div>
            </div>
          </div>

          {/* Junction Placeholder Section */}
          <div className="p-12">
            <JunctionPlaceholder />
          </div>

          {/* Get Started Button */}
          <div className="px-12 pb-12 flex justify-center">
            <button
              onClick={() => onNavigate('traffic')}
              className="px-8 py-3 text-white rounded-md"
              style={{ backgroundColor: '#313131' }}
            >
              Get Started
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HomePage;