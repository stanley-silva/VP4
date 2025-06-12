
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  translatedText?: string; // Added for PT-BR translation
}

export enum AppState {
  Idle = 'idle', // Ready to record
  Recording = 'recording', // Mic is active
  Processing = 'processing', // Waiting for AI
  Speaking = 'speaking', // AI is talking via TTS
  Error = 'error', // An error occurred
  Initializing = 'initializing' // Initial setup
}

export interface ChallengeContext {
  status: 'idle' | 'generating_text' | 'awaiting_attempt' | 'evaluating_attempt' | 'error_generating' | 'error_evaluating';
  challengeText: string | null;
  error?: string | null;
}
