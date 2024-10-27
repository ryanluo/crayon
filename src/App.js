// App.js
import { Amplify } from 'aws-amplify';
import React from 'react';
import './App.css';
import CrayonInput from './CrayonInput';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);

function App() {
  return (
    <div className="App">
      <CrayonInput />
    </div>
  );
}

export default App;

