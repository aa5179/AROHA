import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  BookOpen,
  Calendar,
  ArrowLeft,
  Brain,
  Heart,
  TrendingUp,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { API_ENDPOINTS } from "../lib/api";
import { formatDate, mockJournalEntries } from "../data/mockData";

const Journal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("write");
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [emotionAnalysis, setEmotionAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [storedEntries, setStoredEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Load entries from Supabase
  const loadEntriesFromSupabase = async () => {
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
        setStoredEntries(transformedEntries);
      }
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Load entries on component mount
  useEffect(() => {
    loadEntriesFromSupabase();
  }, [user?.id]);

  // Toggle entry selection
  const toggleSelectEntry = (entryId) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  // Select all entries
  const selectAllEntries = () => {
    setSelectedEntries(storedEntries.map((entry) => entry.id));
  };

  // Deselect all entries
  const deselectAllEntries = () => {
    setSelectedEntries([]);
  };

  // Delete selected entries
  const deleteSelectedEntries = async () => {
    if (selectedEntries.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedEntries.length} ${
        selectedEntries.length === 1 ? "entry" : "entries"
      }?`
    );

    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .in("id", selectedEntries);

        if (error) {
          console.error("Error deleting entries:", error);
          alert("Error deleting entries. Please try again.");
          return;
        }

        const updatedEntries = storedEntries.filter(
          (entry) => !selectedEntries.includes(entry.id)
        );
        setStoredEntries(updatedEntries);
        setSelectedEntries([]);
        setIsSelectMode(false);
      } catch (error) {
        console.error("Error deleting entries:", error);
        alert("Error deleting entries. Please try again.");
      }
    }
  };

  // Clear all entries
  const clearAllEntries = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to delete ALL journal entries? This cannot be undone."
    );

    if (confirmClear) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("user_id", user?.id);

        if (error) {
          console.error("Error deleting all entries:", error);
          alert("Error deleting entries. Please try again.");
          return;
        }

        setStoredEntries([]);
        setSelectedEntries([]);
        setIsSelectMode(false);
      } catch (error) {
        console.error("Error deleting all entries:", error);
        alert("Error deleting entries. Please try again.");
      }
    }
  };

  // Combine stored entries with mock entries for display, avoiding duplicates
  // Use only stored entries (no mock data)
  const allEntries = storedEntries.sort(
    (a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
  );

  const analyzeEmotion = async (journalText, autoSwitchTab = false) => {
    if (!journalText || journalText.trim().length < 10) {
      console.log("Text too short for analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log(
        "Analyzing emotion for text:",
        journalText.substring(0, 50) + "..."
      );

      const requestBody = { journal: journalText };
      console.log("Request body:", requestBody);

      const response = await fetch(API_ENDPOINTS.ANALYZE_JOURNAL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log("Emotion analysis result:", result);
        setEmotionAnalysis(result);

        // Only auto-switch to analysis tab if explicitly requested (after saving)
        if (autoSwitchTab && activeTab === "write") {
          setActiveTab("analysis");
        }

        return result;
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to analyze emotions. Status:",
          response.status,
          "Error:",
          errorText
        );
        setEmotionAnalysis(null);
        alert(`Analysis failed: ${response.status} - ${errorText}`);
        return null;
      }
    } catch (error) {
      console.error("Error analyzing emotions:", error);
      setEmotionAnalysis(null);
      alert(`Analysis error: ${error.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim() || !user?.id) {
      return;
    }

    setIsSaving(true);

    try {
      // Start emotion analysis first
      const analysis = await analyzeEmotion(newEntry.content, false);

      // Save to Supabase
      const { data, error } = await supabase
        .from("journal_entries")
        .insert([
          {
            user_id: user.id,
            title: newEntry.title,
            content: newEntry.content,
            mood: "neutral", // Default mood
            emotion_analysis: analysis,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error saving journal entry:", error);
        alert("Error saving journal entry. Please try again.");
        setIsSaving(false);
        return;
      }

      // Transform the saved entry to match local format
      const savedEntry = {
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
      setStoredEntries([savedEntry, ...storedEntries]);
      setLastSavedEntry(savedEntry);
      setEmotionAnalysis(analysis);

      // Reset form
      setNewEntry({ title: "", content: "" });

      // Switch to history tab
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("Error saving journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }));

    // Trigger emotion analysis for content if it's long enough
    if (field === "content" && value.length > 50 && !isAnalyzing) {
      // Debounce the analysis - only analyze if user stops typing for 2 seconds
      clearTimeout(window.analysisTimeout);
      window.analysisTimeout = setTimeout(() => {
        if (value.length > 50) {
          analyzeEmotion(value);
        }
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-lavender-600 bg-clip-text text-transparent">
              Journal
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Express your thoughts and track your journey
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="text-gray-400" size={16} />
          <span className="text-gray-600 dark:text-gray-300">
            {formatDate(new Date().toISOString())}
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("write")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "write"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Write New Entry
          </button>
          {lastSavedEntry && (
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === "analysis"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Brain size={16} />
              <span>Emotion Analysis</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "history"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Past Entries ({storedEntries.length})
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === "write" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Title Input */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entry Title
            </label>
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Give your reflection a title..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Content Editor */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Reflection
            </label>
            <textarea
              value={newEntry.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Write about your day, your thoughts, your feelings... Let it all out."
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {newEntry.content.length} characters
                </div>
                {newEntry.content.length > 10 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => analyzeEmotion(newEntry.content, false)}
                    disabled={isAnalyzing || newEntry.content.length < 10}
                    className="px-2 sm:px-3 py-1 sm:py-1 text-xs sm:text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Brain size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">
                      {isAnalyzing ? "Analyzing..." : "Analyze Now"}
                    </span>
                    <span className="sm:hidden">
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </span>
                  </motion.button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={
                  !newEntry.title.trim() || !newEntry.content.trim() || isSaving
                }
                className={`btn-primary flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2 w-full sm:w-auto ${
                  !newEntry.title.trim() || !newEntry.content.trim() || isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {isSaving ? "Saving..." : "Save Entry"}
                </span>
                <span className="sm:hidden">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : activeTab === "analysis" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Saved Entry Summary */}
          {lastSavedEntry && (
            <div className="card p-6 border-l-4 border-primary-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <BookOpen
                    className="text-primary-600 dark:text-primary-400"
                    size={20}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lastSavedEntry.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saved on {formatDate(lastSavedEntry.date)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {lastSavedEntry.content.length > 200
                  ? lastSavedEntry.content.substring(0, 200) + "..."
                  : lastSavedEntry.content}
              </p>
            </div>
          )}

          {/* Emotion Analysis Results */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-primary-100 to-lavender-100 dark:from-primary-900/20 dark:to-lavender-900/20 rounded-xl">
                <Brain
                  className="text-primary-600 dark:text-primary-400"
                  size={24}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Emotion Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered insights from your journal entry
                </p>
              </div>
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Analyzing your emotions...
                  </p>
                </div>
              </div>
            ) : emotionAnalysis ? (
              <div className="space-y-4">
                {/* Display emotion analysis summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Emotional Insight
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {emotionAnalysis.summary}
                  </p>
                </div>

                {/* Display detected emotions */}
                {emotionAnalysis.emotions &&
                  emotionAnalysis.emotions.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Detected Emotions
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          // Filter out neutral if it's below 60%
                          const emotions = emotionAnalysis.emotions;
                          const neutralEmotion = emotions.find(
                            (e) =>
                              (typeof e === "string"
                                ? e
                                : e.label
                              )?.toLowerCase() === "neutral"
                          );

                          const neutralScore =
                            neutralEmotion && typeof neutralEmotion === "object"
                              ? neutralEmotion.score
                              : 0;

                          // Find joy and sadness emotions
                          const joyEmotion = emotions.find(
                            (e) =>
                              (typeof e === "string"
                                ? e
                                : e.label
                              )?.toLowerCase() === "joy"
                          );
                          const sadnessEmotion = emotions.find(
                            (e) =>
                              (typeof e === "string"
                                ? e
                                : e.label
                              )?.toLowerCase() === "sadness"
                          );

                          const joyScore =
                            joyEmotion && typeof joyEmotion === "object"
                              ? joyEmotion.score
                              : 0;
                          const sadnessScore =
                            sadnessEmotion && typeof sadnessEmotion === "object"
                              ? sadnessEmotion.score
                              : 0;

                          // Filter emotions
                          let displayEmotions = emotions;

                          // If neutral is below 60%, filter it out
                          if (neutralScore < 0.6) {
                            displayEmotions = displayEmotions.filter(
                              (e) =>
                                (typeof e === "string"
                                  ? e
                                  : e.label
                                )?.toLowerCase() !== "neutral"
                            );
                          }

                          // If joy is less than 20% AND sadness is high (>40%), filter out joy
                          if (joyScore < 0.2 && sadnessScore > 0.4) {
                            displayEmotions = displayEmotions.filter(
                              (e) =>
                                (typeof e === "string"
                                  ? e
                                  : e.label
                                )?.toLowerCase() !== "joy"
                            );
                          }

                          return displayEmotions.map((emotion, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                  {typeof emotion === "string"
                                    ? emotion
                                    : emotion.label}
                                </span>
                                {typeof emotion === "object" &&
                                  emotion.score && (
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                      {Math.round(emotion.score * 100)}%
                                    </span>
                                  )}
                              </div>
                              {typeof emotion === "object" && emotion.score && (
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      emotion.score > 0.5
                                        ? "bg-gradient-to-r from-green-400 to-green-600"
                                        : emotion.score > 0.3
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                                    }`}
                                    style={{ width: `${emotion.score * 100}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                {/* Display dominant emotion and intensity */}
                {emotionAnalysis.dominant_emotion && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Primary Emotion
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {emotionAnalysis.dominant_emotion}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Intensity:
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {emotionAnalysis.intensity}/10
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  <Brain size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No emotion analysis available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {storedEntries.length === 0 ? (
            <div className="card p-8 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No journal entries yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start writing your first journal entry to see it here with
                emotion analysis.
              </p>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isSelectMode
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {isSelectMode ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                    <span>{isSelectMode ? "Cancel" : "Select"}</span>
                  </button>

                  {isSelectMode && (
                    <>
                      <button
                        onClick={selectAllEntries}
                        className="px-4 py-2 rounded-lg font-medium bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAllEntries}
                        className="px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Deselect All
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {isSelectMode && selectedEntries.length > 0 && (
                    <button
                      onClick={deleteSelectedEntries}
                      className="px-4 py-2 rounded-lg font-medium bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span>Delete Selected ({selectedEntries.length})</span>
                    </button>
                  )}

                  <button
                    onClick={clearAllEntries}
                    className="px-4 py-2 rounded-lg font-medium bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* Entries List */}
              {storedEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card p-6 hover:shadow-lg transition-all duration-200 ${
                    isSelectMode && selectedEntries.includes(entry.id)
                      ? "ring-2 ring-primary-500 dark:ring-primary-400"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Selection Checkbox */}
                      {isSelectMode && (
                        <button
                          onClick={() => toggleSelectEntry(entry.id)}
                          className="flex-shrink-0"
                        >
                          {selectedEntries.includes(entry.id) ? (
                            <CheckSquare
                              className="text-primary-600 dark:text-primary-400"
                              size={20}
                            />
                          ) : (
                            <Square
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              size={20}
                            />
                          )}
                        </button>
                      )}

                      {/* Analysis Status Badge */}
                      {entry.emotionAnalysis?.emotions &&
                      entry.emotionAnalysis.emotions.length > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                          ✓ Analyzed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                          Not analyzed
                        </span>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(entry.date || entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Brain className="text-gray-400" size={20} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {entry.content}
                  </p>

                  {/* Emotion Analysis Display */}
                  {/* Always show for mock entries (have timestamp), conditionally for stored entries (have date) */}
                  {(entry.timestamp &&
                    entry.emotionAnalysis &&
                    entry.emotionAnalysis.emotions) ||
                  (entry.date &&
                    !entry.timestamp &&
                    entry.emotionAnalysis &&
                    entry.emotionAnalysis.emotions &&
                    entry.emotionAnalysis.emotions.length > 0) ? (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain
                          className="text-primary-600 dark:text-primary-400"
                          size={16}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emotion Analysis
                        </span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {entry.emotionAnalysis.emotions &&
                          (() => {
                            // Filter out neutral if it's below 60%
                            const emotions = entry.emotionAnalysis.emotions;
                            const neutralEmotion = emotions.find(
                              (e) =>
                                (typeof e === "string"
                                  ? e
                                  : e.label
                                )?.toLowerCase() === "neutral"
                            );

                            const neutralScore =
                              neutralEmotion &&
                              typeof neutralEmotion === "object"
                                ? neutralEmotion.score
                                : 0;

                            // Find joy and sadness emotions
                            const joyEmotion = emotions.find(
                              (e) =>
                                (typeof e === "string"
                                  ? e
                                  : e.label
                                )?.toLowerCase() === "joy"
                            );
                            const sadnessEmotion = emotions.find(
                              (e) =>
                                (typeof e === "string"
                                  ? e
                                  : e.label
                                )?.toLowerCase() === "sadness"
                            );

                            const joyScore =
                              joyEmotion && typeof joyEmotion === "object"
                                ? joyEmotion.score
                                : 0;
                            const sadnessScore =
                              sadnessEmotion &&
                              typeof sadnessEmotion === "object"
                                ? sadnessEmotion.score
                                : 0;

                            // Filter emotions
                            let filteredEmotions = emotions;

                            // If neutral is below 60%, filter it out
                            if (neutralScore < 0.6) {
                              filteredEmotions = filteredEmotions.filter(
                                (e) =>
                                  (typeof e === "string"
                                    ? e
                                    : e.label
                                  )?.toLowerCase() !== "neutral"
                              );
                            }

                            // If joy is less than 20% AND sadness is high (>40%), filter out joy
                            if (joyScore < 0.2 && sadnessScore > 0.4) {
                              filteredEmotions = filteredEmotions.filter(
                                (e) =>
                                  (typeof e === "string"
                                    ? e
                                    : e.label
                                  )?.toLowerCase() !== "joy"
                              );
                            }

                            // Take first 3 after filtering
                            const displayEmotions = filteredEmotions.slice(
                              0,
                              3
                            );

                            return displayEmotions.map(
                              (emotion, emotionIndex) => {
                                // Handle both string and object formats
                                const emotionLabel =
                                  typeof emotion === "string"
                                    ? emotion
                                    : emotion.label;
                                const emotionScore =
                                  typeof emotion === "object" && emotion.score
                                    ? emotion.score
                                    : 0;

                                return (
                                  <div
                                    key={emotionIndex}
                                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {emotionLabel}
                                      </span>
                                      {emotionScore > 0 && (
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                          {Math.round(emotionScore * 100)}%
                                        </span>
                                      )}
                                    </div>
                                    {emotionScore > 0 && (
                                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                                        <div
                                          className={`h-1 rounded-full ${
                                            emotionScore > 0.5
                                              ? "bg-gradient-to-r from-green-400 to-green-600"
                                              : emotionScore > 0.3
                                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                              : "bg-gradient-to-r from-blue-400 to-blue-600"
                                          }`}
                                          style={{
                                            width: `${emotionScore * 100}%`,
                                          }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            );
                          })()}
                      </div>

                      {/* Wellness Suggestions */}
                      {entry.emotionAnalysis.wellness_suggestions &&
                        entry.emotionAnalysis.wellness_suggestions.length >
                          0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              💡 Suggestion:{" "}
                              {entry.emotionAnalysis.wellness_suggestions[0]}
                            </p>
                          </div>
                        )}
                    </div>
                  ) : entry.timestamp ? (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="text-sm text-gray-500">
                        Mock entry - emotion analysis should be available
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="text-sm text-gray-500">
                        Emotion analysis will appear after saving the entry
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Journal;
