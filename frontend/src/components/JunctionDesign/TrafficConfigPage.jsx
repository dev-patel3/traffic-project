import React from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import TrafficDirectionSection from './TrafficDirectionSection';

const TrafficConfigPage = () => {
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
        </div>
      </main>
    </div>
  );
};

export default TrafficConfigPage;