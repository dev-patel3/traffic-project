import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle,Save } from 'lucide-react';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = ({ onNavigate }) => {
  const handleSave = () => {
    // when were ready we can handle saving logic here
    onNavigate ('junctionDesign')
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="p-6 shadow-sm bg-white border-gray-100">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Configuration Name</h2>
              <Input
                placeholder="Name your traffic configuration"
                className="max-w-2xl"
              />
            </div>
          </Card>
          <TrafficDirectionSection direction="Northbound" />
          <TrafficDirectionSection direction="Eastbound" />
          <TrafficDirectionSection direction="Southbound" />
          <TrafficDirectionSection direction="Westbound" />
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 text-white rounded-md flex items-center space-x-2"
              style={{ backgroundColor: '#313131' }}
            >
              <Save className="h-5 w-5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrafficConfigPage;