// OpenAIPrompt.js
import React, { useState } from 'react';
import { getObjectivesFromLLM } from './openaiApi';
import ObjectivesTable from './ObjectivesTable';

import type { Schema } from '../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient();

const createPromptLog = async (prompt, response) => {
  await client.models.Prompt.create({
    useragent: 'a',
    ip_address: 'a',
    session_id: 'id',
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

    try {
      // Call the function from openaiApi.js
      const result = await getObjectivesFromLLM(prompt);
      setResponse(result);
    } catch (err) {
      setError(`An error occurred while calling OpenAI API: ${err}.`);
    } finally {
      setLoading(false);
      createPromptLog(prompt, response);
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
      {response && (<ObjectivesTable jsonData={response} />)}
    </div>
  );
};

export default OpenAIPrompt;

