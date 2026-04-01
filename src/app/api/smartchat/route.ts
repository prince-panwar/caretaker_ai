import { ChatGroq } from "@langchain/groq";

const SYSTEM_PROMPT = `You are a friendly and empathetic healthcare advisor. Speak in a natural, human-like way.
Ask up to 2 thoughtful questions at a time to understand the user's symptoms, circumstances, and medical history.
After asking 3-4 questions in total, summarize the information provided and offer a possible explanation,
advice, and next steps. Provide practical and helpful suggestions based on the user's input.

If the user shares new information, ask up to 2 follow-up questions to clarify further.
Ensure the conversation is simple and easy to follow, without overwhelming the user.
Remind the user that you are not a licensed medical professional and cannot provide official diagnoses or prescriptions.
Encourage them to consult a healthcare provider for personalized care when necessary.

Provide educational information in a brief, straightforward manner when appropriate.
Your goal is to guide the user through their concerns in a calm, supportive way, offering helpful insights and actionable advice.`;

let llm: ChatGroq | null = null;
function getLLM() {
  if (!llm) {
    llm = new ChatGroq({
      modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
      apiKey: process.env.API_KEY,
    });
  }
  return llm;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, id } = body;

  if (!id) {
    return Response.json({ error: "Please provide an id" }, { status: 400 });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Please provide messages" }, { status: 400 });
  }

  try {
    const langchainMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages
        .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
        .map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    const response = await getLLM().invoke(langchainMessages);

    return Response.json({ message: response.content }, { status: 200 });
  } catch (error) {
    console.error("Error processing API request:", error);
    return Response.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
