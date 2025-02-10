import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </div>
          <h1 className="text-xl font-semibold">New Traffic Configuration</h1>
          <div className="flex items-center space-x-1">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm">Help</span>
          </div>
        </div>
      </header>

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
        </div>
      </main>
    </div>
  );
};

export default TrafficConfigPage;