import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Supabase profiles table
  const loadUserProfile = async (userId) => {
    try {
      // Add 3 second timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 3000)
      );

      const queryPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: profile, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

      if (error && error.code !== "PGRST116") {
        console.error("Profile load error:", error);
        return null;
      }

      if (profile) {
        console.log("Profile loaded from Supabase:", profile);
        // Ensure stats exists
        if (!profile.stats) {
          profile.stats = {
            totalEntries: 0,
            streak: 0,
            longestStreak: 0,
            lastEntryDate: null,
          };
        }
      }

      return profile;
    } catch (err) {
      console.error("Failed to load profile (timeout or error):", err.message);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout - always set loading to false after 5 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn("Safety timeout - forcing loading to false");
      if (isMounted) setLoading(false);
    }, 5000);

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          // Try to load profile from database with timeout
          const profile = await loadUserProfile(session.user.id);

          if (profile) {
            setUser(profile);
            console.log("User state set to:", profile);
          } else {
            // Fallback to auth data if no profile exists
            const fallbackUser = {
              id: session.user.id,
              name:
                session.user.user_metadata?.name ||
                session.user.email.split("@")[0],
              email: session.user.email,
              bio: "",
              goals: [],
              stats: {
                totalEntries: 0,
                streak: 0,
                longestStreak: 0,
                lastEntryDate: null,
              },
              achievements: [],
            };
            setUser(fallbackUser);
            console.log("User state set to fallback:", fallbackUser);
          }
        }
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      } catch (e) {
        console.error("Init error:", e);
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.name ||
              session.user.email.split("@")[0],
            email: session.user.email,
            bio: "",
            goals: [],
            stats: {
              totalEntries: 0,
              streak: 0,
              longestStreak: 0,
              lastEntryDate: null,
            },
            achievements: [],
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { name: userData.name } },
    });
    if (error) throw error;

    if (data.user) {
      // Try to create profile in database
      const newProfile = {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        bio: "",
        goals: [],
        stats: {
          totalEntries: 0,
          streak: 0,
          longestStreak: 0,
          lastEntryDate: null,
        },
        achievements: [],
      };

      try {
        await supabase
          .from("profiles")
          .upsert([newProfile], { onConflict: "id" });
      } catch (err) {
        console.warn("Profile creation failed:", err);
      }

      setUser(newProfile);
    }
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Try to load profile from database
      const profile = await loadUserProfile(data.user.id);

      if (profile) {
        setUser(profile);
      } else {
        // Fallback
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email.split("@")[0],
          email: data.user.email,
          bio: "",
          goals: [],
          stats: {
            totalEntries: 0,
            streak: 0,
            longestStreak: 0,
            lastEntryDate: null,
          },
          achievements: [],
        });
      }
    }
    return data.user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error("No user logged in");

    // Optimistic update - update UI immediately
    setUser((prev) => ({ ...prev, ...updates }));

    try {
      // Add timeout for Supabase update
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("UPDATE_TIMEOUT")), 3000)
      );

      const updatePromise = supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        console.error("Update profile error:", error);
        // Don't throw - keep the optimistic update
      }
    } catch (err) {
      console.error("Update profile timeout:", err.message);
      // Don't throw - keep the optimistic update
    }
  };

  const updateStats = async (statUpdates) => {
    if (!user) throw new Error("No user logged in");

    const updatedStats = { ...user.stats, ...statUpdates };

    console.log("Updating stats - Before:", user.stats);
    console.log("Updating stats - After:", updatedStats);
    console.log("User ID:", user.id);

    // Optimistic update - update UI immediately
    setUser((prev) => {
      const newUser = { ...prev, stats: updatedStats };
      console.log("New user state after stats update:", newUser);
      return newUser;
    });

    try {
      // Add timeout for Supabase update
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("UPDATE_TIMEOUT")), 5000) // Increased to 5 seconds
      );

      const updatePromise = supabase
        .from("profiles")
        .update({ stats: updatedStats })
        .eq("id", user.id)
        .select(); // Add .select() to get the response

      const result = await Promise.race([updatePromise, timeoutPromise]);

      if (result.error) {
        console.error("Update stats error:", result.error);
        // Don't throw - keep the optimistic update
      } else {
        console.log("Stats successfully saved to Supabase:", result.data);
      }
    } catch (err) {
      console.error("Update stats timeout:", err.message);
      // Don't throw - keep the optimistic update
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        updateStats,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
