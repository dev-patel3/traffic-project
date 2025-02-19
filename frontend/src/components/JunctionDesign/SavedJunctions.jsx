import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

const SavedJunctionsPage = ({ onNavigate }) => {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(null);

  // Fetch junctions on component mount
  useEffect(() => {
    const fetchJunctions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/junctions');
        if (!response.ok) {
          throw new Error('Failed to fetch junctions');
        }
        const data = await response.json();
        setJunctions(data);
      } catch (err) {
        setError('Failed to load junctions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJunctions();
  }, []);

  const handleDelete = async (junctionId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this junction?')) return;

    try {
      setDeleteInProgress(junctionId);
      const response = await fetch(`http://localhost:5000/api/junctions/${junctionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete junction');
      }
      
      // Update local state instead of reloading
      setJunctions(prevJunctions => 
        prevJunctions.filter(junction => junction.id !== junctionId)
      );
    } catch (err) {
      setError('Failed to delete junction: ' + err.message);
    } finally {
      setDeleteInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading junctions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Junction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Junction Cards */}
          {junctions.map(junction => (
            <Card key={junction.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{junction.name}</h3>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('editJunction', { junctionId: junction.id });
                      }}
                      disabled={deleteInProgress === junction.id}
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => handleDelete(junction.id, e)}
                      disabled={deleteInProgress === junction.id}
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Lanes: {Math.max(
                      junction.northbound.num_lanes,
                      junction.southbound.num_lanes,
                      junction.eastbound.num_lanes,
                      junction.westbound.num_lanes
                    )}, 
                    Left Turn Lanes: {[
                      junction.northbound.enable_left_turn_lane,
                      junction.southbound.enable_left_turn_lane,
                      junction.eastbound.enable_left_turn_lane,
                      junction.westbound.enable_left_turn_lane
                    ].some(Boolean) ? 'Yes' : 'No'}, 
                    Bus/Cycle Lanes: {[
                      junction.northbound.enable_bus_cycle_lane,
                      junction.southbound.enable_bus_cycle_lane,
                      junction.eastbound.enable_bus_cycle_lane,
                      junction.westbound.enable_bus_cycle_lane
                    ].some(Boolean) ? 'Yes' : 'No'}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">Performance Metrics:</p>
                    <p className="text-sm text-gray-600">
                      Average Wait Time: {junction.metrics?.avgWaitTime || 0}s, 
                      Max Queue Length: {junction.metrics?.maxQueueLength || 0} vehicles
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('simulation', { junctionId: junction.id })}
                  className="w-full py-2 px-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  Run Simulation
                </button>
              </div>
            </Card>
          ))}

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