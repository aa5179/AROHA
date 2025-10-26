import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const MoodChart = ({ data }) => {
  const hasRealData = data && data.some((d) => d.hasEntry);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      let moodText = "Neutral";
      let moodColor = "text-yellow-500";

      if (moodValue >= 4) {
        moodText = "Happy";
        moodColor = "text-mint-500";
      } else if (moodValue <= 2.5) {
        moodText = "Sad";
        moodColor = "text-red-400";
      }

      return (
        <div className="card p-3 shadow-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">{`${label}`}</p>
          <p className={`font-semibold ${moodColor}`}>
            {`Mood: ${moodText} (${moodValue}/5)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Mood Trend
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {hasRealData
              ? "Track your emotional journey"
              : "Write journal entries to see your mood trend"}
          </p>
        </div>
        {hasRealData && (
          <div className="flex items-center space-x-2 text-mint-500">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">
              {(() => {
                const moods = data.map((d) => d.mood);
                const recent = moods.slice(-3).reduce((a, b) => a + b, 0) / 3;
                const earlier =
                  moods.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
                return recent > earlier
                  ? "Improving"
                  : recent < earlier
                  ? "Needs Attention"
                  : "Stable";
              })()}
            </span>
          </div>
        )}
      </div>

      {!hasRealData && (
        <div className="h-64 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/40 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
              No mood data yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create journal entries with emotion analysis to see your weekly
              mood trend
            </p>
          </div>
        </div>
      )}

      {hasRealData && (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  domain={[1, 5]}
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="url(#moodGradient)"
                  strokeWidth={3}
                  dot={{ fill: "#8c54ff", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: "#7c3aed" }}
                />
                <defs>
                  <linearGradient
                    id="moodGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="50%" stopColor="#8c54ff" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Sad (1-2)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Neutral (3)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-mint-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Happy (4-5)
              </span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MoodChart;
