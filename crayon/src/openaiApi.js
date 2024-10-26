// openaiApi.js
import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Make sure to set this in your .env file

/**
 * Construct a list of guardrails from a set of objectives.
 * @param {string} - The list of objectives that is used to generate guardrails.
 * @returns {Promise<string>} - The response text from OpenAI.
 */
export const getGuardrailsFromObjectives = async (objectives) => {
  const system_prompt = `
You are a coach that is an expert in helping people reach their objectives.

Given a set of objectives, create a list of at most 10 guardrails that must be used to achieve the objective.

A guardrail must be a simple rule an agent can apply when generating a response.

An example of a negative guardrail is: do not repeat yourself.
An example of a positive guardrail is: check factuality of each statement.

Please structure as bullet points:
Your response must {guardrail}
`;
  const user_prompt =  `Construct a set of at most 10 guardrails given the following objectives:

${objectives}

Your response here:
`;

  return getOpenAIResponse(system_prompt, user_prompt);
};


/**
 * Construct a high-quality agent prompt from a set of objectives.
 * @param {string} - The list of objectives to compile
 * @param {string} - The list of guidelines to compile
 * @returns {Promise<string>} - The response text from OpenAI.
 */
export const getAgentPromptFromObjectives = async (objectives, guidelines) => {
  const system_prompt = `
You are a consultant that is an expert at writing clear communication.

Given a set of objectives, write a clear prompt following in the following template.

Please format with json:
{
  "response": {
    "role": "You are a {role} that is an expert in {purpose}.",
    "instruction": "Your job is to answer questions to achieve the following objectives:",
    "objectives": [{objective}, ...],
    "guardrail": "Your response must adhere to the following guidelines:",
    "guidelines": [{guideline}, ...],
  }
}
`;

  const user_prompt =  `Create an agent prompt that achieves the following objectives and guidelines:

${objectives}

${guidelines}

Please ensure the agent's responses are aligned with these goals.
`;
  return getOpenAIResponse(system_prompt, user_prompt, true /* format_json */);
};


/**
 * Break down a candidate agent prompt into objectives.
 * @param {string} agent_prompt - The agent prompt text to break down into objectives.
 * @returns {Promise<Object>} - The response text parsed from json from OpenAI.
 */
export const getObjectivesFromLLM = async (agent_prompt) => {
  const system_prompt = `
You are a consultant that is an expert at analyzing software agents.

Given a agent's purpose, identify 3 objectives that the agent must
accomplish to achieve the agent purpose.

1. Each objective should be no more than 5 words
2. Each objective should start with a verb
3. The agent must be the subject of each objective
4. The agent can respond to prompts, access the internet, and call other agents
5. Do not choose objectives that require human input
6. Do not choose redundant objectives
7. Write a justification for how each objective is relevant to the agent purpose


Response should be structured as json:
{
  "response": [
    {
      "rubric_name": $OBJECTIVE
      "rubric_explanation": $JUSTIFICATION
    },
    ...
  ]
}
  `

  const user_prompt = `
Come up with the most important, non-overlapping 3 objectives that must be
satisfied to achieve the following agent purpose:

${agent_prompt}
  `
  return getOpenAIResponse(system_prompt, agent_prompt, true /* format_json */);
};


/**
 * Send a prompt to OpenAI's API and receive a response.
 * @param {string} system_prompt - The prompt text to send to OpenAI under the 'system' role.
 * @param {string} user_prompt - The prompt text to send to OpenAI under the 'user' role.
 * @param {boolean} format_json - Whether to format response using json.
 * @param {number} temparature - The temperature to pass to OpenAI.
 * @param {string} model - The model to use (default: 'gpt-3.5-turbo').
 * @returns {Promise<string>} - The response text from OpenAI.
 */
export const getOpenAIResponse =
  async (system_prompt, user_prompt, format_json = false, temperature = 0, model = 'gpt-3.5-turbo') => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model,
        messages: [
          { role: 'system', content: system_prompt },
          { role: 'user', content: user_prompt }
        ],
        response_format: { type: format_json ? 'json_object' : 'text' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        }
      }
    );

    // Return the text from OpenAI's response
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to retrieve response from OpenAI.');
  }
};

