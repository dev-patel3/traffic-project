import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';

const NewJunctionDesign = () => {
  return (
    <div className="min-h-screen bg-slate-50">
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
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Name of Configuration</h2>
              <Input 
                placeholder="Details of the Configuration. VPH, etc."
                className="max-w-2xl"
              />
            </div>
          </Card>

          {/* Junction Name */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Junction Name</h2>
              <Input 
                placeholder="Name your junction design"
                className="max-w-2xl"
              />
            </div>
          </Card>

          {/* Northbound Road Settings */}
          <Card className="p-6">
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Northbound Road</h2>

              {/* Number of Lanes */}
              <div className="space-y-2">
                <Label>Number of Lanes</Label>
                <Input 
                  placeholder="Maximum number of lanes is 5"
                  className="max-w-2xl"
                />
              </div>

              {/* Left Turn Lane */}
              <div className="flex items-center justify-between max-w-2xl">
                <Label>Enable Left Turn Lane</Label>
                <Switch />
              </div>

              {/* Bus/Bicycle Lane */}
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-2xl">
                  <Label>Enable Bus/Bicycle Lane</Label>
                  <Switch />
                </div>
                <Input 
                  placeholder="Buses/Bicycles per hour"
                  className="max-w-2xl"
                />
              </div>

              {/* Pedestrian Crossing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-2xl">
                  <Label>Pedestrian Crossing</Label>
                  <Switch />
                </div>
                <Input 
                  placeholder="Duration of crossing time (in seconds)"
                  className="max-w-2xl"
                />
                <Input 
                  placeholder="Crossing requests per hour"
                  className="max-w-2xl"
                />
              </div>

              {/* Traffic Priority */}
              <div className="space-y-2">
                <Label>Traffic Priority</Label>
                <Input 
                  placeholder="Priority level: 0 (no priority) to 4 (highest priority)"
                  className="max-w-2xl"
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewJunctionDesign;