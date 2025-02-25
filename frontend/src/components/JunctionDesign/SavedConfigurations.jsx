import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const { fetchData, deleteData } = useAPI();

  // Load traffic flows on component mount
  useEffect(() => {
    const loadTrafficFlows = async () => {
      try {
        const data = await fetchData('/api/traffic-flows');
        
        // Transform data if needed to ensure consistent format
        const transformedFlows = Array.isArray(data) ? data.map(flow => {
          // Calculate flow totals for each direction
          let northVPH = 0, southVPH = 0, eastVPH = 0, westVPH = 0;
          
          if (flow.flows) {
            // New format
            if (flow.flows.northbound) {
              northVPH = flow.flows.northbound.incoming_flow || 
                      Object.values(flow.flows.northbound.exits || {}).reduce((sum, val) => sum + val, 0);
            }
            if (flow.flows.southbound) {
              southVPH = flow.flows.southbound.incoming_flow || 
                      Object.values(flow.flows.southbound.exits || {}).reduce((sum, val) => sum + val, 0);
            }
            if (flow.flows.eastbound) {
              eastVPH = flow.flows.eastbound.incoming_flow || 
                      Object.values(flow.flows.eastbound.exits || {}).reduce((sum, val) => sum + val, 0);
            }
            if (flow.flows.westbound) {
              westVPH = flow.flows.westbound.incoming_flow || 
                      Object.values(flow.flows.westbound.exits || {}).reduce((sum, val) => sum + val, 0);
            }
          }
          
          return {
            ...flow,
            id: flow.id || flow.name,
            name: flow.name || flow.id,
            northVPH: flow.northVPH || northVPH,
            southVPH: flow.southVPH || southVPH,
            eastVPH: flow.eastVPH || eastVPH,
            westVPH: flow.westVPH || westVPH
          };
        }) : [];
        
        setTrafficFlows(transformedFlows);
      } catch (err) {
        setError(`Failed to load configurations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadTrafficFlows();
  }, []);

  // Handle flow deletion
  const handleDelete = async (flowId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      setDeleteInProgress(flowId);
      await deleteData(`/api/traffic-flows/${flowId}`);
      
      setTrafficFlows(prev => prev.filter(flow => flow.id !== flowId));
    } catch (err) {
      setError(`Failed to delete configuration: ${err.message}`);
    } finally {
      setDeleteInProgress(null);
    }
  };

  const viewJunctionsForConfig = (configId, configName) => {
    onNavigate('configJunctions', { configId, configName });
  };

  const createNewJunction = (configId, configName) => {
    onNavigate('junctionDesign', { configId, configName });
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
            <Card 
              key={flow.id}
              className={`p-6 shadow-sm bg-white border-gray-100 cursor-pointer hover:bg-gray-50
                         ${deleteInProgress === flow.id ? 'opacity-50' : ''}`}
              onClick={() => viewJunctionsForConfig(flow.id, flow.name)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      {flow.name}
                      <ArrowRight className="h-4 w-4 ml-2 text-gray-400" />
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {`Northbound: ${flow.northVPH} VPH, Southbound: ${flow.southVPH} VPH, 
                      Eastbound: ${flow.eastVPH} VPH, Westbound: ${flow.westVPH} VPH. 
                      Saved Junctions: ${flow.junctionCount || 0}`}
                  </p>
                  <button 
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      createNewJunction(flow.id, flow.name);
                    }}
                  >
                    Create New Junction
                  </button>
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
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedConfigurations;