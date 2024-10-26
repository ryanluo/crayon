// CrayonInput.js
import React, { useState } from 'react';
import OpenAIPrompt from './OpenAIPrompt';


// Helper function to simulate grammar and spell checks
const checkText = (text) => {
  const errors = [];
  const words = text.split(" ");
  
  var input_tokens = 0;
  // for now, word length checker.
  words.forEach((word, index) => {
    if (word.length < 10) return;
    input_tokens += word.length;

    // Mock checks for demonstration: If the word is misspelled, mark it as error (red)
    errors.push({
      index,
      word,
      severity: 'error', 
      suggestion: 'Long word, consider choosing a shorter word.',
      context: 'Long words perform worse in LLM prompts.'
    });
  });
  if (input_tokens > 50) {
    errors.unshift({
      index: 0,
      word: words[0],
      severity: 'warning',
      suggestion: 'Choose a shorter prompt.',
      context: 'Long prompts are expensive and have worse LLM performance.'

    });
  }

  return errors;
};

const calculateScore = (errors) => {
  const baseScore = 100;
  let score = baseScore;

  errors.forEach((error) => {
    if (error.severity === 'error') {
      score -= 10;  // Deduct 10 points per critical error
    } else {
      score -= 5;   // Deduct 5 points per warning (if you add any in the future)
    }
  });

  return Math.max(0, score); // Ensure score doesn’t go below 0
};

const CrayonInput = () => {
  const [inputText, setInputText] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [errorList, setErrorList] = useState([]);
  const [score, setScore] = useState(100);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    // Perform checks
    const errors = checkText(text);
    setErrorList(errors);

    // Calculate and update the score based on errors
    setScore(calculateScore(errors));

    // Highlight errors
    let processedText = text;
    errors.forEach((error) => {
      const color = error.severity === 'error' ? 'red' : 'orange';
      const regex = new RegExp(`\\b${error.word}\\b`, 'g');
      processedText = processedText.replace(regex, `<span style="color:${color}">${error.word}</span>`);
    });

    setHighlightedText(processedText);
  };

  return (
    <div style={{ display: 'flex', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Input and Highlighted Text Section */}
      <div style={{ flex: 3, paddingRight: '20px' }}>
        <h1 style={{ color: '#333' }}>Crayon</h1>
        <p>Type a prompt for your language model below:</p>

        <textarea
          style={{
            width: '100%',
            height: '100px',
            fontSize: '1rem',
            padding: '10px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
          value={inputText}
          onChange={handleInputChange}
        />
        
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '5px',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />

        <OpenAIPrompt prompt={inputText} />
      </div>



      {/* Right-Side Panel for Score and Error List */}
      <div style={{ flex: 1, paddingLeft: '20px', borderLeft: '1px solid #ddd' }}>
        {/* Score Component */}
        <h2 style={{ color: '#333' }}>Overall Score</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red' }}>
          {score}/100
        </p>

        {/* Errors & Suggestions */}
        <h3 style={{ color: '#333' }}>Errors & Suggestions</h3>
        {errorList.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {errorList.map((error, index) => (
              <li key={index} style={{ marginBottom: '10px', padding: '5px', borderBottom: '1px solid #ddd' }}>
                <strong style={{ color: error.severity === 'error' ? 'red' : 'yellow' }}>{error.word}</strong>
                <p style={{ margin: '5px 0 0' }}>{error.context}</p>
                <p style={{ margin: '5px 0 0', fontStyle: 'italic' }}>Suggestion: {error.suggestion}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No issues detected.</p>
        )}
      </div>
    </div>
  );
};

export default CrayonInput;
