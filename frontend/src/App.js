import { useState, useEffect } from 'react';
import axios from 'axios';
import JunctionDesign from './components/JunctionDesign/JunctionDesign';
import TrafficConfigPage from './components/JunctionDesign/TrafficConfigPage';
import SavedConfigurations from './components/JunctionDesign/SavedConfigurations';

function App() {
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState('saved'); 

  useEffect(() => {
    axios.get('http://localhost:5000/api/test')
      .then(response => setMessage(response.data.message));
  }, []);

  return (
    <div>
      {/* Navigation */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
          <button
            onClick={() => setCurrentPage('saved')}
            className={`px-4 py-2 rounded-md ${
              currentPage === 'saved' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Saved Configurations
          </button>
          <button
            onClick={() => setCurrentPage('traffic')}
            className={`px-4 py-2 rounded-md ${
              currentPage === 'traffic' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Traffic Configuration
          </button>
          <button
            onClick={() => setCurrentPage('junction')}
            className={`px-4 py-2 rounded-md ${
              currentPage === 'junction' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Junction Design
          </button>
        </div>
      </div>

      {/* API test message */}
      <div className="p-4">
        <h1>{message}</h1>
      </div>

      {/* Main content */}
      {currentPage === 'saved' && <SavedConfigurations />}
      {currentPage === 'traffic' && <TrafficConfigPage />}
      {currentPage === 'junction' && <JunctionDesign />}
    </div>
  );
}

export default App;