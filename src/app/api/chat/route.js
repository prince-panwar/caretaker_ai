import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.API_KEY });



// 1) Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",               // <-- Change "*" to your domain in production
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// 2) Handle POST requests
export async function POST(req) {
  try {
    const body = await req.json();
    const message =
      body.message || "Explain the importance of fast language models";
    const chatCompletion = await getGroqChatCompletion(message);

    return new Response(
      JSON.stringify({
        message: chatCompletion.choices[0]?.message?.content || "No response from model",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // <-- Change "*" to your domain in production
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch completion",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // <-- Change "*" to your domain in production
        },
      }
    );
  }
}

async function getGroqChatCompletion(content) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
