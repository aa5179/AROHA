import asyncio
import os
import requests
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from typing import Dict, List
import logging
import re

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    def __init__(self):
        """Initialize the emotion analysis models."""
        self.text_refiner = None
        self.emotion_classifier = None
        self.conversational_model = None
        self.initialize_models()
    
    def initialize_models(self):
        """Initialize all the required models."""
        try:
            logger.info("Initializing emotion analysis models...")
            
            # Initialize text refinement model (Flan-T5)
            logger.info("Loading Flan-T5 model for text refinement...")
            self.text_refiner = pipeline(
                "text2text-generation",
                model="google/flan-t5-base",
                max_length=512,
                do_sample=True,
                temperature=0.7
            )
            
            # Initialize emotion classification model
            logger.info("Loading DistilBERT emotion classification model...")
            self.emotion_classifier = pipeline(
                "text-classification",
                model="bhadresh-savani/distilbert-base-uncased-emotion",
                top_k=None  # Return all emotion scores
            )
            
            # Initialize conversational model for dynamic insights
            logger.info("Loading conversational model for emotional insights...")
            try:
                # Use a lightweight but effective model for empathetic responses
                self.conversational_model = pipeline(
                    "text2text-generation",
                    model="google/flan-t5-base",  # Use the same reliable model with better prompts
                    max_length=300,
                    do_sample=True,
                    temperature=0.9,  # Higher temperature for more creative responses
                    top_p=0.95,
                    repetition_penalty=1.1
                )
                logger.info("Using enhanced Flan-T5 base for conversational insights")
            except Exception as conv_error:
                logger.warning(f"Could not load conversational model: {conv_error}")
                logger.info("Using text refiner as fallback for conversational insights")
                self.conversational_model = self.text_refiner
            
            logger.info("All models initialized successfully!")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            raise e
    
    async def refine_text(self, text: str) -> str:
        """Refine the input text while preserving emotional tone."""
        try:
            prompt = f"""
            Please rewrite the following journal entry to make it clearer and more articulate, but DO NOT change the emotional tone, sentiment, or meaning in any way. The refined text MUST express the same feelings and emotions as the original. If you cannot preserve the emotion, return the original text unchanged.

            Original entry:
            {text}

            Refined entry (same emotion):
            """

            result = self.text_refiner(prompt, max_length=400, num_return_sequences=1)
            refined_text = result[0]['generated_text'].strip()

            # Clean up the refined text
            refined_text = re.sub(r'^Refined entry \(same emotion\):\s*', '', refined_text, flags=re.IGNORECASE)
            refined_text = refined_text.strip()

            # If the model just repeats the original or changes emotion, fallback
            if refined_text.lower() == text.lower() or not refined_text:
                return text
            return refined_text
            
        except Exception as e:
            logger.error(f"Error refining text: {str(e)}")
            return text  # Return original text if refinement fails
    
    async def get_emotion_summary(self, text: str) -> Dict[str, any]:
        """Get emotion summary using a language model via API or local processing."""
        try:
            emotions = await self.classify_emotions(text)
            
            # Handle neutral emotion only if it's the ONLY emotion detected
            if len(emotions) == 1 and emotions[0]['label'] == 'neutral':
                top_emotions = [emotions[0]]
                intensity = 2  # Very low intensity for pure neutral
            else:
                # For all other cases, use normal emotion processing
                top_emotions = emotions[:3]
                intensity = min(10, max(1, int(sum([e['score'] for e in top_emotions]) * 10)))
            
            # Generate empathetic summary based on top emotions
            emotion_labels = [e['label'] for e in top_emotions]
            summary = self.generate_empathetic_summary(emotion_labels, intensity, text)
            
            return {
                "emotions": emotion_labels,
                "intensity": intensity,
                "summary": summary
            }
            
        except Exception as e:
            logger.error(f"Error getting emotion summary: {str(e)}")
            return {
                "emotions": ["neutral"],
                "intensity": 5,
                "summary": "I sense a mix of emotions in your writing today."
            }
    
    async def classify_emotions(self, text: str) -> List[Dict[str, any]]:
        """Classify emotions using DistilBERT model with neutral emotion detection."""
        try:
            results = self.emotion_classifier(text)
            
            # Handle different output formats from the emotion classifier
            if isinstance(results, list) and len(results) > 0:
                # If results is a list of lists (batch output), take the first batch
                if isinstance(results[0], list):
                    results = results[0]
                
                # Sort by confidence score
                sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
                
                # Add neutral emotion detection logic ONLY for very specific neutral cases
                highest_score = sorted_emotions[0]['score'] if sorted_emotions else 0
                
                # Check if text appears definitively neutral (very specific patterns only)
                text_lower = text.lower().strip()
                strong_neutral_indicators = [
                    # Only very specific factual/identity statements
                    text_lower.startswith('i am a ') and len(text_lower.split()) <= 6 and not any(word in text_lower for word in ['happy', 'sad', 'angry', 'excited', 'tired', 'amazing', 'great', 'terrible', 'love', 'hate']),
                    text_lower.startswith('my name is ') and len(text_lower.split()) <= 5,
                    text_lower in ['hello', 'hi', 'good morning', 'good evening', 'thanks', 'thank you'],
                    # Only when there's very low confidence in any emotion
                    highest_score < 0.3 and len(text_lower) < 15
                ]
                
                # Only override with neutral for very clear neutral cases
                if any(strong_neutral_indicators):
                    return [{"label": "neutral", "score": 0.9}]
                
                # Otherwise, return all detected emotions (don't add neutral artificially)
                return sorted_emotions
            else:
                logger.error(f"Unexpected emotion classifier output format: {results}")
                return [{"label": "neutral", "score": 0.8}]
            
        except Exception as e:
            logger.error(f"Error classifying emotions: {str(e)}")
            return [{"label": "neutral", "score": 0.8}]
    
    def generate_empathetic_summary(self, emotions: List[str], intensity: int, original_text: str) -> str:
        """Generate a deeply conversational emotional insight focused on what the user is feeling."""
        try:
            # Create a sophisticated prompt that works great with Flan-T5
            primary_emotion = emotions[0] if emotions else "neutral"
            emotion_list = ", ".join(emotions[:3]) if len(emotions) > 1 else primary_emotion
            
            # Special handling for neutral emotions
            if primary_emotion == "neutral":
                # Use neutral-specific prompt
                prompt = f"""
                You are a warm, understanding friend who appreciates when someone shares something simple and genuine. Someone has shared: "{original_text[:300]}"

                You can sense they're in a calm, neutral state - sharing something straightforward without heavy emotions.

                Respond like a caring friend in a natural conversation. Be:
                - Warm and appreciative of their openness
                - Naturally conversational (like you're chatting with a close friend)
                - Gentle and respectful of their calm sharing
                - Brief but meaningful (2-3 sentences max)

                Speak as if you're having a real conversation with them. Use natural language like:
                "Thanks for sharing that with me..." or "I appreciate you telling me..." or "That's nice to know..."

                Your friendly response:
                """
            else:
                # Enhanced emotional prompt for deeper conversation
                prompt = f"""
                You are a deeply caring friend who truly understands emotions. Your friend has just shared: "{original_text[:300]}"

                You can feel they're experiencing {emotion_list} with an intensity of {intensity}/10.

                Respond like their closest friend who really gets them. Be:
                - Naturally conversational (like you're chatting over coffee)
                - Emotionally connected and understanding
                - Use "I can feel...", "I sense...", "It sounds like..." 
                - Reflect their emotions back with genuine empathy
                - Keep it real and heartfelt (3-4 sentences)
                - NO advice - just pure emotional understanding

                Talk to them like you would comfort a close friend. Use warm, natural language that shows you truly understand what they're going through.

                Your heartfelt response:
                """
            
            # Generate with enhanced parameters for better emotional quality
            result = self.conversational_model(
                prompt, 
                max_length=400, 
                num_return_sequences=1, 
                temperature=0.9,
                top_p=0.95,
                repetition_penalty=1.15,
                do_sample=True
            )
            summary = result[0]['generated_text'].strip()
            
            # Clean up the response thoroughly
            summary = re.sub(r'^Your heartfelt response:\s*', '', summary, flags=re.IGNORECASE)
            summary = re.sub(r'^Your friendly response:\s*', '', summary, flags=re.IGNORECASE)
            summary = re.sub(r'^Your heartfelt emotional reflection:\s*', '', summary, flags=re.IGNORECASE)
            summary = re.sub(r'^Your gentle acknowledgment:\s*', '', summary, flags=re.IGNORECASE)
            summary = re.sub(r'^Response:\s*', '', summary, flags=re.IGNORECASE)
            summary = summary.strip()
            
            # Enhanced quality checks for more natural conversation
            if primary_emotion == "neutral":
                # For neutral, ensure it's conversational and brief
                min_length = 20
                inappropriate_words = ['intensity', 'powerful', 'deep emotion', 'raw feeling', 'extraordinary']
                contains_inappropriate = any(word in summary.lower() for word in inappropriate_words)
            else:
                # For emotional content, ensure it's conversational and empathetic
                min_length = 30
                inappropriate_words = ['should', 'try', 'suggest', 'recommend', 'advice', 'tips']
                contains_inappropriate = any(word in summary.lower() for word in inappropriate_words)
            
            # Check if response is too formal or AI-like
            formal_indicators = ['i am an ai', 'as an ai', 'i understand that', 'it appears that']
            too_formal = any(indicator in summary.lower() for indicator in formal_indicators)
            
            if not summary or len(summary) < min_length or contains_inappropriate or too_formal:
                logger.info(f"Using enhanced conversational fallback for {primary_emotion} emotional insight")
                return self._generate_conversational_fallback_summary(emotions, intensity, original_text)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating conversational summary: {str(e)}")
            return self._generate_conversational_fallback_summary(emotions, intensity, original_text)
    
    def _generate_conversational_fallback_summary(self, emotions: List[str], intensity: int, original_text: str) -> str:
        """Generate conversational emotional insight focused purely on understanding feelings."""
        primary_emotion = emotions[0] if emotions else "neutral"
        text_snippet = original_text[:150].lower()
        
        # Emotion-specific conversational reflections
        emotion_reflections = {
            "joy": "I can feel the lightness and warmth radiating from your words. There's something beautiful about the joy you're experiencing - it feels genuine and heartfelt.",
            "sadness": "There's a heaviness that comes through in what you've written, and I can sense the sadness settling around you like a quiet companion. Your feelings have such depth.",
            "anger": "I can feel the fire and energy of your anger - there's something powerful about the way it's moving through you right now.",
            "fear": "There's a trembling quality to your emotions that I can sense. The fear you're feeling seems to be touching something deep inside you.",
            "surprise": "I can feel the sudden shift in your emotional landscape - like something unexpected has stirred up feelings you weren't quite prepared for.",
            "love": "The warmth and tenderness in your words is palpable. I can sense how the love you're feeling is opening up spaces in your heart.",
            "disgust": "There's a sharp edge to what you're feeling - I can sense the disgust creating distance and protection around something important to you.",
            "neutral": "There's a thoughtful stillness in your emotional space right now. I appreciate the calm, straightforward way you've shared this with me."
        }
        
        # Handle neutral emotion specially for simple/factual statements
        if primary_emotion == "neutral":
            # More conversational neutral responses
            if any(pattern in text_snippet for pattern in ['i am a', 'my name is', 'i live in', 'i work as']) or len(text_snippet) < 30:
                return "Thanks for sharing that with me. I appreciate you being so open and straightforward - there's something really genuine about the way you express yourself."
            else:
                return "I can sense a calm, thoughtful energy in what you've shared. It feels like you're in a peaceful headspace right now."
        else:
            # More conversational emotional responses
            if intensity >= 8:
                intensity_feeling = "Wow, I can really feel the intensity of what you're going through"
            elif intensity >= 6:
                intensity_feeling = "I can feel how deeply this is affecting you"
            elif intensity >= 4:
                intensity_feeling = "There's definitely some strong emotions coming through"
            else:
                intensity_feeling = "I can sense the emotions beneath the surface"
            
            # More conversational emotion reflections
            emotion_responses = {
                "joy": "The happiness is just radiating from your words! It sounds like you're in such a good place right now.",
                "sadness": "I can feel the heaviness in what you've shared. It sounds like you're going through something really tough.",
                "anger": "I can sense the fire and frustration you're feeling. That intensity is really coming through.",
                "fear": "There's definitely some anxiety and worry coming through in your words. I can feel that uncertainty you're experiencing.",
                "surprise": "It sounds like something really caught you off guard! I can sense that feeling of being shaken up.",
                "love": "The warmth and affection in your words is so beautiful. I can feel how much this means to you.",
                "disgust": "I can sense your strong reaction to this. It sounds like something really rubbed you the wrong way."
            }
            
            base_reflection = emotion_responses.get(primary_emotion, f"I can really feel the {primary_emotion} you're experiencing.")
            
            # Add conversational context
            contextual_feeling = ""
            if "work" in text_snippet or "job" in text_snippet:
                contextual_feeling = " Work stuff can really get to you, can't it?"
            elif "family" in text_snippet or "friend" in text_snippet or "relationship" in text_snippet:
                contextual_feeling = " Relationships can bring up such complex feelings."
            elif "tired" in text_snippet or "exhausted" in text_snippet:
                contextual_feeling = " It sounds like you're really feeling drained."
            elif "excited" in text_snippet or "amazing" in text_snippet:
                contextual_feeling = " That excitement is so contagious!"
            
            return f"{intensity_feeling}.{contextual_feeling} {base_reflection}"
    
    async def analyze_journal(self, journal_text: str) -> Dict[str, any]:
        """Main method to analyze a journal entry."""
        try:
            # Step 1: Refine the text
            logger.info("Refining journal text...")
            refined_text = await self.refine_text(journal_text)
            
            # Step 2: Get emotion analysis
            logger.info("Analyzing emotions...")
            emotion_data = await self.get_emotion_summary(refined_text)
            
            # Step 3: Get dominant emotion
            logger.info("Classifying dominant emotion...")
            emotion_results = await self.classify_emotions(refined_text)
            dominant_emotion = emotion_results[0]['label'] if emotion_results else "neutral"
            
            result = {
                "refined": refined_text,
                "summary": emotion_data["summary"],
                "emotions": emotion_data["emotions"],
                "intensity": emotion_data["intensity"],
                "dominant_emotion": dominant_emotion
            }
            
            logger.info("Journal analysis completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in journal analysis: {str(e)}")
            raise e