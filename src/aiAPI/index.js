

// const baseURL = "https://api.aimlapi.com/v1";
// const apiKey = "afd78080d3314927bc2d9ffc44ae6215";
// const systemPrompt = "You are a bussiness inteligence agent for real state market. Be descriptive and concise.";


// export const main = async (data) => {
//   const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       "Authorization": "Bearer "+apiKey,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       "model": "deepseek/deepseek-chat",
//       "frequency_penalty": 1,
//       "logit_bias": {
//         "ANY_ADDITIONAL_PROPERTY": 1
//       },
//       "logprobs": true,
//       "top_logprobs": 1,
//       "max_tokens": 512,
//       "max_completion_tokens": 1,
//       "n": 1,
//       "prediction": {
//         "type": "content",
//         "content": "text"
//       },
//       "presence_penalty": 1,
//       "seed": 1,
//       "messages": [
//         {
//           "role": "system",
//           "content": "text",
//           "name": "text"
//         }
//       ],
//       "stream": false,
//       "stream_options": {
//         "include_usage": true
//       },
//       "top_p": 1,
//       "temperature": 1,
//       "stop": "text",
//       "tools": [
//         {
//           "type": "function",
//           "function": {
//             "description": "text",
//             "name": "text",
//             "parameters": null,
//             "required": [
//               "text"
//             ]
//           }
//         }
//       ],
//       "tool_choice": "none",
//       "parallel_tool_calls": true,
//       "reasoning_effort": "low",
//       "response_format": {
//         "type": "text"
//       }
//     })
//   });
// };

// export default { main };


import { OpenAI } from "openai";

const baseURL = "https://api.aimlapi.com/v1";
const apiKey = "afd78080d3314927bc2d9ffc44ae6215";
const systemPrompt = "You are a bussiness inteligence agent for real state market. Be descriptive and concise about the next posible project.";

const api = new OpenAI({
  apiKey, dangerouslyAllowBrowser: true,
  baseURL,
});

export const main = async (data) => { 
  if (!data || data.length === 0) {
    console.error("Error: Data is empty or undefined.");
    return;
  }

  let userPrompt = `I'm planning a ${data[0]?.data?.length}-month real estate project with cost-benefit variables. 
  Here are the main variables and their monthly financial impact (in USD): 
  ${data.map(x => `${x.label}: ${JSON.stringify(x.data)}`).join("; ")}. 
  Can you provide a report on the project's costs and benefits?`;

  console.log("Generated Prompt:", userPrompt);

  try {
    const completion = await api.chat.completions.create({
      model: "gpt-4-turbo", // Asegúrate de que sea un modelo válido
      messages: [
        { role: "system", content: "You are an AI assistant that helps analyze real estate investments." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    console.log("AI Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Error calling API:", error);
  }
};

export default { main };