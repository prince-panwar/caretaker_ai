"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

/* ── Inline SVG Icons ─────────────────────────────────────────── */

function IconHeart({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function IconSend({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function IconMic({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconSpeaker({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconSun({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconPlus({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconLogout({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconStop({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

/* ── Markdown Formatting ──────────────────────────────────────── */

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
        <pre key={`cb-${i}`} className="bg-gray-800 text-gray-100 p-3 rounded-lg my-2 text-sm overflow-auto">
          <code>{chunk.value.trim()}</code>
        </pre>
      );
    }
    return chunk.value.split(/\r?\n/).map((line, idx) => {
      const trimmed = line.trim();
      if (/^\s*[-*]\s+/.test(trimmed)) {
        return <li className="list-disc list-inside" key={`b-${i}-${idx}`}>{renderInline(trimmed.replace(/^[-*]\s+/, ""))}</li>;
      }
      if (/^\s*\d+\.\s+/.test(trimmed)) {
        return <li className="list-decimal list-inside" key={`n-${i}-${idx}`}>{renderInline(trimmed.replace(/^\d+\.\s+/, ""))}</li>;
      }
      if (!trimmed) return <br key={`br-${i}-${idx}`} />;
      return <p key={`p-${i}-${idx}`} className="my-0.5">{renderInline(line)}</p>;
    });
  });
}

function renderInline(text) {
  const regex = /(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: "text", v: text.slice(last, m.index) });
    if (m[0].startsWith("**")) parts.push({ t: "bold", v: m[0].replace(/\*\*/g, "") });
    else parts.push({ t: "code", v: m[0].replace(/`/g, "") });
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push({ t: "text", v: text.slice(last) });
  return parts.map((p, i) => {
    if (p.t === "bold") return <strong key={i} className="font-semibold">{p.v}</strong>;
    if (p.t === "code") return <code key={i} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">{p.v}</code>;
    return <span key={i}>{p.v}</span>;
  });
}

/* ── Suggested Prompts ────────────────────────────────────────── */

const SUGGESTIONS = [
  { text: "I have a headache that won't go away", icon: "head" },
  { text: "Tell me about vitamin D deficiency", icon: "vitamin" },
  { text: "I've been feeling anxious lately", icon: "mind" },
  { text: "What are signs of dehydration?", icon: "water" },
];

/* ── Main Component ───────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const messagesEndRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user?.email) {
      const saved = localStorage.getItem(`chat_${session.user.email}`);
      if (saved) {
        try { setConversation(JSON.parse(saved)); } catch {}
      }
    }
  }, [status, session, router]);

  // Dark mode init
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isLoading]);

  // Persist conversation
  useEffect(() => {
    if (session?.user?.email && conversation.length > 0) {
      localStorage.setItem(`chat_${session.user.email}`, JSON.stringify(conversation));
    }
  }, [conversation, session]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  const handleNewChat = () => {
    setConversation([]);
    if (session?.user?.email) localStorage.removeItem(`chat_${session.user.email}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/login");
  };

  /* ── Send Message ─────────────────────────────────────────── */

  const handleSend = async (message) => {
    if (!message?.trim() || isLoading) return;

    const newConversation = [
      ...conversation,
      { role: "user", content: message.trim() },
    ];
    setConversation(newConversation);
    setUserMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/smartchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newConversation,
          id: session?.user?.email,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const aiReply = data?.message || "No response from API";
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
      return aiReply;
    } catch (error) {
      console.error("Error fetching API:", error);
      setConversation((prev) => [
        ...prev,
        { role: "error", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Text-to-Speech ───────────────────────────────────────── */

  const startSpeak = (message) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  /* ── Voice Recognition ────────────────────────────────────── */

  const startVoiceRecognition = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;

    let mediaStream, mediaRecorder, audioChunks = [], audioContext;
    let silenceStart = Date.now();
    const silenceTimeout = 2000;
    let running = true;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        running = false;
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
        try {
          const formData = new FormData();
          formData.append("file", blob, "speech.webm");
          const response = await fetch("/api/voice", { method: "POST", body: formData });
          if (!response.ok) throw new Error("Voice API error");
          const data = await response.json();
          if (data.text) {
            const answer = await handleSend(data.text);
            if (answer) startSpeak(answer);
          }
        } catch (error) {
          console.error("Error calling /api/voice:", error);
        }
      };

      mediaRecorder.start();
      audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      sourceNode.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      function detectSilence() {
        if (!running) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += Math.abs(data[i] - 128);
        const avg = sum / data.length;

        if (avg > 5) {
          silenceStart = Date.now();
        } else if (Date.now() - silenceStart > silenceTimeout) {
          mediaRecorder.stop();
          audioContext.close();
          setListening(false);
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        requestAnimationFrame(detectSilence);
      }
      detectSilence();
    } catch (err) {
      console.error("Error starting voice recognition:", err);
      setListening(false);
    }
  };

  /* ── User initials for avatar ─────────────────────────────── */

  const userInitial = session?.user?.email?.[0]?.toUpperCase() || "U";

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="h-dvh flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <IconHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg tracking-tight">CaretakerAI</span>
          </div>

          {/* Center: Mode Toggle */}
          <div className="hidden sm:flex bg-gray-100 dark:bg-slate-800 rounded-full p-0.5">
            <button
              onClick={() => setVoiceMode(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !voiceMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setVoiceMode(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                voiceMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Voice
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle dark mode">
              {darkMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </button>
            <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="New chat">
              <IconPlus className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" aria-label="Logout">
              <IconLogout className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile mode toggle */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-full p-0.5">
            <button
              onClick={() => setVoiceMode(false)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                !voiceMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setVoiceMode(true)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                voiceMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500"
              }`}
            >
              Voice
            </button>
          </div>
        </div>
      </header>

      {/* ── Messages Area ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Empty State */}
          {conversation.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mb-6">
                <IconHeart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to CaretakerAI</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Your friendly AI health companion. Describe your symptoms or ask any health-related question.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="text-left p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-sm text-gray-700 dark:text-gray-300"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {/* Bot avatar */}
              {msg.role !== "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mt-1">
                  <IconHeart className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] sm:max-w-[70%] ${
                msg.role === "user"
                  ? "order-1"
                  : msg.role === "error"
                  ? "order-1"
                  : ""
              }`}>
                <div className={`px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                    : msg.role === "error"
                    ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-sm"
                    : "bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-sm"
                }`}>
                  {formatMessageContent(msg.content)}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => startSpeak(msg.content)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      aria-label="Read aloud"
                    >
                      <IconSpeaker className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? "Stop" : "Listen"}</span>
                    </button>
                  )}
                  {msg.role === "error" && (
                    <button
                      onClick={() => {
                        const lastUserMsg = [...conversation].reverse().find((m) => m.role === "user");
                        if (lastUserMsg) {
                          setConversation((prev) => prev.filter((_, i) => i !== idx));
                          handleSend(lastUserMsg.content);
                        }
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-600 underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium mt-1 order-2">
                  {userInitial}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                <IconHeart className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Input Area ───────────────────────────────────────── */}
      <div className="border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {voiceMode ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  if (!listening) {
                    setListening(true);
                    startVoiceRecognition();
                  } else {
                    setListening(false);
                  }
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  listening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                }`}
                aria-label={listening ? "Stop recording" : "Start recording"}
              >
                {listening ? <IconStop className="w-6 h-6" /> : <IconMic className="w-6 h-6" />}
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {listening ? "Listening... speak now" : "Tap to start recording"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(userMessage);
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                placeholder="Describe your symptoms or ask a question..."
              />
              <button
                onClick={() => handleSend(userMessage)}
                disabled={isLoading || !userMessage.trim()}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <IconSend className="w-5 h-5" />
              </button>
            </div>
          )}
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-2">
            CaretakerAI is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
