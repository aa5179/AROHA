import React from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, getMoodColor, getMoodEmoji } from "../data/mockData";

const JournalCard = ({ entries = [] }) => {
  const recentEntries = entries.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-forest-500 to-moss-500 rounded-xl flex items-center justify-center">
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-bark-900 dark:text-forest-100">
              Journal
            </h2>
            <p className="text-sm text-bark-600 dark:text-forest-300">
              Reflect on your thoughts
            </p>
          </div>
        </div>
        <Link
          to="/journal"
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus size={16} />
          <span>Add Reflection</span>
        </Link>
      </div>

      <div className="space-y-3">
        {recentEntries.length > 0 ? (
          <>
            {recentEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-forest-50/60 dark:bg-forest-800/40 backdrop-blur-sm rounded-xl border border-forest-200/50 dark:border-forest-600/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`mood-indicator ${getMoodColor(entry.mood)}`}
                    ></div>
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <span className="font-medium text-bark-900 dark:text-forest-100 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                      {entry.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-bark-500 dark:text-forest-400">
                    <Calendar size={12} />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                </div>
                <p className="text-sm text-bark-600 dark:text-forest-200 line-clamp-2">
                  {entry.content}
                </p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Link
                to="/journal"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center justify-center space-x-1 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <span>View all entries</span>
                <span>→</span>
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen
                className="text-gray-400 dark:text-gray-500"
                size={24}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No entries yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start your journey by writing your first reflection
            </p>
            <Link
              to="/journal"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create First Entry</span>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default JournalCard;
