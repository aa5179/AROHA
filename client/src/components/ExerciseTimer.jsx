import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ExerciseTimer = ({ exercise, isOpen, onClose }) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);

  // Parse duration from string like "5 min" to seconds
  const parseDuration = (duration) => {
    const match = duration.match(/(\d+)\s*min/);
    if (match) {
      return parseInt(match[1]) * 60;
    }
    return 300; // Default 5 minutes
  };

  useEffect(() => {
    if (exercise) {
      setTimeLeft(parseDuration(exercise.duration));
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [exercise]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            // Track mindful session completion
            saveMindfulSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const saveMindfulSession = () => {
    if (!user) return;

    // Get existing sessions
    const sessions = JSON.parse(
      localStorage.getItem(`mindfulSessions_${user.id}`) || "[]"
    );

    // Add new session
    sessions.push({
      exerciseName: exercise?.title || "Mindful Exercise",
      date: new Date().toISOString(),
      duration: parseDuration(exercise?.duration || "5 min"),
    });

    // Save back to localStorage
    localStorage.setItem(
      `mindfulSessions_${user.id}`,
      JSON.stringify(sessions)
    );
  };

  const handleStartPause = () => {
    if (isCompleted) {
      // Reset if completed
      setTimeLeft(parseDuration(exercise.duration));
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(parseDuration(exercise.duration));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getExerciseInstructions = (type) => {
    switch (type) {
      case "breathing":
        return [
          "Find a comfortable seated position",
          "Close your eyes or soften your gaze",
          "Breathe in slowly through your nose for 4 counts",
          "Hold your breath for 4 counts",
          "Exhale slowly through your mouth for 6 counts",
          "Repeat this cycle until the timer ends",
        ];
      case "gratitude":
        return [
          "Take a moment to settle into a comfortable position",
          "Think about three things you're grateful for today",
          "They can be big or small - anything counts",
          "Reflect on why each thing brings you joy",
          "Write them down in your journal if you'd like",
          "Allow yourself to feel the warmth of gratitude",
        ];
      case "relaxation":
        return [
          "Lie down or sit in a comfortable position",
          "Start with your toes - tense them for 5 seconds, then release",
          "Move to your calves, thighs, and so on",
          "Work your way up through each muscle group",
          "Notice the difference between tension and relaxation",
          "Finish with your face and neck muscles",
        ];
      case "mindfulness":
        return [
          "Begin walking at a natural, comfortable pace",
          "Notice the sensation of your feet touching the ground",
          "Pay attention to your surroundings - sights, sounds, smells",
          "If your mind wanders, gently bring it back to the present",
          "Focus on the rhythm of your steps",
          "Enjoy this moment of moving meditation",
        ];
      default:
        return [
          "Find a comfortable position",
          "Focus on your breath",
          "Let thoughts come and go without judgment",
          "Stay present in the moment",
        ];
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "breathing":
        return "from-blue-400 to-blue-500";
      case "gratitude":
        return "from-yellow-400 to-orange-400";
      case "relaxation":
        return "from-purple-400 to-purple-500";
      case "mindfulness":
        return "from-green-400 to-green-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  if (!exercise) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${getTypeColor(
                      exercise.type
                    )} rounded-xl flex items-center justify-center text-3xl`}
                  >
                    {exercise.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-bark-900 dark:text-forest-100">
                      {exercise.title}
                    </h2>
                    <p className="text-sm text-bark-600 dark:text-forest-300 mt-1">
                      {exercise.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Timer Display */}
              <div className="p-8 flex flex-col items-center">
                <div className="relative">
                  {/* Circular Progress */}
                  <svg
                    className="transform -rotate-90"
                    width="200"
                    height="200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        90 *
                        (1 - timeLeft / parseDuration(exercise.duration))
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Timer Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-bark-900 dark:text-forest-100">
                      {formatTime(timeLeft)}
                    </span>
                    {isCompleted && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-600 dark:text-green-400 font-medium mt-2"
                      >
                        Completed! 🎉
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartPause}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : isRunning
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        : "bg-gradient-to-r from-moss-500 to-forest-500 hover:from-moss-600 hover:to-forest-600"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <RotateCcw size={20} />
                        <span>Start Again</span>
                      </>
                    ) : isRunning ? (
                      <>
                        <Pause size={20} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        <span>Start</span>
                      </>
                    )}
                  </motion.button>

                  {!isCompleted && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <RotateCcw
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold text-bark-900 dark:text-forest-100 mb-4">
                  Instructions
                </h3>
                <div className="space-y-3">
                  {getExerciseInstructions(exercise.type).map(
                    (instruction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-moss-500 to-forest-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-bark-600 dark:text-forest-300 pt-0.5">
                          {instruction}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExerciseTimer;
