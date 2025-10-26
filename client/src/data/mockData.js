// Mock data for the mental health app

export const mockUser = {
  name: "Sarah",
  avatar: "👤",
  streak: 7,
  totalEntries: 23,
};

export const mockJournalEntries = [];

export const mockChatHistory = [];

export const mockMoodData = [
  { day: "Mon", mood: 3.5, date: "2025-08-24" },
  { day: "Tue", mood: 4.2, date: "2025-08-25" },
  { day: "Wed", mood: 2.8, date: "2025-08-26" },
  { day: "Thu", mood: 3.1, date: "2025-08-27" },
  { day: "Fri", mood: 4.5, date: "2025-08-28" },
  { day: "Sat", mood: 4.8, date: "2025-08-29" },
  { day: "Sun", mood: 4.1, date: "2025-08-30" },
];

export const mockExercises = [
  {
    id: 1,
    title: "Deep Breathing",
    description:
      "A simple 5-minute breathing exercise to reduce anxiety and stress.",
    duration: "5 min",
    icon: "🌬️",
    type: "breathing",
  },
  {
    id: 2,
    title: "Gratitude Practice",
    description: "Reflect on three things you're grateful for today.",
    duration: "10 min",
    icon: "🙏",
    type: "gratitude",
  },
  {
    id: 3,
    title: "Progressive Relaxation",
    description: "Relax each muscle group systematically to release tension.",
    duration: "15 min",
    icon: "🧘‍♀️",
    type: "relaxation",
  },
  {
    id: 4,
    title: "Mindful Walking",
    description: "Take a short walk while focusing on your surroundings.",
    duration: "20 min",
    icon: "🚶‍♀️",
    type: "mindfulness",
  },
];

export const getMoodColor = (mood) => {
  switch (mood) {
    case "happy":
      return "mood-happy";
    case "neutral":
      return "mood-neutral";
    case "sad":
      return "mood-sad";
    default:
      return "mood-neutral";
  }
};

export const getMoodEmoji = (mood) => {
  switch (mood) {
    case "happy":
      return "🙂";
    case "neutral":
      return "😐";
    case "sad":
      return "☹️";
    default:
      return "😐";
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};
