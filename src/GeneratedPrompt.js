// OpenAIPrompt.js
import React, { useState } from 'react';

const GeneratedPrompt = ({ prompt }) => {
  return (
    <div style={{ textAlign: 'left', marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <h3>Generated Agent Prompt</h3>
      <p>{prompt.role}</p>
      <p>{prompt.instruction}</p>
      <ul>
        {prompt.objectives.map((objective) => <li>{objective}</li>)}
      </ul>
      <p>{prompt.guardrail}</p>
      <ul>
        {prompt.guidelines.map((guideline) => <li>{guideline}</li>)}
      </ul>
      <p>Your response here:</p>
    </div>
  );
};

export default GeneratedPrompt;

