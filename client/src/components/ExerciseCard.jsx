import React from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

const ExerciseCard = ({ exercise, onStart }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card p-4 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(
            exercise.type
          )} rounded-xl flex items-center justify-center text-2xl`}
        >
          {exercise.icon}
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={12} />
          <span>{exercise.duration}</span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {exercise.title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {exercise.description}
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart && onStart(exercise)}
        className="w-full bg-gradient-to-r from-primary-500 to-lavender-500 hover:from-primary-600 hover:to-lavender-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Play size={16} />
        <span>Start</span>
      </motion.button>
    </motion.div>
  );
};

export default ExerciseCard;
