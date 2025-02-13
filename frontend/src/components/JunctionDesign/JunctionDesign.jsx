import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import DirectionSection from './DirectionSection';

const NewJunctionDesign = () => {
  return (
    <div className="min-h-screen bg-gray-100">

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