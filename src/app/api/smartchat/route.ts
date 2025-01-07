import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { v4 as uuidv4 } from "uuid";


// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
  // 1. Initialize your LLM
  const llm = new ChatGroq({
    modelName: "llama-3.3-70b-versatile",
    apiKey: process.env.API_KEY,
  });

  // 2. Create a prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a friendly and empathetic healthcare advisor. Speak in a natural, human-like way. 
Ask up to 2 thoughtful questions at a time to understand the user's symptoms, circumstances, and medical history. 
After asking 3-4 questions in total, summarize the information provided and offer a possible explanation, 
advice, and next steps. Provide practical and helpful suggestions based on the user's input. 

If the user shares new information, ask up to 2 follow-up questions to clarify further. 
Ensure the conversation is simple and easy to follow, without overwhelming the user. 
Remind the user that you are not a licensed medical professional and cannot provide official diagnoses or prescriptions. 
Encourage them to consult a healthcare provider for personalized care when necessary. 

Provide educational information in a brief, straightforward manner when appropriate. 
Your goal is to guide the user through their concerns in a calm, supportive way, offering helpful insights and actionable advice.`,
    ],
    ["placeholder", "{messages}"],
  ]);

  // 3. Define the function that calls the model
  const callModel = async (state) => {
    const prompt = await promptTemplate.invoke(state);
    const response = await llm.invoke(prompt);
    return { messages: response };
  };

  // 4. Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

  // 5. Add memory and compile
  const memory = new MemorySaver();
  const app = workflow.compile({ checkpointer: memory });

  
  

// Handle POST requests
export async function POST(req) {
  const body = await req.json();
  const message =
    body.message || "Explain the importance of fast language models";
  const id = body.id;

  if (!id) {
    return new Response(
      JSON.stringify({
        error: "Please provide an id",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  let userId = id;
  const config = {
    configurable: {
      thread_id: userId,
    },
  };
  console.log("Thread ID:", id);
  try {
    const input = [
      {
        role: "user",
        content: message,
      },
    ];

    // 6. Invoke LLM (returns the full response object)
    const response = await app.invoke({ messages: input }, config);
    console.log("Response:", response);

    // 7. Extract the AI's reply from the response
    let lastAIMessageContent = null;
    for (let i = response.messages.length - 1; i >= 0; i--) {
      const msg = response.messages[i];
      // Check if this is an AI message (common heuristic)
      if (
        msg.response_metadata &&
        msg.response_metadata.tokenUsage &&
        typeof msg.response_metadata.finish_reason !== "undefined"
      ) {
        lastAIMessageContent = msg.content;
        break;
      }
    }

    // 8. Return the extracted content
    return new Response(
      JSON.stringify({
        message: lastAIMessageContent,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing API request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process the request",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
