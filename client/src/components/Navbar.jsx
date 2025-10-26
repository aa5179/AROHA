import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  MessageCircle,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMobileMenuOpen(false); // Close mobile menu on logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/chatbot", icon: MessageCircle, label: "Chatbot" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-forest-900/70 backdrop-blur-lg border-b border-forest-200/60 dark:border-forest-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Section */}
            <div className="flex items-center">
              <Link to="/dashboard">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/src/assets/logo.jpg"
                      alt="Aroha Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-xl font-bold text-forest-700 dark:text-forest-100 drop-shadow-lg">
                    Aroha
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation - Center Section */}
            <div className="hidden md:flex items-center justify-center space-x-6">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-forest-500 to-moss-500 text-white shadow-md"
                          : "text-bark-600 dark:text-forest-200 hover:text-bark-900 dark:hover:text-white hover:bg-forest-100/50 dark:hover:bg-forest-800/50"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Right Side: User Info, Logout & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              {/* User Greeting */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-bark-700 dark:text-forest-200">
                  Welcome back,
                </p>
                <p className="text-xs text-bark-500 dark:text-forest-400">
                  {user?.name || "User"}
                </p>
              </div>

              {/* Logout Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-500/30 dark:border-red-500/40 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-forest-100/60 dark:bg-forest-800/60 text-bark-600 dark:text-forest-200 hover:bg-forest-200/60 dark:hover:bg-forest-700/60 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            </div>

            {/* Mobile Right Side: Theme Toggle & Hamburger */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Theme Toggle */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-forest-100/60 dark:bg-forest-800/60 text-bark-600 dark:text-forest-200 hover:bg-forest-200/60 dark:hover:bg-forest-700/60 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              {/* Hamburger Menu Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleMobileMenuToggle}
                className="p-2 rounded-lg bg-forest-100/60 dark:bg-forest-800/60 text-bark-600 dark:text-forest-200 hover:bg-forest-200/60 dark:hover:bg-forest-700/60 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleMobileMenuToggle}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-forest-900/95 backdrop-blur-xl border-l border-forest-200/50 dark:border-forest-700/50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-forest-200/50 dark:border-forest-700/50">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/src/assets/logo.jpg"
                      alt="Aroha Logo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-lg font-bold text-forest-700 dark:text-forest-100">
                      Aroha
                    </span>
                  </div>
                  <button
                    onClick={handleMobileMenuToggle}
                    className="p-2 rounded-lg bg-forest-100/60 dark:bg-forest-800/60 text-bark-600 dark:text-forest-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-forest-200/50 dark:border-forest-700/50">
                  <p className="text-sm font-medium text-bark-700 dark:text-forest-200 mb-1">
                    Welcome back,
                  </p>
                  <p className="text-lg font-bold text-forest-700 dark:text-forest-100">
                    {user?.name || "User"}
                  </p>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-6 space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={handleMobileNavClick}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.path)
                              ? "bg-gradient-to-r from-forest-500 to-moss-500 text-white shadow-lg"
                              : "text-bark-600 dark:text-forest-200 hover:bg-forest-100/50 dark:hover:bg-forest-800/50"
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium text-lg">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-forest-200/50 dark:border-forest-700/50">
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-500/30 dark:border-red-500/40 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={20} />
                    <span className="text-lg">Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
