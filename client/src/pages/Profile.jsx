import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Target,
  Award,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [weeklyStats, setWeeklyStats] = useState({
    journalEntries: 0,
    mindfulSessions: 0,
  });
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    goals: user?.goals || [],
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        goals: user.goals || [],
      });

      // Log stats for debugging
      console.log("Profile loaded - User stats:", user.stats);

      // Calculate weekly stats
      calculateWeeklyStats();
    }
  }, [user]);

  // Recalculate stats when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        calculateWeeklyStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const calculateWeeklyStats = async () => {
    if (!user?.id) return;

    // Get date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      // Get journal entries from Supabase
      const { data: journalEntries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", oneWeekAgo.toISOString());

      if (error) {
        console.error("Error loading journal entries:", error);
      }

      const weeklyJournalCount = journalEntries ? journalEntries.length : 0;

      // Get mindful sessions from localStorage (these aren't in DB yet)
      const mindfulSessions = JSON.parse(
        localStorage.getItem(`mindfulSessions_${user.id}`) || "[]"
      );

      // Filter sessions in the last week
      const weeklyMindfulSessions = mindfulSessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= oneWeekAgo;
      });

      setWeeklyStats({
        journalEntries: weeklyJournalCount,
        mindfulSessions: weeklyMindfulSessions.length,
      });
    } catch (error) {
      console.error("Error calculating weekly stats:", error);
    }
  };

  const stats = [
    {
      label: "Journal Entries",
      value: user?.stats?.totalEntries || 0,
      icon: "📝",
    },
    {
      label: "Current Streak",
      value: `${user?.stats?.streak || 0} days`,
      icon: "🔥",
    },
    {
      label: "Member Since",
      value: new Date(user?.joinDate || Date.now()).toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      ),
      icon: "📅",
    },
    {
      label: "Longest Streak",
      value: `${user?.stats?.longestStreak || 0} days`,
      icon: "🏆",
    },
  ];

  const achievements = [
    {
      title: "First Entry",
      description: "Wrote your first journal entry",
      earned: (user?.stats?.totalEntries || 0) >= 1,
    },
    {
      title: "Week Warrior",
      description: "Maintained a 7-day streak",
      earned: (user?.stats?.longestStreak || 0) >= 7,
    },
    {
      title: "Mindful Explorer",
      description: "Write 10 journal entries",
      earned: (user?.stats?.totalEntries || 0) >= 10,
    },
    {
      title: "Consistent Creator",
      description: "Write 30 entries",
      earned: (user?.stats?.totalEntries || 0) >= 30,
    },
    {
      title: "Month Master",
      description: "Maintain a 30-day streak",
      earned: (user?.stats?.longestStreak || 0) >= 30,
    },
    {
      title: "Wisdom Warrior",
      description: "Write 100 entries",
      earned: (user?.stats?.totalEntries || 0) >= 100,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: userInfo.name,
        bio: userInfo.bio,
        goals: userInfo.goals,
      });
      setIsEditing(false);
      setNewGoal("");
    } catch (error) {
      alert("Failed to update profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setUserInfo((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (indexToRemove) => {
    setUserInfo((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
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
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account and track your progress
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-lavender-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {userInfo.name.charAt(0)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {userInfo.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                      <Mail size={16} />
                      <span>{userInfo.email}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) =>
                      setUserInfo((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    {userInfo.bio}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Goals
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    {/* Goals List */}
                    <div className="flex flex-wrap gap-2">
                      {userInfo.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full flex items-center gap-2"
                        >
                          {goal}
                          <button
                            onClick={() => handleRemoveGoal(index)}
                            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remove goal"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add New Goal */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a new goal..."
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        onClick={handleAddGoal}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userInfo.goals.length > 0 ? (
                      userInfo.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                        >
                          {goal}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                        No goals set yet. Click "Edit Profile" to add some!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: isSaving ? 1 : 1.05 }}
                    whileTap={{ scale: isSaving ? 1 : 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </motion.button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewGoal("");
                    }}
                    disabled={isSaving}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <Award className="text-yellow-500" size={24} />
              <span>Achievements</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.earned
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                      }`}
                    >
                      {achievement.earned ? "🏆" : "🔒"}
                    </div>
                    <div>
                      <h4
                        className={`font-semibold ${
                          achievement.earned
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          achievement.earned
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <Target className="text-primary-500" size={24} />
              <span>Your Stats</span>
            </h3>

            <div className="space-y-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Progress
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    Journal Entries
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {weeklyStats.journalEntries}/7
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-lavender-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (weeklyStats.journalEntries / 7) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    Mindful Sessions
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {weeklyStats.mindfulSessions}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-mint-400 to-mint-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (weeklyStats.mindfulSessions / 5) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
