import { useState, useEffect } from 'react';
import axios from 'axios';
import JunctionDesign from './components/JunctionDesign/JunctionDesign';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/test')
      .then(response => setMessage(response.data.message));
  }, []);

  return (
    <div>
      {/* API test message */}
      <div className="p-4">
        <h1>{message}</h1>
      </div>

      {/* Junction Design component */}
      <JunctionDesign />
    </div>
  );
}

export default App;