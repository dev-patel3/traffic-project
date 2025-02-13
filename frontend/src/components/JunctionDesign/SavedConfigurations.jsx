import React from 'react';
import { ChevronLeft, HelpCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';

const SavedConfigurations = ({ onNavigate }) => {
  const configurations = [
    {
      id: 1,
      name: 'Configuration Name 1',
      details: 'Northbound VPH: 200, Southbound VPH: 300, Eastbound VPH: 200, Westbound VPH: 300. Saved Junctions: 2'
    },
    {
      id: 2,
      name: 'Configuration Name 1',
      details: 'Northbound VPH: 200, Southbound VPH: 300, Eastbound VPH: 200, Westbound VPH: 300. Saved Junctions: 2'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Create New Button */}
          <Card 
            className="p-6 shadow-sm bg-white border-gray-100 hover:bg-gray-50 cursor-pointer"
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
          </Card>

          {/* Saved Configurations */}
          {configurations.map((config) => (
            <Card key={config.id} className="p-6 shadow-sm bg-white border-gray-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{config.name}</h3>
                  <p className="text-sm text-gray-500">{config.details}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedConfigurations;