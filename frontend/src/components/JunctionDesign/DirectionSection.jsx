import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';

const DirectionSection = ({ direction }) => (
  <Card className="p-6 shadow-sm bg-white border-gray-100">
    <div className="space-y-6">
      <h2 className="text-lg font-medium">{direction} Road</h2>

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
);

export default DirectionSection;