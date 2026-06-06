import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  LuMessageSquare,
  LuX,
  LuSend,
  LuSparkles,
  LuBot,
  LuUser,
  LuRefreshCw,
} from "react-icons/lu";

// Lightweight, safe markdown parser for rendering formatted responses.
const parseMarkdown = (text) => {
  if (!text) return "";
  let html = text;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-gray-900'>$1</strong>");

  // Italic: *text* -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>");

  // Inline Code: `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, "<code class='bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-600'>$1</code>");

  // Bullet list parsing line by line
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = trimmed.substring(2);
      let prefix = "";
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-2 space-y-1.5 text-gray-700">';
      }
      return prefix + `<li class="leading-relaxed">${content}</li>`;
    } else {
      let suffix = "";
      if (inList) {
        inList = false;
        suffix = "</ul>";
      }
      return suffix + (trimmed ? `<p class="my-1.5 leading-relaxed text-gray-700">${trimmed}</p>` : '<div class="h-2"></div>');
    }
  });

  if (inList) {
    processedLines.push("</ul>");
  }

  return processedLines.join("");
};

const ChatAssistant = () => {
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Messages log
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Initialize welcome message depending on AI status
  useEffect(() => {
    if (user) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: isAiActive
            ? `Hi **${user?.name || "there"}**! 👋 I'm **Tasky**, your personal Task Assistant.

I am connected to **Gemini AI** and have full context of your task database! Ask me anything about your schedule, ask me to draft tasks, or analyze your workflow.`
            : `Hi **${user?.name || "there"}**! 👋 I'm **Tasky**, your personal Task Assistant.

I am running in **Simulated Mode**. To unlock fully conversational AI, ask your administrator to configure the \`GEMINI_API_KEY\` in the backend's \`.env\` file.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user, isAiActive]);

  // Load backend status and tasks on mount/user change
  useEffect(() => {
    checkBackendAiStatus();
    fetchUserTasks();
  }, [user]);

  // Scroll to bottom when messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Check if GEMINI_API_KEY is configured in backend environment
  const checkBackendAiStatus = async () => {
    if (!user) return;
    setCheckingStatus(true);
    try {
      const response = await axiosInstance.get("/api/tasks/chat-status");
      if (response.data && response.data.enabled) {
        setIsAiActive(true);
      } else {
        setIsAiActive(false);
      }
    } catch (error) {
      console.error("Error checking backend AI status:", error);
      setIsAiActive(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch user's tasks
  const fetchUserTasks = async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: "" },
      });
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks for assistant:", error);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      checkBackendAiStatus();
      fetchUserTasks(); // Refresh tasks context when opened
    }
  };

  // Rule-based Simulated AI response logic
  const getSimulatedResponse = (userText) => {
    const msg = userText.toLowerCase();

    // 1. Task Summary / Analytics
    if (
      msg.includes("summary") ||
      msg.includes("status") ||
      msg.includes("count") ||
      msg.includes("statistic") ||
      msg.includes("total") ||
      msg.includes("stats") ||
      msg.includes("breakdown")
    ) {
      const total = tasks.length;
      const pending = tasks.filter((t) => t.status === "Pending").length;
      const inProgress = tasks.filter(
        (t) => t.status === "InProgress" || t.status === "In Progress"
      ).length;
      const completed = tasks.filter((t) => t.status === "Completed").length;

      return `Here is a quick summary of your tasks:\n\n* **Total Tasks:** ${total}\n* ⏳ **Pending:** ${pending}\n* 🔄 **In Progress:** ${inProgress}\n* ✅ **Completed:** ${completed}\n\nYou can click **Dashboard** in the sidebar to view full analytics charts!`;
    }

    // 2. High Priority Tasks
    if (msg.includes("high") || msg.includes("priority") || msg.includes("urgent") || msg.includes("critical")) {
      const highTasks = tasks.filter(
        (t) => t.priority?.toLowerCase() === "high"
      );
      if (highTasks.length > 0) {
        return `You have **${highTasks.length}** high-priority task(s):\n\n` +
          highTasks
            .map(
              (t) =>
                `* **${t.title}** (Status: *${t.status}*, Due: *${
                  t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"
                }*)`
            )
            .join("\n");
      } else {
        return "Nice! You don't have any high-priority tasks pending right now. Great job keeping things under control.";
      }
    }

    // 3. Due Dates / Upcoming Tasks
    if (msg.includes("due") || msg.includes("soon") || msg.includes("deadline") || msg.includes("upcoming") || msg.includes("date")) {
      const upcoming = tasks
        .filter((t) => t.status !== "Completed" && t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

      if (upcoming.length > 0) {
        return `Here are your next upcoming deadlines:\n\n` +
          upcoming
            .map(
              (t) =>
                `* **${t.title}** (Due: *${new Date(
                  t.dueDate
                ).toLocaleDateString()}*, Status: *${t.status}*)`
            )
            .join("\n");
      } else {
        return "You have no upcoming deadlines for incomplete tasks. Enjoy the peace of mind!";
      }
    }

    // 4. Productivity Tips
    if (
      msg.includes("tip") ||
      msg.includes("productivity") ||
      msg.includes("time") ||
      msg.includes("advice") ||
      (msg.includes("help") && msg.includes("organize"))
    ) {
      const tips = [
        "🍅 **Try the Pomodoro Technique:** Focus on a task for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer break. It beats burnout!",
        "🐸 **Eat the Frog:** Tackle your most complicated or high-priority task first thing in the morning when your mental energy is highest.",
        "✍️ **Keep it Actionable:** Write task titles starting with verbs (e.g., *'Draft design spec'* instead of just *'Design'*). It makes them easier to start.",
        "📊 **Review Daily:** Spend the first 5 minutes of your work day scanning your dashboard. This builds immediate alignment and clarity.",
        "✅ **Celebrate completion:** Marking a task completed releases dopamine. Break big tasks into small todos within a task checklist to get frequent progress indicators!",
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      return `Here is a productivity tip for you:\n\n${randomTip}`;
    }

    // 5. Setup instructions
    if (msg.includes("gemini") || msg.includes("key") || msg.includes("setup") || msg.includes("activate") || msg.includes("connect")) {
      return `To connect me to Gemini AI:\n\n1. Open your backend's \`.env\` file.\n2. Add the variable: \`GEMINI_API_KEY=your_gemini_api_key\`\n3. Restart your backend server.\n\nOnce set up, I will automatically connect to Gemini 1.5 Flash securely from the server side!`;
    }

    // 6. Generic greeting / Help
    return `I am running in **Simulated Mode**. I can help you with:\n\n* 📊 **"Show task summary"**\n* 🔴 **"High priority tasks"**\n* 📅 **"What tasks do I have?"**\n* 💡 **"Productivity tips"**\n\n*To enable fully conversational AI, configure the GEMINI_API_KEY environment variable on your backend server.*`;
  };

  // Call backend proxy route for Gemini
  const callGeminiAPI = async (userText, history) => {
    try {
      const response = await axiosInstance.post("/api/tasks/chat", {
        message: userText,
        history: history,
      });

      return response.data?.reply || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Backend Chat API Error:", error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (error.response?.status === 500 && errMsg.includes("Key")) {
        setIsAiActive(false); // Revert UI status to simulated
        return `⚠️ **Backend Gemini API Key is missing or invalid.**\n\nReverting to Simulated Mode. Please check that \`GEMINI_API_KEY\` is loaded in your backend server's configuration environment.`;
      }

      return `⚠️ **Error communicating with AI Assistant:**\n\n*${errMsg}*`;
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Clear input
    setInputMessage("");

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    const newUserMessage = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Get response
    let botResponse = "";
    if (isAiActive) {
      // Real Gemini AI Mode via Backend
      botResponse = await callGeminiAPI(text, updatedMessages);
    } else {
      // Local Simulated Mode
      // Simulate delay for realism
      await new Promise((resolve) => setTimeout(resolve, 800));
      botResponse = getSimulatedResponse(text);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble Button */}
      <button
        onClick={handleToggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-gray-800 hover:bg-gray-900 rotate-90"
            : "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-indigo-500/30"
        }`}
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
        title="Task Assistant"
      >
        {isOpen ? (
          <LuX className="text-2xl" />
        ) : (
          <div className="relative">
            <LuMessageSquare className="text-2xl" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="absolute bottom-16 right-0 w-[380px] h-[550px] max-sm:w-[calc(100vw-32px)] max-sm:h-[calc(100vh-100px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-150 flex flex-col overflow-hidden animate-scale-in"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative shadow-inner">
                <LuBot className="text-2xl text-white animate-bounce-slow" />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-primary ${
                    isAiActive ? "bg-cyan-400 animate-pulse" : "bg-green-500"
                  }`}
                ></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide">Tasky</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1 font-medium">
                  {checkingStatus ? (
                    "Checking connection..."
                  ) : isAiActive ? (
                    <>
                      <LuSparkles className="text-[10px]" /> AI Assistant (Server-Key)
                    </>
                  ) : (
                    "Simulated Assistant"
                  )}
                </p>
              </div>
            </div>

            {/* Refresh Connection Status Button */}
            <button
              onClick={checkBackendAiStatus}
              className={`p-2 rounded-full hover:bg-white/10 text-white/90 transition-colors cursor-pointer ${
                checkingStatus ? "animate-spin" : ""
              }`}
              title="Refresh AI Connection"
            >
              <LuRefreshCw className="text-base" />
            </button>
          </div>

          {/* Main Chat Body */}
          <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    } animate-fade-in`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border text-xs shadow-sm flex-shrink-0 ${
                        isUser
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      {isUser ? (
                        <LuUser className="text-[13px]" />
                      ) : (
                        <LuBot className="text-[14px]" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm border ${
                          isUser
                            ? "bg-primary border-blue-600 text-white rounded-tr-none"
                            : "bg-white border-gray-200/80 text-gray-800 rounded-tl-none"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(msg.text),
                        }}
                      />
                      <span
                        className={`text-[9px] text-gray-400 mt-1 px-1 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2.5 max-w-[80%] mr-auto animate-pulse">
                  <div className="w-7.5 h-7.5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                    <LuBot className="text-[14px]" />
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1 h-fit">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            <div className="px-4 py-2 border-t border-gray-100 bg-white/70 overflow-x-auto flex gap-1.5 flex-nowrap custom-scrollbar scroll-smooth whitespace-nowrap">
              <button
                onClick={() => handleQuickPrompt("Show task summary")}
                className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 text-[11px] font-medium text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
              >
                📊 Task Summary
              </button>
              <button
                onClick={() => handleQuickPrompt("Show high priority tasks")}
                className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-red-200 hover:bg-red-50 text-[11px] font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
              >
                🔴 High Priority
              </button>
              <button
                onClick={() => handleQuickPrompt("What tasks are due soon?")}
                className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-yellow-250 hover:bg-yellow-50 text-[11px] font-medium text-gray-600 hover:text-yellow-700 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
              >
                📅 Due Soon
              </button>
              <button
                onClick={() => handleQuickPrompt("Give me a productivity tip")}
                className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-green-200 hover:bg-green-50 text-[11px] font-medium text-gray-600 hover:text-green-600 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
              >
                💡 Productivity Tip
              </button>
            </div>
          </div>

          {/* Chat Input Field */}
          <div className="p-3 bg-white border-t border-gray-150 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isAiActive ? "Ask Tasky anything..." : "Ask in simulated mode..."
              }
              className="flex-1 bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 text-gray-800"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className={`w-9.5 h-9.5 rounded-xl bg-primary hover:bg-blue-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 disabled:bg-gray-150 disabled:text-gray-400 disabled:cursor-not-allowed`}
            >
              <LuSend className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
