// App.js
import { Amplify } from 'aws-amplify';
import React from 'react';
import './App.css';
import CrayonInput from './CrayonInput';
import outputs from './amplify_outputs.json';

import { useEffect, useState } from 'react';

Amplify.configure(outputs);


const useSessionId = () => {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if session ID already exists in localStorage
    let storedSessionId = localStorage.getItem('sessionId');

    if (!storedSessionId) {
      // Generate a new session ID if none exists
      storedSessionId = generateSessionId();
      localStorage.setItem('sessionId', storedSessionId);
    }

    setSessionId(storedSessionId);
  }, []);

  return sessionId;
};

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function App() {
  const sessionId = useSessionId();
  useEffect(() => {
    console.log("Session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="App">
      <CrayonInput />
    </div>
  );
}

export default App;

