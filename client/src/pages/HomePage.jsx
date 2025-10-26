import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Users,
  Award,
  Play,
  Clock,
  Target,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const HomePage = () => {
  const { isDark, toggleTheme } = useTheme();
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Get personalized mental health insights with advanced AI that understands your unique journey.",
    },
    {
      icon: BookOpen,
      title: "Smart Journaling",
      description:
        "Express yourself freely with emotion analysis and pattern tracking to understand your mind better.",
    },
    {
      icon: MessageCircle,
      title: "24/7 AI Companion",
      description:
        "Chat with our empathetic AI companion anytime you need support, guidance, or a listening ear.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your mental wellness journey with beautiful charts and insights to stay motivated.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Working Professional",
      content:
        "Aroha has completely transformed how I approach my mental wellness. The AI insights are incredibly accurate and helpful.",
      rating: 5,
      avatar: "SC",
    },
    {
      name: "Michael Rodriguez",
      role: "Student",
      content:
        "The journaling feature with emotion analysis has been a game-changer for managing my stress and anxiety.",
      rating: 5,
      avatar: "MR",
    },
    {
      name: "Emma Thompson",
      role: "Mental Health Advocate",
      content:
        "As someone in the field, I'm impressed by how thoughtfully designed and genuinely helpful Aroha is.",
      rating: 5,
      avatar: "ET",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark Mode Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleTheme}
        className="fixed top-4 right-6 z-50 p-4 rounded-2xl bg-white/10 dark:bg-forest-800/10 backdrop-blur-xl border border-white/20 dark:border-forest-700/20 hover:bg-white/20 dark:hover:bg-forest-800/20 transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Moon className="w-6 h-6 text-forest-700 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </motion.button>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="relative z-50 bg-white/10 dark:bg-forest-900/10 backdrop-blur-xl border-b border-white/20 dark:border-forest-700/20">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-3"
              >
                <img
                  src="/src/assets/logo.jpg"
                  alt="Aroha Logo"
                  className="w-10 h-10 rounded-full shadow-lg object-cover"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-forest-700 to-moss-600 dark:from-forest-100 dark:to-moss-200 bg-clip-text text-transparent">
                  Aroha
                </span>
              </motion.div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-bark-700 dark:text-forest-200 hover:text-forest-600 dark:hover:text-forest-100 transition-colors duration-300 font-medium"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  className="text-bark-700 dark:text-forest-200 hover:text-forest-600 dark:hover:text-forest-100 transition-colors duration-300 font-medium"
                >
                  Testimonials
                </a>
                <Link
                  to="/login"
                  className="text-bark-700 dark:text-forest-200 hover:text-forest-600 dark:hover:text-forest-100 transition-colors duration-300 font-medium"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-forest-500 to-moss-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-forest-500 to-moss-500 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-forest-800/30 backdrop-blur-md rounded-full border border-forest-200/30 dark:border-forest-700/30"
              >
                <Sparkles className="w-4 h-4 text-forest-600 dark:text-forest-400" />
                <span className="text-forest-700 dark:text-forest-300 text-sm font-medium">
                  AI-Powered Mental Wellness Platform
                </span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-bark-900 dark:text-white leading-tight px-4">
                Transform Your{" "}
                <span className="bg-gradient-to-r from-forest-500 to-moss-500 bg-clip-text text-transparent">
                  Mental Wellness
                </span>{" "}
                Journey
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl lg:text-2xl text-bark-600 dark:text-forest-300 max-w-4xl mx-auto leading-relaxed px-4">
                Discover inner peace with our AI-powered companion, intelligent
                journaling, and personalized insights designed to support your
                mental health every step of the way.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-forest-500 to-moss-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/20 dark:bg-forest-800/20 backdrop-blur-md text-bark-800 dark:text-forest-200 border border-forest-200/50 dark:border-forest-700/50 rounded-xl font-semibold text-lg hover:bg-white/30 dark:hover:bg-forest-800/30 transition-all duration-300"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 pt-12 text-bark-600 dark:text-forest-400"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-forest-500" />
                  <span className="font-medium">100% Private & Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-forest-500" />
                  <span className="font-medium">50,000+ Happy Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-forest-500" />
                  <span className="font-medium">Evidence-Based</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="relative py-24 bg-white/10 dark:bg-forest-900/10 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-bark-900 dark:text-white mb-6">
                Everything You Need for{" "}
                <span className="bg-gradient-to-r from-forest-500 to-moss-500 bg-clip-text text-transparent">
                  Mental Wellness
                </span>
              </h2>
              <p className="text-xl text-bark-600 dark:text-forest-300 max-w-3xl mx-auto">
                Comprehensive tools designed to support your mental health
                journey with cutting-edge AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="p-6 bg-white/20 dark:bg-forest-800/20 backdrop-blur-lg rounded-2xl border border-forest-200/30 dark:border-forest-700/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-forest-500 to-moss-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-bark-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-bark-600 dark:text-forest-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-bark-900 dark:text-white mb-6">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-forest-500 to-moss-500 bg-clip-text text-transparent">
                  Thousands
                </span>
              </h2>
              <p className="text-xl text-bark-600 dark:text-forest-300 max-w-3xl mx-auto">
                Real stories from people who transformed their mental wellness
                with Aroha
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="p-6 lg:p-8 bg-white/20 dark:bg-forest-800/20 backdrop-blur-lg rounded-2xl border border-forest-200/30 dark:border-forest-700/30 hover:shadow-xl transition-all duration-300"
                >
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-bark-700 dark:text-forest-200 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-forest-500 to-moss-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-bark-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-bark-600 dark:text-forest-400 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-12 bg-gradient-to-r from-forest-500 to-moss-500 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join thousands improving their mental health with Aroha's
                  AI-powered platform
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white text-forest-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    >
                      <span>Start Free Today</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <div className="flex items-center space-x-2 text-white/80">
                    <CheckCircle className="w-5 h-5" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 bg-white/20 dark:bg-forest-900/20 backdrop-blur-lg border-t border-forest-200/30 dark:border-forest-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img
                  src="/src/assets/logo.jpg"
                  alt="Aroha Logo"
                  className="w-8 h-8 rounded-full shadow-lg object-cover"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-forest-700 to-moss-600 dark:from-forest-100 dark:to-moss-200 bg-clip-text text-transparent">
                  Aroha
                </span>
              </div>
              <p className="text-bark-600 dark:text-forest-400">
                © 2024 Aroha. Supporting your mental wellness journey.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
