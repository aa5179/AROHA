import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { API_ENDPOINTS } from "../lib/api";

const ChatBotUI = ({ messages = [], onSendMessage, isCompact = false }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setInputMessage("");
    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    // Show bot typing indicator
    setIsTyping(true);

    // Get bot response from AI API
    const botResponseText = await getBotResponse(inputMessage);

    setIsTyping(false);
    const botResponse = {
      id: Date.now() + 1,
      sender: "bot",
      message: botResponseText,
      timestamp: new Date().toISOString(),
    };
    if (onSendMessage) {
      onSendMessage(botResponse);
    }
  };

  const getBotResponse = async (userMessage) => {
    try {
      // Get user context from localStorage
      const journalEntries = JSON.parse(
        localStorage.getItem("journalEntries") || "[]"
      );

      // Get most recent analyzed emotion
      let recentEmotion = null;
      let journalSummary = null;

      if (journalEntries.length > 0) {
        const recentEntry = journalEntries[journalEntries.length - 1];
        if (recentEntry.emotionAnalysis?.emotions?.length > 0) {
          recentEmotion = recentEntry.emotionAnalysis.emotions[0].emotion;
        }
        // Get summary from most recent entry
        if (recentEntry.emotionAnalysis?.summary) {
          journalSummary = recentEntry.emotionAnalysis.summary.substring(
            0,
            150
          );
        }
      }

      // Prepare context for chatbot
      const context = {};
      if (recentEmotion) {
        context.recent_emotion = recentEmotion;
      }
      if (journalSummary) {
        context.journal_summary = journalSummary;
      }

      // Call backend chatbot API
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: Object.keys(context).length > 0 ? context : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chatbot response");
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error getting bot response:", error);
      // Fallback response if API fails
      return "I'm here to listen and support you. Please tell me more about how you're feeling.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`card ${isCompact ? "h-96" : "h-full"} flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-moss-500 to-forest-500 rounded-xl flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-bark-900 dark:text-forest-100">
              Mindful Assistant
            </h3>
            <p className="text-xs text-bark-500 dark:text-forest-400">
              <span className="inline-block w-2 h-2 bg-leaf-400 rounded-full mr-1"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-moss-500">
          <Sparkles size={16} />
          <span className="text-xs font-medium">AI Powered</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message when empty */}
        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-moss-500 to-forest-500 rounded-full flex items-center justify-center mb-6">
              <Bot className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-bark-900 dark:text-forest-100 mb-3">
              Welcome to Your Safe Space
            </h3>
            <p className="text-bark-600 dark:text-forest-300 max-w-md mb-2">
              This is a judgment-free zone where you can share your thoughts and
              feelings openly.
            </p>
            <p className="text-bark-500 dark:text-forest-400 max-w-md text-sm">
              Type anything below to start a conversation. I'm here to listen,
              support you, and discuss whatever is on your mind.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-moss-500">
              <Sparkles size={16} />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-forest-500 to-moss-500"
                      : "bg-gradient-to-r from-leaf-400 to-leaf-500"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-forest-500 to-moss-500 text-white"
                      : "bg-forest-100/60 dark:bg-forest-700/60 backdrop-blur-sm text-bark-900 dark:text-forest-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-forest-100"
                        : "text-bark-500 dark:text-forest-400"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-leaf-400 to-leaf-500 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-forest-100/60 dark:bg-forest-700/60 backdrop-blur-sm rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 resize-none rounded-xl border border-forest-200/60 dark:border-forest-600/60 bg-forest-50/50 dark:bg-forest-700/50 backdrop-blur-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent dark:text-forest-100 placeholder-bark-500 dark:placeholder-forest-400"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "100px" }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-bark-300 text-white rounded-full w-11 h-11 transition-all duration-200 flex items-center justify-center"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBotUI;
