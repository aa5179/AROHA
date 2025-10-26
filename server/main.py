from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import logging
import uvicorn
from emotion_analyzer import EmotionAnalyzer
from emotion_analyzer_ai import AIEmotionAnalyzer
from chatbot_ai import MentalHealthChatbot

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Emotion Analysis API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "https://your-app-name.vercel.app",  # Replace with your Vercel domain
        "https://*.vercel.app",  # Allow all Vercel subdomains for now
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize emotion analyzers
use_ai = os.getenv("GEMINI_API_KEY") is not None and os.getenv("GEMINI_API_KEY") != ""

if use_ai:
    try:
        emotion_analyzer = AIEmotionAnalyzer()
        chatbot = MentalHealthChatbot()
        logger.info("Using AI-powered emotion analyzer (Gemini) and chatbot")
    except Exception as e:
        logger.warning(f"Failed to initialize AI analyzer: {e}. Falling back to rule-based analyzer.")
        emotion_analyzer = EmotionAnalyzer()
        chatbot = None
        use_ai = False
else:
    emotion_analyzer = EmotionAnalyzer()
    chatbot = None
    logger.info("Using rule-based emotion analyzer")

class JournalRequest(BaseModel):
    journal: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    suggests_exercise: bool
    timestamp: Optional[str] = None

class EmotionResponse(BaseModel):
    refined: str
    summary: str
    emotions: List[Dict[str, Any]]  # Changed to accept list of dicts
    intensity: int
    dominant_emotion: str

@app.get("/")
async def root():
    analyzer_type = "AI-powered (Gemini)" if use_ai else "Rule-based"
    chatbot_status = "Available" if chatbot else "Unavailable"
    return {
        "message": "Emotion Analysis API is running",
        "analyzer": analyzer_type,
        "chatbot": chatbot_status
    }

@app.post("/analyze_journal", response_model=EmotionResponse)
async def analyze_journal(request: JournalRequest):
    """
    Analyze a journal entry for emotions and provide refined text and summary.
    """
    try:
        if not request.journal or len(request.journal.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Journal entry must be at least 10 characters long"
            )
        
        logger.info(f"Analyzing journal entry of length: {len(request.journal)}")
        
        # Analyze the journal entry
        result = await emotion_analyzer.analyze_journal(request.journal)
        
        return EmotionResponse(**result)
    
    except Exception as e:
        logger.error(f"Error analyzing journal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Emotion Analysis API is operational"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the chatbot and get a response.
    Optionally provide context about user's emotions and journal entries.
    """
    try:
        if not chatbot:
            raise HTTPException(
                status_code=503,
                detail="Chatbot is not available. Please configure GEMINI_API_KEY."
            )
        
        if not request.message or len(request.message.strip()) < 1:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        logger.info(f"Chat request: {request.message[:50]}...")
        
        # Get chatbot response with optional context
        result = await chatbot.send_message(
            message=request.message,
            user_context=request.context
        )
        
        return ChatResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/chat/reset")
async def reset_chat():
    """Reset the chat conversation history"""
    try:
        if not chatbot:
            raise HTTPException(
                status_code=503,
                detail="Chatbot is not available"
            )
        
        chatbot.reset_conversation()
        return {"message": "Chat conversation reset successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/wellness-tip")
async def get_wellness_tip():
    """Get a random wellness tip"""
    try:
        if not chatbot:
            raise HTTPException(
                status_code=503,
                detail="Chatbot is not available"
            )
        
        tip = chatbot.get_wellness_tip()
        return {"tip": tip}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting wellness tip: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, workers=1)