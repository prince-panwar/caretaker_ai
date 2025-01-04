"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./clients/supabase";
/**
 * Renders paragraphs, bold text, inline code, code blocks, and lists
 */
function formatMessageContent(content) {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const chunks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    chunks.push({ type: "code-block", value: match[1] });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    chunks.push({ type: "text", value: content.slice(lastIndex) });
  }

  return chunks.flatMap((chunk, i) => {
    if (chunk.type === "code-block") {
      return (
        <pre
          key={`codeblock-${i}`}
          className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 text-sm overflow-auto"
        >
          <code>{chunk.value.trim()}</code>
        </pre>
      );
    } else {
      const lines = chunk.value.split(/\r?\n/);
      return lines.map((line, idx) => {
        const trimmedLine = line.trim();
        const isBullet = /^\s*[-*]\s+/.test(trimmedLine);
        const isNumbered = /^\s*\d+\.\s+/.test(trimmedLine);

        if (isBullet) {
          const itemText = trimmedLine.replace(/^[-*]\s+/, "");
          return (
            <li className="list-disc list-inside" key={`bullet-${i}-${idx}`}>
              {renderInlineFormatting(itemText)}
            </li>
          );
        } else if (isNumbered) {
          const itemText = trimmedLine.replace(/^\d+\.\s+/, "");
          return (
            <li className="list-decimal list-inside" key={`numbered-${i}-${idx}`}>
              {renderInlineFormatting(itemText)}
            </li>
          );
        } else if (!trimmedLine) {
          return <br key={`linebreak-${i}-${idx}`} />;
        } else {
          return (
            <p key={`para-${i}-${idx}`} className="my-1">
              {renderInlineFormatting(line)}
            </p>
          );
        }
      });
    }
  });
}

/**
 * Handles inline code (`), bold (**), etc.
 */
function renderInlineFormatting(text) {
  const inlineRegex = /(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const matchedStr = match[0];

    if (matchedStr.startsWith("**")) {
      const boldText = matchedStr.replace(/\*\*/g, "");
      parts.push({ type: "bold", value: boldText });
    } else if (matchedStr.startsWith("`")) {
      const codeText = matchedStr.replace(/`/g, "");
      parts.push({ type: "inline-code", value: codeText });
    }
    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.map((part, i) => {
    switch (part.type) {
      case "bold":
        return (
          <strong key={`bold-${i}`} className="font-semibold">
            {part.value}
          </strong>
        );
      case "inline-code":
        return (
          <code key={`code-${i}`} className="bg-gray-300 px-1 rounded">
            {part.value}
          </code>
        );
      default:
        return <span key={`text-${i}`}>{part.value}</span>;
    }
  });
}

export default function HomePage() {
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking,setIsSpeaking] = useState(false);
  const [userData, setUserData] = useState(null);
  // NEW: Track whether speech recognition is active
  const [listening, setListening] = useState(false);

 

  const handleSend = async (message) => {
    if (!message.trim()) return;
      // The context prompt we want to remove if it's included in message
      const contextprompt = "you are a human healthcare provider , be friendly , answers should be short and consice , if you have a question ask one at a time and wait for reply, talk as a human named jimmy, remeber the talk user is doing  give solutions and suggestions";

    // Remove contextprompt if it's present in the message
    let processedMessage = message;
    if (processedMessage.includes(contextprompt)) {
      console.log("initial message", processedMessage);
    }else{setConversation((prev) => [
      ...prev,
      { role: "user", content: processedMessage },
    ]);}

    
    try {
      const response = await fetch("https://caretaker-ai.vercel.app/api/smartchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,    // Or whatever variable holds your message text
          id: userData.id,   // Or whatever variable holds your ID
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const aiReply = data?.message || "No response from API";
      setUserMessage("");
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
      return aiReply;
      
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };

  const startSpeak = (message) => {
    if ("speechSynthesis" in window) {
      // Stop any ongoing speech
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1; // Normal speed
      utterance.pitch = 1; // Default pitch

      const voices = speechSynthesis.getVoices();
      console.log(voices);

      const selectedVoice = voices[4]; // Example: use voice at index 4
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn("No preferred voice found. Using default voice.");
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-Speech not supported on this platform.");
    }
  };

  const startVoiceRecognition = async () => {
    // 1) Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia not supported in this browser.");
      return;
    }
  
    let mediaStream;
    let mediaRecorder;
    let audioChunks = [];
    let audioContext;
    let sourceNode;
    let analyser;
    let silenceStart = Date.now();
    let silenceTimeout = 2000; // Stop after 2s of silence (tweak as needed)
    let running = true;
  
    try {
      // 2) Prompt for microphone access
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      // 3) Create MediaRecorder for the mic stream
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
  
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };
  
      // 4) When recording stops => create Blob, upload to server
      mediaRecorder.onstop = async () => {
        running = false;
        // Build final Blob
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
  
        try {
          // Upload to server
          const formData = new FormData();
          formData.append("file", blob, "speech.webm");
  
          const response = await fetch("https://caretaker-ai.vercel.app/api/voice", {
            method: "POST",
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const data = await response.json();
          console.log("Transcribed text:", data.text || data.error || "No text");
          data.text;
          const answer = await handleSend(data.text);
          
          startSpeak(answer);
        } catch (error) {
          console.error("Error calling /api/voice:", error);
        }
      };
  
      mediaRecorder.start();
      console.log("Recording started.");
  
      // 5) Create an AudioContext for amplitude-based silence detection
      audioContext = new AudioContext();
      sourceNode = audioContext.createMediaStreamSource(mediaStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      sourceNode.connect(analyser);
  
      const data = new Uint8Array(analyser.fftSize);
  
      // 6) Loop: check volume levels to detect silence
      function detectSilence() {
        if (!running) return;
        analyser.getByteTimeDomainData(data);
  
        // Calculate a rough volume
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i] - 128);
        }
        const avg = sum / data.length;
  
        // If volume is above a threshold, reset silenceStart
        if (avg > 5) {
          silenceStart = Date.now();
        } else {
          // If we've been silent for too long, stop
          if (Date.now() - silenceStart > silenceTimeout) {
            console.log("Silence detected. Stopping recording...");
            mediaRecorder.stop();
            audioContext.close();
            setListening(false);
            mediaStream.getTracks().forEach((track) => track.stop());
            return;
          }
        }
  
        requestAnimationFrame(detectSilence);
      }
  
      detectSilence(); // Start checking for silence
    } catch (err) {
      console.error("Error starting voice recognition:", err);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }
  
  useEffect(() => {
    if (userMessage) {
      setListening(false);
    }
  }, [userMessage]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // Redirect to login if not logged in
        router.replace("/login");
      }else{
        setUserData(data.user);
        console.log(data.user);
      }

    });
  }, [router]);

  return (
<div className="min-h-screen bg-gray-200 flex flex-col items-center text-black">
  {/* Header */}
  <div className="mt-4 mb-4 w-full max-w-3xl">
    <div className="bg-white rounded-full shadow flex justify-between items-center px-4 py-2">
      <button
        onClick={() => setVoiceMode(!voiceMode)}
        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
      >
        {voiceMode ? "Switch to Text Chat" : "Switch to Voice Chat"}
      </button>

      <button
        onClick={() => {
          handleLogout();
        }}
        className="text-red-500 hover:text-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  </div>

  {/* Chat Container */}
  <div className="w-full max-w-3xl flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 pb-32">
      {conversation.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`p-3 rounded-lg max-w-xl ${
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {formatMessageContent(msg.content)}
            {msg.role !== "user" && (
              <button
                onClick={() => startSpeak(msg.content)}
                className="ml-2 underline"
              >
                🔉
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Fixed Chat Input / Voice Button (always visible) */}
  <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-transparent p-4 ">
    {voiceMode ? (
      <div className="flex justify-center">
        <button
          onClick={() => {
            setListening(!listening);
            if (!listening) startVoiceRecognition();
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            listening ? "bg-red-500" : "bg-blue-500"
          } text-white text-2xl transition-colors`}
        >
          {listening ? "👂" : "🎙️"}
        </button>
      </div>
    ) : (
      <div className="flex items-center space-x-2">
        <input
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400"
          placeholder="Type your message..."
        />
        <button
          onClick={() => handleSend(userMessage)}
          className="bg-blue-500 px-6 py-2 rounded-full text-white hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    )}
  </div>
</div>




  
  );
}
