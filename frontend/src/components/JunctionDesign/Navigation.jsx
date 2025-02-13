import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, setShowHelp }) => {
  return (
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
        <button
          onClick={() => setShowHelp(true)}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 ml-auto"
        >
          Help
        </button>
      </div>
    </div>
  );
};

export default Navigation;