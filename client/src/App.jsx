import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import FloatingButtons from "./components/FloatingButtons";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectMessage from "./components/RedirectMessage";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Chatbot from "./pages/Chatbot";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

// Import video asset
import bgVideo from "./assets/bg.mp4";
import bgImage from "./assets/bg.png";

// Component to redirect authenticated users away from auth pages
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Video Background */}
      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
        >
          <source src={bgVideo} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
        </video>
        {/* Fallback background image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: 0.3,
            zIndex: -1,
          }}
        />
      </div>

      {isAuthenticated && <Navbar />}
      {isAuthenticated && <FloatingButtons />}

      <Routes>
        {/* Home Page - show redirect message if authenticated */}
        <Route
          path="/"
          element={isAuthenticated ? <RedirectMessage /> : <HomePage />}
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <Signup />
            </AuthRedirect>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
