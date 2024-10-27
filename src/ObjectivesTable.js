// ObjectivesTable.js
import React, { useState, useEffect } from 'react';
import { getGuardrailsFromObjectives, getAgentPromptFromObjectives } from './openaiApi.js';
import GeneratedPrompt from './GeneratedPrompt';

import type { Schema } from '../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient({
  authMode: 'apiKey',
})

const createObjectivesLog = async (
    user_objectives, 
    selected_objectives,  
    guardrail_response,
    generated_prompt_response) => {
  await client.models.Objectives.create({
    useragent: navigator.userAgent,
    ip_address: '',
    session_id: localStorage.getItem('sessionId'),
    timestamp: Date.now(),
    user_objectives: user_objectives,
    selected_objectives: selected_objectives,
    guardrail_response: guardrail_response,
    generated_prompt_response: generated_prompt_response,
  })
};

var userObjectives = [];

const ObjectivesTable = ({ jsonData, purpose }) => {
  const [data, setData] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newObjective, setNewObjective] = useState({ rubric_name: '', rubric_explanation: '' });

  // Parse JSON data on initial load
  useEffect(() => {
    if (jsonData) {
      const parsedData = JSON.parse(jsonData).response
      setData(parsedData);
    }
  }, [jsonData]);

  const handleCheckboxChange = (index) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [index]: !prevCheckedItems[index],
    }));
  };

  const handleNewObjectiveChange = (e) => {
    const { name, value } = e.target;
    setNewObjective((prev) => ({ ...prev, [name]: value }));
  };

  const addObjective = () => {
    const updatedData = [
      ...data,
      {
        rubric_name: newObjective.rubric_name,
        rubric_explanation: newObjective.rubric_explanation,
      },
    ];

    // Set the new objective as checked by default
    const newIndex = updatedData.length - 1;
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [newIndex]: true,
    }));
    
    setData(updatedData);
    userObjectives.push(newObjective.rubric_name + ': ' + newObjective.rubric_explanation)
    setNewObjective({ rubric_name: '', rubric_explanation: '' }); // Clear input fields
  };

  const generateAgentPrompt = async () => {
    if (!data) return;

    setLoading(true);
    setError('');
    setGeneratedPrompt('');

    const selectedObjectives = data
      .filter((_, index) => checkedItems[index])
      .map((item) => `- ${item.rubric_name}: ${item.rubric_explanation}`);
    const selectedObjectivesInput = selectedObjectives.join('\n');
      
    var guidelines = ''
    var result = ''
    try {
      // Call the function from openaiApi.js
      guidelines = await getGuardrailsFromObjectives(selectedObjectivesInput)
      result = JSON.parse(
          await getAgentPromptFromObjectives(purpose, selectedObjectivesInput, guidelines)).response;
      setGeneratedPrompt(result);
    } catch (err) {
      setError(`An error occurred while calling OpenAI API: ${err}.`);
    } finally {
      setLoading(false);
      await createObjectivesLog(userObjectives, selectedObjectives, guidelines, result);
    }
  };

  // Check if at least one item is checked
  const hasCheckedItems = Object.values(checkedItems).some((isChecked) => isChecked);

  const hasNewObjective = newObjective.rubric_name.length && newObjective.rubric_explanation.length;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Objectives</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Include</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Objective</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '10px' }}>
                <input
                  type="checkbox"
                  checked={!!checkedItems[index]}
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.rubric_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.rubric_explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* New Objective Form */}
      <div style={{ marginBottom: '20px' }}>
<br/>
        <input
          type="text"
          name="rubric_name"
          placeholder="Objective Name"
          value={newObjective.rubric_name}
          onChange={handleNewObjectiveChange}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <input
          type="text"
          name="rubric_explanation"
          placeholder="Explanation"
          value={newObjective.rubric_explanation}
          onChange={handleNewObjectiveChange}
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button
          onClick={addObjective}
          disabled={loading || !hasNewObjective} // Disable button if no items are checked
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: hasNewObjective ? '#28a745': '#808080',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: hasNewObjective ? 'pointer' : 'not-allowed'
          }}
        >
          Add Objective
        </button>
      </div>

      <button 
        onClick={generateAgentPrompt}
        disabled={loading || !hasCheckedItems} // Disable button if no items are checked
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading || !hasCheckedItems ? '#808080' : '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading || !hasCheckedItems ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Generate Agent Prompt'}
      </button>
      {generatedPrompt && <GeneratedPrompt prompt={generatedPrompt} />}
    </div>
  );
};

export default ObjectivesTable;
