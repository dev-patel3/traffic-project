import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

// API hook with simplified error handling
const useAPI = () => {
  const baseURL = 'http://localhost:5000';

  const fetchData = async (endpoint) => {
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  };

  const deleteData = async (endpoint) => {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }
    return true;
  };

  return { fetchData, deleteData };
};

const SavedConfigurations = ({ onNavigate }) => {
  const [trafficFlows, setTrafficFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [junctionConfigs, setJunctionConfigs] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const { fetchData, deleteData } = useAPI();

  // Load traffic flows on component mount
  useEffect(() => {
    const loadTrafficFlows = async () => {
      try {
        const data = await fetchData('/api/traffic-flows');
        setTrafficFlows(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(`Failed to load configurations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadTrafficFlows();
  }, []);

  // Handle flow selection and load junctions
  const handleFlowSelection = async (flowId) => {
    try {
      if (selectedFlowId === flowId) {
        setSelectedFlowId(null);
        return;
      }
      setSelectedFlowId(flowId);
      
      if (!junctionConfigs[flowId]) {
        const data = await fetchData(`/api/traffic-flows/${flowId}/junctions`);
        setJunctionConfigs(prev => ({ ...prev, [flowId]: data }));
      }
    } catch (err) {
      setError(`Failed to load junction configurations: ${err.message}`);
    }
  };

  // Handle flow deletion
  const handleDelete = async (flowId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      setDeleteInProgress(flowId);
      await deleteData(`/api/traffic-flows/${flowId}`);
      
      setTrafficFlows(prev => prev.filter(flow => flow.id !== flowId));
      if (selectedFlowId === flowId) setSelectedFlowId(null);
      setJunctionConfigs(prev => {
        const newConfigs = { ...prev };
        delete newConfigs[flowId];
        return newConfigs;
      });
    } catch (err) {
      setError(`Failed to delete configuration: ${err.message}`);
    } finally {
      setDeleteInProgress(null);
    }
  };

  if (loading && trafficFlows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading configurations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {/* Traffic Flow List */}
          {trafficFlows.map((flow) => (
            <div key={flow.id} className="space-y-2">
              <Card 
                className={`p-6 shadow-sm bg-white border-gray-100 cursor-pointer
                           ${selectedFlowId === flow.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                           ${deleteInProgress === flow.id ? 'opacity-50' : ''}`}
                onClick={() => handleFlowSelection(flow.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{flow.name}</h3>
                    <p className="text-sm text-gray-500">
                      {`Northbound: ${flow.northVPH} VPH, Southbound: ${flow.southVPH} VPH, 
                        Eastbound: ${flow.eastVPH} VPH, Westbound: ${flow.westVPH} VPH. 
                        Saved Junctions: ${junctionConfigs[flow.id]?.length || 0}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                  <button 
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('editTraffic', { configId: flow.id });
                      }}
                      disabled={deleteInProgress === flow.id}
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => handleDelete(flow.id, e)}
                      disabled={deleteInProgress === flow.id}
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Junction Configurations */}
              {selectedFlowId === flow.id && junctionConfigs[flow.id] && (
                <div className="ml-8 space-y-2">
                  {junctionConfigs[flow.id].map((junction) => (
                    <Card key={junction.id} className="p-4 shadow-sm bg-white border-gray-100">
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-900">{junction.name || 'Unnamed Junction'}</h4>
                        <p className="text-sm text-gray-500">
                          Lanes: {junction.lanes}, 
                          Left Turn Lanes: {junction.hasLeftTurnLanes ? 'Yes' : 'No'}, 
                          Bus/Cycle Lanes: {junction.hasBusCycleLanes ? 'Yes' : 'No'}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">Performance Metrics:</p>
                          <p className="text-sm text-gray-500">
                            Average Wait Time: {junction.avgWaitTime}s, 
                            Max Queue Length: {junction.maxQueueLength} vehicles
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedConfigurations;