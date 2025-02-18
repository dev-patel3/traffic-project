import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, HelpCircle, FolderOpen } from 'lucide-react';
import JunctionDesign from './components/JunctionDesign/JunctionDesign';
import TrafficConfigPage from './components/JunctionDesign/TrafficConfigPage';
import SavedConfigurations from './components/JunctionDesign/SavedConfigurations';
import HomePage from './components/JunctionDesign/HomePage';
import SimulationPage from './components/JunctionDesign/JunctionSimulation';
import SavedJunctions from './components/JunctionDesign/SavedJunctions';
import HelpPage from './components/JunctionDesign/HelpPage';
import EditTrafficConfig from './components/JunctionDesign/EditTrafficConfig';
import EditJunctionDesign from './components/JunctionDesign/EditJunctionDesign';


function App() {
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editConfigId, setEditConfigId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/test')
      .then(response => setMessage(response.data.message));
  }, []);

  const navigateTo = (page, params = {}) => {
    setPreviousPage(currentPage);
    setCurrentPage(page);
    if (params.configId) {
      setEditConfigId(params.configId);
    }
  };

  const handleBack = () => {
    if (showHelp) {
      setShowHelp(false);
      return;
    }
    if (previousPage) {
      setCurrentPage(previousPage);
      setPreviousPage(null);
      setEditConfigId(null);
    }
  };

  const pageTitles = {
    home: 'Traffic Junction Modeler',
    saved: 'Saved Configurations',
    traffic: 'New Traffic Configuration',
    editTraffic: 'Edit Traffic Configuration',
    junctionDesign: 'Junction Design',
    simulation: 'Junction Simulation',
    junctionSaved: 'Saved Junctions',
    help: 'Help Guide',
    editJunction: 'Edit Junction Design',
  };

  const shouldShowBack = currentPage !== 'home' || showHelp;
  const shouldShowSaved = currentPage !== 'saved';

  if (showHelp) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button onClick={handleBack} className="flex items-center space-x-2">
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold">{pageTitles.help}</h1>
            <div className="w-20"></div>
          </div>
        </header>
        <HelpPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {shouldShowBack && (
              <button onClick={handleBack} className="flex items-center space-x-2">
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
          </div>
          <h1 className="text-xl font-semibold">{pageTitles[currentPage]}</h1>
          <div className="flex items-center space-x-6">
            {shouldShowSaved && (
              <button 
                onClick={() => navigateTo('saved')}
                className="flex items-center space-x-1 hover:text-gray-600"
              >
                <FolderOpen className="h-5 w-5" />
                <span className="text-sm">Saved Configurations</span>
              </button>
            )}
            <button 
              className="flex items-center space-x-1 cursor-pointer"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Help</span>
            </button>
          </div>
        </div>
      </header>

      <div className="py-6">
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentPage === 'saved' && <SavedConfigurations onNavigate={navigateTo} />}
        {currentPage === 'traffic' && <TrafficConfigPage onNavigate={navigateTo} previousPage={previousPage}/>}
        {currentPage === 'editTraffic' && <EditTrafficConfig configId={editConfigId} onNavigate={navigateTo} />}
        {currentPage === 'junctionDesign' && <JunctionDesign onNavigate={navigateTo} previousPage={previousPage}/>}
        {currentPage === 'simulation' && <SimulationPage onNavigate={navigateTo} />}
        {currentPage === 'junctionSaved' && <SavedJunctions onNavigate={navigateTo} />}
        {currentPage === 'editJunction' && (
  <EditJunctionDesign 
    junctionId={editConfigId} 
    onNavigate={navigateTo} 
  />
)}
      </div>

      <div className="p-4">
        <h1>{message}</h1>
      </div>
    </div>
  );
}

export default App;