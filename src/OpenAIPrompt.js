// OpenAIPrompt.js
import React, { useState } from 'react';
import { getObjectivesFromLLM } from './openaiApi';
import ObjectivesTable from './ObjectivesTable';

import type { Schema } from '../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient({
  authMode: 'apiKey',
});

const createPromptLog = async (prompt, response) => {
  await client.models.Prompt.create({
    useragent: navigator.userAgent,
    ip_address: '',
    session_id: localStorage.getItem('sessionId'),
    timestamp: Date.now(),
    prompt: prompt,
    response: response
  })
};

const OpenAIPrompt = ({ prompt }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callOpenAI = async () => {
    if (!prompt) return;

    setLoading(true);
    setError('');
    setResponse('');

    var result = ''
    try {
      // Call the function from openaiApi.js
      result = await getObjectivesFromLLM(prompt);
      setResponse(result);
    } catch (err) {
      setError(`An error occurred while calling OpenAI API: ${err}.`);
    } finally {
      setLoading(false);
      await createPromptLog(prompt, JSON.stringify(JSON.parse(result).response));
    }
  };

  // Check if there are enough tokens in the input
  const hasEnoughTokens = prompt.length > 50;

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <button 
        onClick={callOpenAI}
        disabled={loading || !hasEnoughTokens} // Disable button if no items are checked
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: hasEnoughTokens ? '#007BFF': '#808080',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: hasEnoughTokens ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Loading...' : 'Generate Objectives'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (<ObjectivesTable jsonData={response} purpose={prompt} />)}
    </div>
  );
};

export default OpenAIPrompt;

