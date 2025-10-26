import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ChatBotUI from "../components/ChatBotUI";
import ExerciseCard from "../components/ExerciseCard";
import ExerciseTimer from "../components/ExerciseTimer";
import { mockExercises } from "../data/mockData";

const Chatbot = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  const handleSendMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleStartExercise = (exercise) => {
    setSelectedExercise(exercise);
    setIsTimerOpen(true);
  };

  const suggestExercises = () => {
    const suggestionMessage = {
      id: Date.now(),
      sender: "bot",
      message:
        "I'd like to suggest some mindfulness exercises that might help you feel better. Take a look at these options:",
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, suggestionMessage]);
    setShowExercises(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="text-gray-600 dark:text-gray-400" size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-primary-600 bg-clip-text text-transparent">
              Mindful Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your AI companion for mental wellness
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Sparkles className="text-lavender-500" size={16} />
          <span className="text-gray-600 dark:text-gray-300">AI Powered</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[600px]"
          >
            <ChatBotUI
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={suggestExercises}
                className="w-full btn-primary text-sm py-2"
              >
                Suggest Exercises
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const promptMessage = {
                    id: Date.now(),
                    sender: "bot",
                    message:
                      "I notice you might be feeling stressed. Would you like to talk about what's on your mind? Sometimes sharing can help lighten the load.",
                    timestamp: new Date().toISOString(),
                  };
                  setChatMessages((prev) => [...prev, promptMessage]);
                }}
                className="w-full btn-secondary text-sm py-2"
              >
                Feeling Stressed?
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const promptMessage = {
                    id: Date.now(),
                    sender: "bot",
                    message:
                      "Let's practice gratitude together. Can you think of three things you're grateful for today? They can be big or small - everything counts!",
                    timestamp: new Date().toISOString(),
                  };
                  setChatMessages((prev) => [...prev, promptMessage]);
                }}
                className="w-full btn-secondary text-sm py-2"
              >
                Practice Gratitude
              </motion.button>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Today's Tip
            </h3>
            <div className="bg-gradient-to-r from-mint-50 to-primary-50 dark:from-mint-900/20 dark:to-primary-900/20 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                "Take three deep breaths before responding to any stressful
                situation. This simple pause can help you respond rather than
                react."
              </p>
            </div>
          </motion.div>

          {/* Chat Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chat Guidelines
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-mint-500">•</span>
                <span>Be honest about your feelings</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-mint-500">•</span>
                <span>Take your time to respond</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-mint-500">•</span>
                <span>Ask for exercises when needed</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-mint-500">•</span>
                <span>Remember, this is a safe space</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ If you're experiencing a crisis, please contact emergency
                services or a mental health professional immediately.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Exercises Section */}
      {showExercises && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recommended Exercises
            </h2>
            <button
              onClick={() => setShowExercises(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ExerciseCard
                  exercise={exercise}
                  onStart={handleStartExercise}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Exercise Timer Modal */}
      <ExerciseTimer
        exercise={selectedExercise}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />
    </div>
  );
};

export default Chatbot;
