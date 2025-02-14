import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle, Save, PlayCircle } from 'lucide-react';
import DirectionSection from './DirectionSection';

const NewJunctionDesign = ( {onNavigate} ) => {
  const handleJunctionSave = () => {
    // when we're ready we can handle saving logic here
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Configuration Details */}
          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Traffic Configuration Name</h2>
              <div className="text-gray-600">
                Northbound VPH: 200 (North: 120, East: 40, West: 40)<br/>
                Southbound VPH: 300 (South: 180, East: 60, West: 60)<br/>
                Eastbound VPH: 200 (East: 120, North: 40, South: 40)<br/>
                Westbound VPH: 300 (West: 180, North: 60, South: 60)
              </div>
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

   {/* Action Buttons */}
   <div className="flex justify-end space-x-4">
            <button
              onClick={() => onNavigate('junctionSaved')}
              className="px-8 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleJunctionSave}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2"
              style={{ backgroundColor: '#313131' }}
            >
              <Save className="h-5 w-5" />
              <span>Save Design</span>
            </button>
            <button
              onClick={() => onNavigate('simulation')}
              className="px-8 py-3 text-white rounded-md flex items-center space-x-2"
              style={{ backgroundColor: '#313131' }}
            >
              <PlayCircle className="h-5 w-5" />
              <span>Run Simulation</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewJunctionDesign;