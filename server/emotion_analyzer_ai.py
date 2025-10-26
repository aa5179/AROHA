import os
import json
import logging
import google.generativeai as genai
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class AIEmotionAnalyzer:
    def __init__(self):
        """Initialize the AI-powered emotion analyzer using Google Gemini."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        # Use gemini-2.0-flash-lite for fastest responses (2-3x faster than regular flash)
        self.model = genai.GenerativeModel('gemini-2.0-flash-lite')
        logger.info("AI Emotion Analyzer initialized with Gemini 2.0 Flash Lite (Fast Mode)")
    
    async def analyze_journal(self, text: str) -> Dict:
        """
        Fast single-step AI analysis: Break down emotions and score them in one call
        """
        try:
            # Single optimized prompt that does both breakdown and analysis
            prompt = f"""Analyze this journal entry for emotions. Respond in JSON format only.

Journal: "{text}"

Identify emotions and provide scores. Be specific (nostalgia, resentment, longing, guilt, hope, etc.).

JSON format:
{{
  "emotions": [{{"label": "emotion_name", "score": 0.0-1.0}}],
  "dominant": "main_emotion",
  "intensity": 1-10,
  "summary": "brief empathetic summary (1 sentence)"
}}

Rules:
- Map complex emotions: nostalgia/longing/regret→sadness, resentment→anger, contentment/acceptance/hope→calm
- Scores sum to ~1.0
- Only include emotions with score >= 0.15
- Keep summary under 20 words"""

            logger.info("Analyzing journal with AI (fast mode)...")
            
            # Generate with timeout
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for faster, more consistent results
                    max_output_tokens=300,  # Limit output for speed
                )
            )
            response_text = response.text.strip()
            
            # Clean the response to extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            logger.info(f"AI analysis complete: {data}")
            
            # Normalize scores
            emotions = data.get("emotions", [])
            total_score = sum(e.get("score", 0) for e in emotions)
            if total_score > 0:
                for emotion in emotions:
                    emotion["score"] = emotion["score"] / total_score
            
            # Filter emotions with score < 0.10
            emotions = [e for e in emotions if e.get("score", 0) >= 0.10]
            
            if not emotions:
                emotions = [{"label": "neutral", "score": 1.0}]
            
            return {
                "refined": text,
                "summary": data.get("summary", "You appear to be experiencing complex emotions."),
                "emotions": emotions,
                "intensity": min(10, max(1, data.get("intensity", 5))),
                "dominant_emotion": data.get("dominant", emotions[0]["label"] if emotions else "neutral")
            }
        
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response text: {response_text if 'response_text' in locals() else 'N/A'}")
            return self._get_neutral_response(text)
        
        except Exception as e:
            logger.error(f"Error in AI emotion analysis: {str(e)}")
            return self._get_neutral_response(text)
    
    def _get_neutral_response(self, text: str) -> Dict:
        """Return a neutral response when analysis fails."""
        return {
            "refined": text,
            "summary": "Your emotions appear balanced and neutral.",
            "emotions": [{"label": "neutral", "score": 1.0}],
            "intensity": 5,
            "dominant_emotion": "neutral",
            "emotional_breakdown": []
        }
