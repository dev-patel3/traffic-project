import React from 'react';
import { ChevronLeft, Edit2, HelpCircle, Plus } from 'lucide-react';
import { Card } from '../ui/card';

const SavedJunctionsPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:text-gray-600"
            onClick={() => onNavigate('saved')}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Back to Saved Configurations</span>
          </div>
          <h1 className="text-xl font-semibold">Traffic Configuration Name</h1>
          <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-600">
            <HelpCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm">Help</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Traffic Data Overview */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Northbound VPH</h3>
              <p className="text-2xl font-semibold">200</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Southbound VPH</h3>
              <p className="text-2xl font-semibold">200</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Eastbound VPH</h3>
              <p className="text-2xl font-semibold">200</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Westbound VPH</h3>
              <p className="text-2xl font-semibold">200</p>
            </div>
          </div>
        </Card>

        {/* Junction Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Junction 1 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Junction Name 1</h3>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Junction Preview</span>
              </div>
              <button className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50">
                Run Simulation
              </button>
            </div>
          </Card>

          {/* Junction 2 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Junction Name 2</h3>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Junction Preview</span>
              </div>
              <button className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50">
                Run Simulation
              </button>
            </div>
          </Card>

          {/* Add New Junction Card */}
          <Card 
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => onNavigate('junctionDesign')}
          >
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-gray-100 p-3">
                <Plus className="h-6 w-6 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Add New Junction Design</span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SavedJunctionsPage;