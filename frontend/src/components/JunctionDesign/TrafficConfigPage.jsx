import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = () => {
  const handleSave = () => {
    // when were ready we can handle saving logic here
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
          
          <div className="px-12 pb-12 flex justify-center">
            <button
              onClick={handleSave}
              className="px-8 py-3 text-white rounded-md"
              style={{ backgroundColor: '#313131' }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrafficConfigPage;