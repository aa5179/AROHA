# 🌱 Aroha - Mental Health & Wellness Platform# 💭 Emotion Journal - AI-Powered Emotional Analysis

A comprehensive mental health platform built with React, FastAPI, and Supabase. Features AI-powered emotion analysis, journaling, mood tracking, and an intelligent chatbot.A complete web-based emotion analysis application that helps users understand their emotions through AI-powered journal analysis. Built with React + TypeScript frontend and FastAPI backend integrating multiple NLP models from Hugging Face.

![Mental Health App](https://via.placeholder.com/800x400/4ade80/ffffff?text=Aroha+Mental+Health+Platform)## 🌟 Features

## ✨ Features### Core Functionality

- 📖 **Digital Journaling** - Write and track your thoughts with emotion analysis- **📝 Journal Input**: Clean, minimalist interface for writing daily journal entries

- 🤖 **AI Chatbot** - Get support and guidance through intelligent conversations - **🧠 AI Analysis**: Multi-step emotion analysis using state-of-the-art NLP models

- 📊 **Mood Tracking** - Visualize your emotional patterns over time- **✨ Text Refinement**: Enhances journal text while preserving emotional tone using Google's Flan-T5

- 🔍 **Emotion Analysis** - AI-powered insights into your journal entries- **😊 Emotion Detection**: Identifies top 3 emotions with intensity scoring (1-10)

- 🌙 **Dark Mode** - Comfortable viewing experience- **💬 Empathetic Summary**: Generates personalized, empathetic responses to journal entries

- 📱 **Mobile Responsive** - Optimized for all devices- **📊 Visual Insights**: Beautiful charts showing emotion distribution and intensity

- 🔐 **Secure Authentication** - Protected user accounts via Supabase

### Advanced Features

## 🛠️ Tech Stack

- **📈 History Tracking**: Stores journal entries in localStorage for quick access

### Frontend- **📊 Trend Analysis**: 7-day emotion intensity trends and emotion frequency charts

- **React 19** - UI framework- **🌓 Dark Mode**: Toggle between light and dark themes

- **Vite** - Build tool- **🎨 Smooth Animations**: Framer Motion animations for delightful user experience

- **Tailwind CSS** - Styling- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

- **Framer Motion** - Animations

- **Lucide React** - Icons## 🏗️ Tech Stack

- **Recharts** - Data visualization

### Frontend

### Backend

- **FastAPI** - Python web framework- **React 18** with TypeScript

- **Transformers** - Hugging Face ML models- **Vite** for fast development and building

- **PyTorch** - Machine learning framework- **Tailwind CSS** for styling with custom pastel color palette

- **Uvicorn** - ASGI server- **Framer Motion** for smooth animations

- **Recharts** for data visualization

### Database & Auth- **Lucide React** for beautiful icons

- **Supabase** - PostgreSQL database & authentication- **Axios** for API communication

## 🚀 Quick Start### Backend

### Prerequisites- **FastAPI** for high-performance API

- Node.js 18+ - **Hugging Face Transformers** for NLP models:

- Python 3.8+ - `google/flan-t5-base` for text refinement

- Git - `bhadresh-savani/distilbert-base-uncased-emotion` for emotion classification

- **Python 3.8+** with async/await support

### Local Development- **Uvicorn** ASGI server

1. **Clone the repository**## 🚀 Quick Start

   ````bash

   git clone <your-repo-url>### Prerequisites

   cd aroha-mental-health

   ```- **Node.js** 16+ and npm
   ````

- **Python** 3.8+

2. **Run setup script** (Unix/Linux/Mac)- **Git**

   ````bash

   chmod +x setup.sh### Installation

   ./setup.sh

   ```1. **Set up the Backend**

   ````

3. **Manual setup** (Windows or alternative) ```bash

   cd server

   **Client setup:**

   ````bash # Create a virtual environment (recommended)

   cd client   python -m venv venv

   npm install

   cp .env.example .env   # Activate virtual environment

   # Update .env with your Supabase credentials   # On Windows:

   ```   .\venv\Scripts\activate

      # On macOS/Linux:

   **Server setup:**   source venv/bin/activate

   ```bash

   cd server   # Install dependencies

   python -m venv venv   pip install -r requirements.txt

   venv\Scripts\activate  # Windows

   # source venv/bin/activate  # Unix/Linux/Mac   # Copy environment file

   pip install -r requirements.txt   cp .env.example .env

   cp .env.example .env   ```

   # Update .env with your API keys (optional)

   ```2. **Set up the Frontend**

   ````

4. **Start the application** ```bash

   cd client

   **Terminal 1 - Backend:**

   ````bash # Install dependencies

   cd server   npm install

   python main.py   ```

   ````

   ### Running the Application

   **Terminal 2 - Frontend:**

   ````bash1. **Start the Backend Server**

   cd client

   npm run dev   ```bash

   ```   cd server

   ````

5. **Open your browser** to `http://localhost:3000` # Activate virtual environment if not already active

   python run.py

## 🔧 Configuration # Or alternatively:

# uvicorn main:app --reload --host 0.0.0.0 --port 8000

### Environment Variables ```

**Client (`.env`):** The API will be available at `http://localhost:8000`

````env

VITE_SUPABASE_URL=your_supabase_project_url2. **Start the Frontend Development Server**

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_API_URL=http://localhost:8000   ```bash

```   cd client



**Server (`.env`):**   # Start the development server

```env   npm run dev

GEMINI_API_KEY=your_gemini_api_key  # Optional for AI features   ```

OPENAI_API_KEY=your_openai_key      # Optional

HUGGINGFACE_API_TOKEN=your_hf_token # Optional   The application will be available at `http://localhost:3000`

DEBUG=True

ENVIRONMENT=development## 🔧 Configuration

````

### Environment Variables

## 🌐 Deployment

Create a `.env` file in the `server` directory:

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

```env

### Quick Deploy Options:# Optional: OpenAI API Key for enhanced emotion analysis

OPENAI_API_KEY=your_openai_api_key_here

- **Frontend**: Vercel (recommended)

- **Backend**: Railway or Render (recommended for ML workloads)  # Optional: Hugging Face API Token for inference API

- **Database**: Supabase (managed PostgreSQL)HUGGINGFACE_API_TOKEN=your_huggingface_token_here



## 📱 Mobile Responsiveness# App Configuration

DEBUG=True

The app is fully optimized for mobile devices with:ENVIRONMENT=development

- Responsive layouts and touch-friendly interfaces

- Hamburger navigation menu for mobile# Server Configuration

- Optimized button sizes and spacingHOST=0.0.0.0

- Mobile-first design approachPORT=8000

```

## 🎨 Features Overview

## 📡 API Endpoints

### Dashboard

- Personal statistics and mood overview### `POST /analyze_journal`

- Quick journal entry creation

- Real-time mood chart visualizationAnalyzes a journal entry and returns emotion insights.

- AI-powered insights and recommendations

**Request:**

### Journal

- Rich text journal entry creation```json

- Emotion analysis for each entry{

- Historical entry viewing and management "journal": "Today I felt really happy because I accomplished my goals..."

- Export and sharing capabilities}

````

### Chatbot

- Context-aware conversations**Response:**

- Mental health support and guidance

- Exercise and tip recommendations```json

- Conversation history tracking{

  "refined": "Today, I experienced genuine happiness...",

### Profile  "summary": "I can feel the joy radiating from your words today!",

- User account management  "emotions": ["joy", "pride", "satisfaction"],

- Privacy settings  "intensity": 8,

- Data export options  "dominant_emotion": "joy"

- Preference customization}

````

## 🤝 Contributing

### `GET /health`

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)Health check endpoint.

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)## 🎨 Features in Detail

5. Open a Pull Request

### Journal Input

## 📄 License

- Rich text area with word/character counting

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.- Real-time progress indicator

- Keyboard shortcuts (Ctrl+Enter to analyze)

## 🆘 Support- Minimum 10 characters validation

If you encounter any issues or have questions:### Emotion Analysis

1. Check the [Issues](../../issues) page- **Text Refinement**: Uses Flan-T5 to enhance writing while preserving tone

2. Create a new issue with detailed information- **Emotion Classification**: DistilBERT model identifies dominant emotions

3. Contact the maintainers- **Empathetic Response**: Context-aware summary generation

- **Intensity Scoring**: 1-10 scale based on emotion confidence

## 🙏 Acknowledgments

### Visualizations

- **Hugging Face** for emotion analysis models

- **Supabase** for backend infrastructure - **Radial Chart**: Overall emotion intensity

- **Vercel** for deployment platform- **Pie Chart**: Emotion distribution

- **Tailwind CSS** for styling framework- **Bar Charts**: Individual emotion strengths and frequency

- **Mental health community** for inspiration and feedback- **Line Chart**: 7-day emotional trends

---### History & Analytics

**⚠️ Disclaimer**: This application is for wellness and journaling purposes. It is not a substitute for professional mental health treatment. If you're experiencing a mental health crisis, please contact a mental health professional or emergency services.**- **Local Storage\*\*: Secure browser-based storage

- **Entry Management**: View, search, and delete past entries
- **Trend Analysis**: Emotional patterns over time
- **Statistics**: Total entries, average intensity, unique emotions

## 🔒 Privacy

- All journal entries stored locally in your browser
- Backend processes but doesn't persist data
- No personal information sent to external services
- Optional API keys for enhanced features

## 🛠️ Development

### Project Structure

```
emotion-analysis-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Utility functions
│   │   ├── types.ts        # TypeScript definitions
│   │   └── api.ts          # API client
├── server/                 # FastAPI backend
│   ├── main.py            # FastAPI app
│   ├── emotion_analyzer.py # NLP logic
│   └── requirements.txt   # Dependencies
└── README.md
```

### Building for Production

```bash
cd client
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Hugging Face for NLP models
- React and FastAPI communities
- Tailwind CSS and Framer Motion teams

---

**Happy journaling! 💭✨**
