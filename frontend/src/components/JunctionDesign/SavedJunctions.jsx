import React, { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import ConfigInfo from './ConfigInfo';

const SavedJunctionsPage = ({ onNavigate }) => {
  const [deleteInProgress, setDeleteInProgress] = useState(null);

  const handleDelete = async (junctionId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this junction?')) return;

    try {
      setDeleteInProgress(junctionId);
      const response = await fetch(`http://localhost:5000/api/junctions/${junctionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete junction');
      
      // Refresh the list after deletion
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete junction:', err);
    } finally {
      setDeleteInProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Traffic Data Overview */}
        <div className="mb-6">
          <ConfigInfo />
        </div>

        {/* Junction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Junction Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">BusLaneJunction</h3>
                <div className="flex space-x-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('editJunction', { junctionId: 'BusLaneJunction' });
                    }}
                    disabled={deleteInProgress === 'BusLaneJunction'}
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => handleDelete('BusLaneJunction', e)}
                    disabled={deleteInProgress === 'BusLaneJunction'}
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lanes: 3, Left Turn Lanes: Yes, Bus/Cycle Lanes: Yes</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Performance Metrics:</p>
                  <p className="text-sm text-gray-600">Average Wait Time: 0s, Max Queue Length: 0 vehicles</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('simulation')}
                className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Run Simulation
              </button>
            </div>
          </Card>

          {/* Junction Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">PedestrianFriendly</h3>
                <div className="flex space-x-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('editJunction', { junctionId: 'PedestrianFriendly' });
                    }}
                    disabled={deleteInProgress === 'PedestrianFriendly'}
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => handleDelete('PedestrianFriendly', e)}
                    disabled={deleteInProgress === 'PedestrianFriendly'}
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lanes: 2, Left Turn Lanes: Yes, Bus/Cycle Lanes: Yes</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Performance Metrics:</p>
                  <p className="text-sm text-gray-600">Average Wait Time: 0s, Max Queue Length: 0 vehicles</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('simulation')}
                className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
              >
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