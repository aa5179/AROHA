/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Forest/Trees Theme Colors
        forest: {
          50: "#f0f9f0", // Very light forest green
          100: "#dcf4dc", // Light mint
          200: "#bae6ba", // Soft green
          300: "#86d186", // Medium green
          400: "#4ade4a", // Bright green
          500: "#22c522", // Main forest green
          600: "#16a316", // Deep green
          700: "#15803d", // Dark forest
          800: "#166534", // Very dark green
          900: "#14532d", // Almost black green
        },
        earth: {
          50: "#fefaf5", // Cream white
          100: "#fef2e8", // Light beige
          200: "#fce4c4", // Soft tan
          300: "#f9d196", // Light brown
          400: "#f5b968", // Medium brown
          500: "#e89b3a", // Earth brown
          600: "#d4811c", // Deep brown
          700: "#b8631a", // Dark brown
          800: "#95501b", // Very dark brown
          900: "#7a431b", // Almost black brown
        },
        bark: {
          50: "#faf9f7", // Light bark
          100: "#f3f0ed", // Soft bark
          200: "#e6dfd8", // Medium bark
          300: "#d2c4b8", // Darker bark
          400: "#b8a394", // Brown bark
          500: "#9c8571", // Main bark color
          600: "#8b6f5c", // Deep bark
          700: "#755d4f", // Dark bark
          800: "#614d43", // Very dark bark
          900: "#513f38", // Almost black bark
        },
        moss: {
          50: "#f6fbf4", // Very light moss
          100: "#ecf7e8", // Light moss
          200: "#d8eecd", // Soft moss
          300: "#b8dfa8", // Medium moss
          400: "#94cc7a", // Bright moss
          500: "#6faa4f", // Main moss green
          600: "#5a9140", // Deep moss
          700: "#4a7335", // Dark moss
          800: "#3e5c2e", // Very dark moss
          900: "#334d28", // Almost black moss
        },
        sky: {
          50: "#f0f9ff", // Very light sky
          100: "#e0f2fe", // Light sky blue
          200: "#bae6fd", // Soft sky
          300: "#7dd3fc", // Medium sky
          400: "#38bdf8", // Bright sky
          500: "#0ea5e9", // Main sky blue
          600: "#0284c7", // Deep sky
          700: "#0369a1", // Dark sky
          800: "#075985", // Very dark sky
          900: "#0c4a6e", // Almost black sky
        },
        leaf: {
          50: "#f7fef7", // Very light leaf
          100: "#edfced", // Light leaf
          200: "#d9f7d9", // Soft leaf
          300: "#bfefbf", // Medium leaf
          400: "#9de49d", // Bright leaf
          500: "#4ade80", // Main leaf green
          600: "#22c55e", // Deep leaf
          700: "#16a34a", // Dark leaf
          800: "#15803d", // Very dark leaf
          900: "#14532d", // Almost black leaf
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
