import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Flame,
  Target,
  TrendingUp,
  Plus,
  Send,
  BookOpen,
  Lightbulb,
  Heart,
  X,
  Brain,
  Zap,
} from "lucide-react";
import ChatBotUI from "../components/ChatBotUI";
import MoodChart from "../components/MoodChart";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { API_ENDPOINTS } from "../lib/api";
import {
  mockChatHistory,
  mockMoodData,
  getMoodColor,
  getMoodEmoji,
  formatDate,
} from "../data/mockData";

const Dashboard = () => {
  const { user, updateStats } = useAuth();
  const [chatMessages, setChatMessages] = useState(mockChatHistory);
  const [newJournalEntry, setNewJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingEntries, setIsAnalyzingEntries] = useState(false);
  const [realTimeMoodData, setRealTimeMoodData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);

  // Load journal entries from Supabase
  useEffect(() => {
    const loadJournalEntries = async () => {
      if (!user?.id) {
        setIsLoadingEntries(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading journal entries:", error);
        } else {
          // Transform Supabase data to match the expected format
          const transformedEntries = data.map((entry) => ({
            id: entry.id,
            userId: entry.user_id,
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            date: entry.created_at,
            timestamp: new Date(entry.created_at).getTime(),
            emotionAnalysis: entry.emotion_analysis,
          }));
          setJournalEntries(transformedEntries);
        }
      } catch (error) {
        console.error("Error loading journal entries:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadJournalEntries();
  }, [user?.id]);

  // Function to generate real-time mood data from journal entries
  const generateRealTimeMoodData = useCallback(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push({
        day: days[date.getDay()],
        date: date.toISOString().split("T")[0],
        mood: 3.0, // Default neutral mood
        hasEntry: false,
      });
    }

    // Map journal entries to days and calculate mood scores
    journalEntries.forEach((entry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0];
      const dayData = last7Days.find((d) => d.date === entryDate);

      if (dayData && entry.emotionAnalysis) {
        dayData.hasEntry = true;

        // Calculate mood score based on emotion analysis
        let moodScore = 3.0; // Default neutral

        if (
          entry.emotionAnalysis.emotions &&
          Array.isArray(entry.emotionAnalysis.emotions) &&
          entry.emotionAnalysis.emotions.length > 0
        ) {
          // Map emotions to mood scores
          const emotionMoodMap = {
            joy: 5.0,
            happy: 4.8,
            excited: 4.5,
            calm: 4.0,
            "calm and reflective": 3.8,
            balanced: 3.7,
            neutral: 3.0,
            surprise: 3.5,
            fear: 2.0,
            anxiety: 2.2,
            sadness: 1.5,
            sad: 1.8,
            anger: 1.8,
            frustrated: 2.3,
          };

          // Calculate weighted average of all emotions
          let totalWeightedScore = 0;
          let totalWeight = 0;

          entry.emotionAnalysis.emotions.forEach((emotion) => {
            // Handle both object {label, score} and string formats
            let emotionLabel, emotionScore;

            if (typeof emotion === "object" && emotion.label) {
              emotionLabel = emotion.label.toLowerCase();
              emotionScore = emotion.score || 1;
            } else if (typeof emotion === "string") {
              emotionLabel = emotion.toLowerCase();
              emotionScore = 1;
            } else {
              return; // Skip invalid entries
            }

            const baseMood = emotionMoodMap[emotionLabel] || 3.0;
            totalWeightedScore += baseMood * emotionScore;
            totalWeight += emotionScore;
          });

          if (totalWeight > 0) {
            moodScore = totalWeightedScore / totalWeight;
          }

          // Clamp between 1 and 5
          moodScore = Math.max(1.0, Math.min(5.0, moodScore));
        }

        dayData.mood = parseFloat(moodScore.toFixed(1));
      }
    });

    return last7Days;
  }, [journalEntries]);

  // Update real-time mood data whenever journal entries change
  useEffect(() => {
    const moodData = generateRealTimeMoodData();
    setRealTimeMoodData(moodData);
  }, [generateRealTimeMoodData]);

  // Function to analyze all journal entries for dashboard insights
  const analyzeAllEntries = async () => {
    if (journalEntries.length === 0) return;

    setIsAnalyzingEntries(true);
    try {
      // Combine all journal content for overall analysis
      const allContent = journalEntries.map((entry) => entry.content).join(" ");

      const response = await fetch(API_ENDPOINTS.ANALYZE_JOURNAL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journal: allContent }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiAnalysis(result);
      } else {
        console.error("Failed to analyze entries for dashboard");
      }
    } catch (error) {
      console.error("Error analyzing entries:", error);
    } finally {
      setIsAnalyzingEntries(false);
    }
  };

  // Generate personalized tips based on detected emotions
  const generatePersonalizedTips = (emotions, dominantEmotion) => {
    const tipDatabase = {
      joy: [
        "Continue engaging in activities that bring you happiness",
        "Share your positive energy with others around you",
        "Practice gratitude to maintain this positive momentum",
      ],
      sadness: [
        "Allow yourself to feel these emotions - they're valid",
        "Consider reaching out to friends or family for support",
        "Try gentle activities like walking or listening to calming music",
      ],
      anger: [
        "Practice deep breathing exercises when feeling frustrated",
        "Try physical exercise to channel your energy positively",
        "Consider what's at the root of your anger and address it calmly",
      ],
      fear: [
        "Use grounding techniques like the 5-4-3-2-1 method",
        "Break down your worries into manageable, actionable steps",
        "Remember that courage isn't the absence of fear, but action despite it",
      ],
      surprise: [
        "Take time to process unexpected events at your own pace",
        "Journal about new experiences to understand your reactions",
        "Embrace the unexpected as opportunities for growth",
      ],
      neutral: [
        "Use this balanced state for reflection and planning",
        "Try new activities to explore different emotional experiences",
        "Practice mindfulness to appreciate moments of calm",
      ],
    };

    // Get tips for the dominant emotion, fallback to neutral
    const emotionTips = tipDatabase[dominantEmotion] || tipDatabase.neutral;

    // Add general tips based on multiple emotions detected
    const generalTips = [];
    if (emotions.includes("joy") && emotions.includes("sadness")) {
      generalTips.push(
        "You're experiencing a range of emotions - this is completely normal and healthy"
      );
    }
    if (emotions.length > 2) {
      generalTips.push(
        "Your emotional complexity shows deep self-awareness and processing"
      );
    }

    return [...emotionTips.slice(0, 2), ...generalTips].slice(0, 3);
  };

  // Ensure page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Analyze entries when they change
  useEffect(() => {
    if (journalEntries.length > 0) {
      analyzeAllEntries();
    }
  }, [journalEntries]);

  // Handle clicking on a journal entry to show analysis
  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowAnalysisPopup(true);
  };

  // Close the analysis popup
  const closeAnalysisPopup = () => {
    setShowAnalysisPopup(false);
    setSelectedEntry(null);
  };

  const handleSendMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleJournalSubmit = async () => {
    if (newJournalEntry.trim() && user?.id) {
      // Auto-generate title as current date
      const currentDate = new Date();
      const title = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      try {
        // First, get emotion analysis from AI
        let emotionAnalysis = null;
        try {
          const analysisResponse = await fetch(API_ENDPOINTS.ANALYZE_JOURNAL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ journal: newJournalEntry }),
          });

          if (analysisResponse.ok) {
            emotionAnalysis = await analysisResponse.json();
            console.log("Emotion analysis received:", emotionAnalysis);
          } else {
            console.error("Failed to get emotion analysis from AI");
          }
        } catch (aiError) {
          console.error("Error calling emotion analysis API:", aiError);
          // Continue without analysis if AI fails
        }

        // Save to Supabase with emotion analysis
        const { data, error } = await supabase
          .from("journal_entries")
          .insert([
            {
              user_id: user.id,
              title: title,
              content: newJournalEntry,
              mood: selectedMood,
              created_at: new Date().toISOString(),
              emotion_analysis: emotionAnalysis,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error saving journal entry:", error);
          alert("Error saving journal entry. Please try again.");
          return;
        }

        // Transform the saved entry to match local format
        const newEntry = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          mood: data.mood,
          date: data.created_at,
          timestamp: new Date(data.created_at).getTime(),
          emotionAnalysis: data.emotion_analysis,
        };

        // Update local state
        setJournalEntries([newEntry, ...journalEntries]);

        // Update user stats
        const newTotalEntries = (user?.stats?.totalEntries || 0) + 1;
        const lastEntryDate = user?.stats?.lastEntryDate;
        const today = new Date().toDateString();

        let newStreak = user?.stats?.streak || 0;
        if (lastEntryDate) {
          const lastDate = new Date(lastEntryDate).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();

          if (lastDate === yesterday) {
            // Last entry was yesterday, increment streak
            newStreak += 1;
          } else if (lastDate === today) {
            // Already posted today, keep current streak
            newStreak = user?.stats?.streak || 1;
          } else {
            // More than one day gap, reset streak to 1
            newStreak = 1;
          }
        } else {
          // First entry ever
          newStreak = 1;
        }

        const newLongestStreak = Math.max(
          newStreak,
          user?.stats?.longestStreak || 0
        );

        await updateStats({
          totalEntries: newTotalEntries,
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastEntryDate: new Date().toISOString(),
        });

        console.log("Streak updated:", {
          newStreak,
          newLongestStreak,
          lastEntryDate: new Date().toISOString(),
        });

        alert("Journal entry saved successfully!");

        // Reset form
        setNewJournalEntry("");
        setSelectedMood("neutral");
      } catch (error) {
        console.error("Error saving journal entry:", error);
        alert("Error saving journal entry. Please try again.");
      }
    }
  };

  const clearAllEntries = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all journal entries? This action cannot be undone."
      )
    ) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("user_id", user?.id);

        if (error) {
          console.error("Error deleting entries:", error);
          alert("Error deleting journal entries. Please try again.");
          return;
        }

        setJournalEntries([]);
        alert("All journal entries have been cleared.");
      } catch (error) {
        console.error("Error deleting entries:", error);
        alert("Error deleting journal entries. Please try again.");
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const moodOptions = [
    { value: "happy", emoji: "🙂", color: "mood-happy" },
    { value: "neutral", emoji: "😐", color: "mood-neutral" },
    { value: "sad", emoji: "☹️", color: "mood-sad" },
  ];

  const journalHighlights = [
    {
      title: "Current Feeling",
      content:
        selectedMood === "happy"
          ? "You're feeling positive and energetic!"
          : selectedMood === "sad"
          ? "It's okay to feel down sometimes."
          : "You're in a balanced state of mind.",
      icon: Heart,
      color:
        selectedMood === "happy"
          ? "leaf"
          : selectedMood === "sad"
          ? "bark"
          : "earth",
    },
    {
      title: "Suggested Activity",
      content:
        selectedMood === "happy"
          ? "Continue this positive momentum with gratitude practice."
          : selectedMood === "sad"
          ? "Try a gentle breathing exercise or take a nature walk."
          : "A short meditation might help center your thoughts.",
      icon: Lightbulb,
      color: "moss",
    },
    {
      title: "Daily Insight",
      content:
        "Remember: Every emotion is temporary and has something to teach us.",
      icon: BookOpen,
      color: "forest",
    },
  ];

  const stats = [
    {
      label: "Current Streak",
      value: user?.stats?.streak || 0,
      unit: "days",
      icon: Flame,
      color: "from-earth-400 to-earth-500",
      bgColor:
        "from-earth-50/80 to-earth-100/80 dark:from-earth-900/40 dark:to-earth-800/40",
    },
    {
      label: "Total Entries",
      value: user?.stats?.totalEntries || 0,
      unit: "entries",
      icon: Target,
      color: "from-forest-400 to-forest-500",
      bgColor:
        "from-forest-50/80 to-forest-100/80 dark:from-forest-900/40 dark:to-forest-800/40",
    },
    {
      label: "This Week",
      value: journalEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length,
      unit: "reflections",
      icon: TrendingUp,
      color: "from-moss-400 to-moss-500",
      bgColor:
        "from-moss-50/80 to-moss-100/80 dark:from-moss-900/40 dark:to-moss-800/40",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 scrollbar-hide">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-forest-700 dark:text-forest-100 drop-shadow-lg mb-2"
          >
            {getGreeting()}, {user.name}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-forest-600 dark:text-forest-200/90 drop-shadow-md"
          >
            How are you feeling today?
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`bg-gradient-to-r ${stat.bgColor} backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-forest-200/40 dark:border-forest-700/40`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-300 mb-1">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl sm:text-2xl font-bold text-bark-900 dark:text-forest-100">
                        {stat.value}
                      </span>
                      <span className="text-xs sm:text-sm text-bark-500 dark:text-forest-400">
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="text-white" size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Previous Journals Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-forest-500 to-moss-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-bark-900 dark:text-forest-100">
                  Previous Journals
                </h2>
                <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-300">
                  Your recent reflections
                </p>
              </div>
            </div>
            {journalEntries.length > 0 && (
              <button
                onClick={clearAllEntries}
                className="text-xs text-bark-400 dark:text-forest-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1"
                title="Clear all entries"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {journalEntries.slice(0, 5).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => handleEntryClick(entry)}
                className="p-3 sm:p-4 bg-forest-50/60 dark:bg-forest-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-forest-200/50 dark:border-forest-600/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
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

            {journalEntries.length === 0 && (
              <div className="text-center py-8">
                <BookOpen
                  className="mx-auto text-bark-400 dark:text-forest-500 mb-3"
                  size={48}
                />
                <p className="text-bark-500 dark:text-forest-400">
                  No journal entries yet
                </p>
                <p className="text-sm text-bark-400 dark:text-forest-500">
                  Start writing to see your entries here
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Journal Upload Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-moss-500 to-leaf-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Plus className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-bark-900 dark:text-forest-100">
                New Journal Entry
              </h2>
              <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-300">
                Express your thoughts
              </p>
            </div>
          </div>

          {/* Quick Entry Form */}
          <div className="space-y-4">
            {/* Auto-generated title preview */}
            <div className="p-3 bg-forest-100/50 dark:bg-forest-700/30 rounded-lg border border-forest-200/50 dark:border-forest-600/50">
              <div className="flex items-center space-x-2">
                <Calendar
                  className="text-forest-600 dark:text-forest-400"
                  size={16}
                />
                <span className="text-sm font-medium text-bark-800 dark:text-forest-200">
                  Entry Title:
                </span>
                <span className="text-sm text-bark-600 dark:text-forest-300">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <textarea
              value={newJournalEntry}
              onChange={(e) => setNewJournalEntry(e.target.value)}
              placeholder="What's on your mind today? Share your thoughts, feelings, or experiences..."
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-forest-200/60 dark:border-forest-600/60 bg-forest-50/50 dark:bg-forest-700/50 backdrop-blur-sm rounded-lg sm:rounded-xl text-bark-900 dark:text-forest-100 placeholder-bark-500 dark:placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJournalSubmit}
              disabled={!newJournalEntry.trim()}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-3"
            >
              <Send size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Save Journal Entry</span>
              <span className="sm:hidden">Save Entry</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Analysis/Insights Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-forest-500 to-earth-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-bark-900 dark:text-forest-100">
                AI Analysis & Insights
              </h2>
              <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-300">
                Understanding your journey
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Mood Analysis */}
            <div className="p-3 sm:p-4 bg-forest-50/60 dark:bg-forest-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-forest-200/50 dark:border-forest-600/50">
              <div className="flex items-center space-x-2 mb-2">
                <Heart
                  className="text-forest-600 dark:text-forest-400"
                  size={14}
                />
                <h3 className="text-sm sm:text-base font-semibold text-bark-900 dark:text-forest-100">
                  Emotional Pattern
                </h3>
              </div>
              {isAnalyzingEntries ? (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-bark-600 dark:text-forest-200">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-forest-500"></div>
                  <span>Analyzing your emotional patterns...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-200">
                    {aiAnalysis.summary}
                  </p>
                  {aiAnalysis.emotions && aiAnalysis.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-bark-500 dark:text-forest-400">
                        Detected emotions:
                      </span>
                      {aiAnalysis.emotions.map((emotion, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-forest-100 dark:bg-forest-700 rounded-full text-xs font-medium text-forest-700 dark:text-forest-300 capitalize"
                        >
                          {typeof emotion === "object"
                            ? emotion.label
                            : emotion}
                        </span>
                      ))}
                    </div>
                  )}
                  {aiAnalysis.dominant_emotion && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-forest-100/50 dark:bg-forest-700/50 rounded-lg">
                      <span className="text-xs text-bark-600 dark:text-forest-300">
                        Primary emotion:{" "}
                        <span className="font-medium capitalize">
                          {aiAnalysis.dominant_emotion}
                        </span>
                      </span>
                      <span className="text-xs text-forest-600 dark:text-forest-400">
                        Intensity: {aiAnalysis.intensity}/10
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-200">
                  Write some journal entries to see your emotional patterns
                  analyzed here.
                </p>
              )}
            </div>

            {/* Growth Insights */}
            <div className="p-3 sm:p-4 bg-moss-50/60 dark:bg-moss-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-moss-200/50 dark:border-moss-600/50">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb
                  className="text-moss-600 dark:text-moss-400"
                  size={14}
                />
                <h3 className="text-sm sm:text-base font-semibold text-bark-900 dark:text-forest-100">
                  Growth Opportunities
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-bark-600 dark:text-forest-200">
                Your writing patterns suggest a focus on personal relationships
                and self-reflection. Consider exploring mindfulness practices to
                enhance emotional awareness.
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-3 sm:p-4 bg-earth-50/60 dark:bg-earth-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-earth-200/50 dark:border-earth-600/50">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen
                  className="text-earth-600 dark:text-earth-400"
                  size={14}
                />
                <h3 className="text-sm sm:text-base font-semibold text-bark-900 dark:text-forest-100">
                  Personalized Tips
                </h3>
              </div>
              {isAnalyzingEntries ? (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-bark-600 dark:text-forest-200">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-earth-500"></div>
                  <span>Generating personalized tips...</span>
                </div>
              ) : aiAnalysis && aiAnalysis.emotions ? (
                <ul className="text-sm text-bark-600 dark:text-forest-200 space-y-1">
                  {generatePersonalizedTips(
                    aiAnalysis.emotions,
                    aiAnalysis.dominant_emotion
                  ).map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              ) : (
                <ul className="text-sm text-bark-600 dark:text-forest-200 space-y-1">
                  <li>• Try morning journaling for better clarity</li>
                  <li>• Practice gratitude exercises on difficult days</li>
                  <li>• Use breathing techniques when feeling overwhelmed</li>
                </ul>
              )}
            </div>

            {/* AI Status Indicator */}
            <div className="text-center pt-2">
              <div className="flex items-center justify-center space-x-2 text-xs text-bark-500 dark:text-forest-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAnalyzingEntries
                      ? "bg-yellow-400 animate-pulse"
                      : aiAnalysis
                      ? "bg-green-400"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span>
                  {isAnalyzingEntries
                    ? "AI Analysis In Progress..."
                    : aiAnalysis
                    ? "AI Analysis Complete"
                    : "Waiting for Journal Entries"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Journal Input and Highlights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Center Text Input */}
          <div className="lg:col-span-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="card p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-bark-900 dark:text-forest-100 mb-4">
                Quick Reflection
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="One word to describe your day..."
                  className="w-full px-4 py-3 border border-forest-200/60 dark:border-forest-600/60 bg-forest-50/50 dark:bg-forest-700/50 backdrop-blur-sm rounded-xl text-center text-bark-900 dark:text-forest-100 placeholder-bark-500 dark:placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary w-full"
                >
                  Capture Moment
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Journal Highlights */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {journalHighlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="card p-4"
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-r from-${highlight.color}-400 to-${highlight.color}-500 rounded-xl flex items-center justify-center mb-3`}
                    >
                      <Icon className="text-white" size={20} />
                    </div>
                    <h4 className="font-semibold text-bark-900 dark:text-forest-100 mb-2">
                      {highlight.title}
                    </h4>
                    <p className="text-sm text-bark-600 dark:text-forest-200">
                      {highlight.content}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Calendar
            className="text-forest-600 dark:text-forest-400"
            size={24}
          />
          <h2 className="text-2xl font-bold text-bark-900 dark:text-forest-100">
            Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Mood Chart */}
          <div className="xl:col-span-2">
            <MoodChart
              data={
                realTimeMoodData.length > 0 ? realTimeMoodData : mockMoodData
              }
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Average Mood
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {(() => {
                        const avgMood =
                          realTimeMoodData.length > 0
                            ? (
                                realTimeMoodData.reduce(
                                  (sum, d) => sum + d.mood,
                                  0
                                ) / realTimeMoodData.length
                              ).toFixed(1)
                            : "3.0";
                        return avgMood >= 4 ? "😊" : avgMood >= 3 ? "😐" : "☹️";
                      })()}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {realTimeMoodData.length > 0
                        ? (
                            realTimeMoodData.reduce(
                              (sum, d) => sum + d.mood,
                              0
                            ) / realTimeMoodData.length
                          ).toFixed(1)
                        : "3.0"}
                      /5
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Best Day
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌟</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (realTimeMoodData.length === 0) return "N/A";
                        const bestDay = realTimeMoodData.reduce(
                          (best, current) =>
                            current.mood > best.mood ? current : best
                        );
                        return bestDay.day;
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Entries This Week
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📝</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {realTimeMoodData.filter((d) => d.hasEntry).length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mindful Moment
              </h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-mint-400 to-mint-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧘‍♀️</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4">
                  "The present moment is the only time over which we have
                  dominion."
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  - Thich Nhat Hanh
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Chatbot Section (Scroll Down) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mb-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-bark-900 dark:text-forest-100 mb-2">
            Chat with Your Mindful Assistant
          </h2>
          <p className="text-bark-600 dark:text-forest-300">
            Need someone to talk to? Our AI assistant is here to listen and help
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatBotUI
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </motion.div>

      {/* Emotion Analysis Popup */}
      {showAnalysisPopup && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-forest-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-forest-200 dark:border-forest-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-forest-200 dark:border-forest-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-forest-500 to-moss-500 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-bark-900 dark:text-forest-100">
                    Emotion Analysis
                  </h3>
                  <p className="text-sm text-bark-600 dark:text-forest-300">
                    {selectedEntry.title}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAnalysisPopup}
                className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-lg transition-colors"
              >
                <X className="text-bark-600 dark:text-forest-400" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Journal Content Preview */}
              <div className="p-4 bg-forest-50 dark:bg-forest-900/50 rounded-xl">
                <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-2 flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span>Journal Entry</span>
                </h4>
                <p className="text-sm text-bark-600 dark:text-forest-300 line-clamp-3">
                  {selectedEntry.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`mood-indicator ${getMoodColor(
                        selectedEntry.mood
                      )}`}
                    ></div>
                    <span className="text-xl">
                      {getMoodEmoji(selectedEntry.mood)}
                    </span>
                    <span className="text-sm text-bark-500 dark:text-forest-400 capitalize">
                      {selectedEntry.mood} mood
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-bark-500 dark:text-forest-400">
                    <Calendar size={12} />
                    <span>{formatDate(selectedEntry.date)}</span>
                  </div>
                </div>
              </div>

              {/* Emotion Analysis Results */}
              {selectedEntry.emotionAnalysis ? (
                <div className="space-y-4">
                  {/* Summary */}
                  {selectedEntry.emotionAnalysis.summary && (
                    <div className="p-4 bg-moss-50 dark:bg-moss-900/30 rounded-xl">
                      <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-2 flex items-center space-x-2">
                        <Zap size={16} />
                        <span>AI Summary</span>
                      </h4>
                      <p className="text-sm text-bark-600 dark:text-forest-300">
                        {selectedEntry.emotionAnalysis.summary}
                      </p>
                    </div>
                  )}

                  {/* Detected Emotions */}
                  {selectedEntry.emotionAnalysis.emotions &&
                    selectedEntry.emotionAnalysis.emotions.length > 0 && (
                      <div className="p-4 bg-earth-50 dark:bg-earth-900/30 rounded-xl">
                        <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-3 flex items-center space-x-2">
                          <Heart size={16} />
                          <span>Detected Emotions</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.emotionAnalysis.emotions.map(
                            (emotion, index) => {
                              const emotionLabel =
                                typeof emotion === "object"
                                  ? emotion.label
                                  : emotion;
                              const emotionScore =
                                typeof emotion === "object"
                                  ? emotion.score
                                  : null;

                              return (
                                <div
                                  key={index}
                                  className="px-3 py-2 bg-forest-100 dark:bg-forest-700 rounded-full border border-forest-200 dark:border-forest-600"
                                >
                                  <span className="text-sm font-medium text-forest-700 dark:text-forest-300 capitalize">
                                    {emotionLabel}
                                  </span>
                                  {emotionScore && (
                                    <span className="text-xs text-forest-500 dark:text-forest-400 ml-1">
                                      ({(emotionScore * 100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  {/* Dominant Emotion & Intensity */}
                  {(selectedEntry.emotionAnalysis.dominant_emotion ||
                    selectedEntry.emotionAnalysis.intensity) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEntry.emotionAnalysis.dominant_emotion && (
                        <div className="p-4 bg-forest-50 dark:bg-forest-900/50 rounded-xl">
                          <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-2">
                            Primary Emotion
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">
                              {selectedEntry.emotionAnalysis
                                .dominant_emotion === "joy"
                                ? "😊"
                                : selectedEntry.emotionAnalysis
                                    .dominant_emotion === "sadness"
                                ? "😢"
                                : selectedEntry.emotionAnalysis
                                    .dominant_emotion === "anger"
                                ? "😠"
                                : selectedEntry.emotionAnalysis
                                    .dominant_emotion === "fear"
                                ? "😰"
                                : selectedEntry.emotionAnalysis
                                    .dominant_emotion === "surprise"
                                ? "😲"
                                : "😐"}
                            </span>
                            <span className="font-semibold text-bark-900 dark:text-forest-100 capitalize">
                              {selectedEntry.emotionAnalysis.dominant_emotion}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedEntry.emotionAnalysis.intensity && (
                        <div className="p-4 bg-moss-50 dark:bg-moss-900/30 rounded-xl">
                          <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-2">
                            Intensity Level
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-forest-200 dark:bg-forest-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-forest-500 to-moss-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (selectedEntry.emotionAnalysis.intensity /
                                      10) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="font-semibold text-bark-900 dark:text-forest-100">
                              {selectedEntry.emotionAnalysis.intensity}/10
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedEntry.emotionAnalysis.recommendations &&
                    selectedEntry.emotionAnalysis.recommendations.length >
                      0 && (
                      <div className="p-4 bg-leaf-50 dark:bg-leaf-900/30 rounded-xl">
                        <h4 className="font-medium text-bark-900 dark:text-forest-100 mb-3 flex items-center space-x-2">
                          <Lightbulb size={16} />
                          <span>Personalized Recommendations</span>
                        </h4>
                        <ul className="space-y-2">
                          {selectedEntry.emotionAnalysis.recommendations.map(
                            (rec, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-forest-500 dark:text-forest-400 mt-1">
                                  •
                                </span>
                                <span className="text-sm text-bark-600 dark:text-forest-300">
                                  {rec}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain
                    className="mx-auto text-bark-400 dark:text-forest-500 mb-3"
                    size={48}
                  />
                  <p className="text-bark-500 dark:text-forest-400 mb-2">
                    No emotion analysis available
                  </p>
                  <p className="text-sm text-bark-400 dark:text-forest-500">
                    This entry was created before AI analysis was enabled
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-forest-200 dark:border-forest-700 bg-forest-50/50 dark:bg-forest-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-bark-500 dark:text-forest-400">
                  Analysis powered by AI • Results may vary based on context
                </p>
                <button
                  onClick={closeAnalysisPopup}
                  className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
