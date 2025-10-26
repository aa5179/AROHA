import os
import json
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

logger = logging.getLogger(__name__)

class MentalHealthChatbot:
    def __init__(self):
        """Initialize the mental health chatbot with Google Gemini."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # Use gemini-2.0-flash-lite for fast, efficient conversations
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-lite',
            system_instruction=self._get_system_instruction()
        )
        
        # Start a chat session
        self.chat = self.model.start_chat(history=[])
        
        logger.info("Mental Health Chatbot initialized with Gemini 2.0 Flash Lite")
    
    def _get_system_instruction(self) -> str:
        """Get the system instruction for the chatbot."""
        return """You are a compassionate and empathetic mental health support chatbot named "Mindful Assistant". Your role is to:

1. **Listen actively**: Acknowledge the user's feelings and validate their emotions
2. **Provide support**: Offer practical coping strategies, mindfulness exercises, and wellness tips
3. **Be conversational**: Keep responses warm, friendly, and under 3 sentences
4. **Suggest exercises**: Recommend breathing exercises, meditation, gratitude practices when appropriate
5. **Encourage journaling**: Suggest writing down thoughts and feelings
6. **Know limits**: ALWAYS remind users in crisis to contact emergency services or mental health professionals

Key guidelines:
- Keep responses concise (2-3 sentences max)
- Use empathetic language ("I hear you", "That sounds difficult", "It's okay to feel this way")
- Offer actionable advice
- Don't diagnose or replace professional help
- Be supportive but realistic
- Use gentle, encouraging tone

When user shares emotions:
- Validate their feelings first
- Then offer 1-2 practical tips
- End with encouragement or a question to continue conversation

Example good responses:
- "I hear you. It sounds like you're going through a tough time. Would a quick breathing exercise help calm your mind?"
- "Those feelings are completely valid. Sometimes writing down what's bothering you can bring clarity. Have you tried journaling about it?"
- "That must feel overwhelming. Taking things one step at a time might help. What's one small thing you could do for yourself right now?"

Remember: You're a supportive companion, not a therapist."""
    
    async def send_message(
        self,
        message: str,
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Send a message to the chatbot and get a response.
        
        Args:
            message: User's message
            user_context: Optional context about user (recent emotions, journal entries, etc.)
        
        Returns:
            Dict with response and metadata
        """
        try:
            # Add context to the message if provided
            enhanced_message = message
            if user_context:
                context_info = self._format_context(user_context)
                if context_info:
                    enhanced_message = f"{context_info}\n\nUser says: {message}"
            
            logger.info(f"Sending message to chatbot: {message[:50]}...")
            
            # Send message and get response
            response = self.chat.send_message(
                enhanced_message,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,  # Balanced creativity and consistency
                    max_output_tokens=200,  # Keep responses concise
                )
            )
            
            response_text = response.text.strip()
            
            # Check if response suggests an exercise
            suggests_exercise = any(
                keyword in response_text.lower()
                for keyword in ['breathing', 'exercise', 'meditation', 'practice', 'try', 'mindfulness']
            )
            
            logger.info(f"Bot response: {response_text[:50]}...")
            
            return {
                "message": response_text,
                "suggests_exercise": suggests_exercise,
                "timestamp": None  # Will be set by frontend
            }
        
        except Exception as e:
            logger.error(f"Error in chatbot: {str(e)}")
            return {
                "message": "I'm here to listen. Please tell me more about how you're feeling.",
                "suggests_exercise": False,
                "timestamp": None
            }
    
    def _format_context(self, context: Dict) -> str:
        """Format user context for the chatbot."""
        context_parts = []
        
        # Add recent emotion if available
        if context.get("recent_emotion"):
            emotion = context["recent_emotion"]
            context_parts.append(f"[User's recent emotion: {emotion}]")
        
        # Add mood trend if available
        if context.get("mood_trend"):
            trend = context["mood_trend"]
            context_parts.append(f"[User's mood trend: {trend}]")
        
        # Add recent journal summary if available
        if context.get("journal_summary"):
            summary = context["journal_summary"]
            context_parts.append(f"[Recent journal: {summary}]")
        
        return " ".join(context_parts) if context_parts else ""
    
    def reset_conversation(self):
        """Reset the chat history to start fresh."""
        self.chat = self.model.start_chat(history=[])
        logger.info("Chat conversation reset")
    
    def get_wellness_tip(self) -> str:
        """Get a random wellness tip."""
        tips = [
            "Take three deep breaths before responding to any stressful situation. This simple pause can help you respond rather than react.",
            "Practice the 5-4-3-2-1 grounding technique: Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
            "Set aside 5 minutes today for gratitude. Write down three things you're thankful for, no matter how small.",
            "Movement is medicine. Even a 10-minute walk can boost your mood and clear your mind.",
            "Your feelings are valid, and it's okay to not be okay. Reach out to someone you trust when you need support.",
            "Quality sleep is crucial for mental health. Try to maintain a consistent sleep schedule.",
            "Limit social media if it's affecting your mood. Take breaks and be mindful of your screen time.",
            "Practice saying 'no' to protect your energy. Setting boundaries is an act of self-care.",
        ]
        import random
        return random.choice(tips)
