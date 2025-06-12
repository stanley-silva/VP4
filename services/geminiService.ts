
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT, GEMINI_MODEL_NAME, PRONUNCIATION_CHALLENGE_TEXT_PROMPT, PRONUNCIATION_EVALUATION_PROMPT_TEMPLATE } from '../constants';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

export const initializeGemini = (apiKey: string): string | null => {
  if (!apiKey) {
    console.error("API Key is missing.");
    return "API_KEY is not configured. Please ensure it is set in your environment.";
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    chat = ai.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    console.log("Gemini Service Initialized");
    return null; 
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return `Failed to initialize Gemini: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const sendMessageToGeminiStream = async (
  messageText: string
): Promise<AsyncIterableIterator<GenerateContentResponse> | { error: string }> => {
  if (!chat) {
    console.error("Chat session not initialized.");
    return { error: "Chat session not initialized. Call initializeGemini first." };
  }
  try {
    console.log("Sending message to Gemini:", messageText);
    const result = await chat.sendMessageStream({ message: messageText });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return { error: `Error sending message: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const translateTextToPortuguese = async (
  textToTranslate: string
): Promise<string | { error: string }> => {
  if (!ai) { 
    return { error: "Gemini AI client not initialized." };
  }
  if (!textToTranslate.trim()) {
    return { error: "No text provided to translate." };
  }

  const prompt = `Translate the following English text to Brazilian Portuguese: "${textToTranslate}"`;

  try {
    console.log("Requesting translation from Gemini for:", textToTranslate);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    
    const translatedText = response.text;
    if (!translatedText) {
        return { error: "Translation failed: No text returned from API." };
    }
    console.log("Translation received:", translatedText);
    return translatedText;
  } catch (error) {
    console.error("Error translating text with Gemini:", error);
    return { error: `Translation error: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const generatePronunciationChallengeText = async (): Promise<string | { error: string }> => {
  if (!ai) {
    return { error: "Gemini AI client not initialized." };
  }
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: PRONUNCIATION_CHALLENGE_TEXT_PROMPT,
    });
    const challengeText = response.text;
    if (!challengeText || !challengeText.trim()) {
      return { error: "Failed to generate challenge: No text returned from API." };
    }
    return challengeText.trim();
  } catch (error) {
    console.error("Error generating pronunciation challenge text:", error);
    return { error: `Challenge generation error: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const evaluatePronunciation = async (
  originalText: string,
  userAttemptText: string
): Promise<string | { error: string }> => {
  if (!ai) {
    return { error: "Gemini AI client not initialized." };
  }
  try {
    const prompt = PRONUNCIATION_EVALUATION_PROMPT_TEMPLATE
      .replace("{challengeText}", originalText)
      .replace("{userAttemptText}", userAttemptText);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    
    const feedbackText = response.text;
    if (!feedbackText) {
      return { error: "Evaluation failed: No text returned from API." };
    }
    return feedbackText;
  } catch (error) {
    console.error("Error evaluating pronunciation:", error);
    return { error: `Pronunciation evaluation error: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const isGeminiInitialized = (): boolean => !!chat;
