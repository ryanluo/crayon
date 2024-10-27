import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Prompt: a.model({
      useragent: a.string(),
      ip_address: a.string(),
      session_id: a.string(),
      timestamp: a.timestamp(),
      prompt: a.string(),
      response: a.string()
    })
    .authorization(allow => [allow.publicApiKey()]),
  Objectives: a.model({
      useragent: a.string(),
      ip_address: a.string(),
      session_id: a.string(),
      timestamp: a.timestamp(),
      user_objectives: a.string().array(),
      selected_objectives: a.string().array(),
      guardrail_prompt: a.string(),
      guardrail_response: a.string(),
      generated_prompt: a.string(),
      generated_prompt_response: a.string()
    })
    .authorization(allow => [allow.publicApiKey()])
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});
