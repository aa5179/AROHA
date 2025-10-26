import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";

const RedirectMessage = () => {
  const [redirect, setRedirect] = React.useState(false);

  useEffect(() => {
    // Show message for 2 seconds then redirect
    const timer = setTimeout(() => {
      setRedirect(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (redirect) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-100 to-moss-100 dark:from-forest-900 dark:to-moss-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-white dark:bg-forest-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-forest-200 dark:border-forest-700"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-forest-500 to-moss-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-bark-900 dark:text-white mb-2">
            Welcome Back!
          </h2>
          <p className="text-bark-600 dark:text-forest-300">
            You're already logged in. Redirecting you to your dashboard...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-2 text-forest-600 dark:text-forest-400"
        >
          <span>Taking you to dashboard</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="mt-6 h-2 bg-gradient-to-r from-forest-500 to-moss-500 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default RedirectMessage;
