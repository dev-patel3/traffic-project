import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import DirectionSection from './DirectionSection';

const NewJunctionDesign = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Traffic Configuration</span>
          </div>
          <h1 className="text-xl font-semibold">New Junction Design</h1>
          <div className="flex items-center space-x-1">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm">Help</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Configuration Details */}
          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Name of Configuration</h2>
              <Input 
                placeholder="Details of the Configuration. VPH, etc."
                className="max-w-2xl"
              />
            </div>
          </Card>

          {/* Junction Name */}
          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Junction Name</h2>
              <Input 
                placeholder="Name your junction design"
                className="max-w-2xl"
              />
            </div>
          </Card>

          {/* Road Directions */}
          <DirectionSection direction="Northbound" />
          <DirectionSection direction="Eastbound" />
          <DirectionSection direction="Southbound" />
          <DirectionSection direction="Westbound" />
        </div>
      </main>
    </div>
  );
};

export default NewJunctionDesign;