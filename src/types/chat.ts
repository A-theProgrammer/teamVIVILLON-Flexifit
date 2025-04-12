
import { WorkoutPlan } from './user';

export type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
};

// Changed from specific strings to string type to accommodate dynamic commands
export type ChatCommand = string;

export interface CommandInfo {
  command: ChatCommand;
  description: string;
}

// Conversation state to manage the flow
export type ConversationState = {
  step: number;
  userName: string;
  forWhom: string; // self, friend, client, etc.
  askedQuestions: Set<string>; // Track questions already asked to avoid repetition
  fitnessGoals?: string;
  experienceLevel?: string;
  workoutFrequency?: number;
  workoutLocation?: 'home' | 'gym' | 'both';
  injuries?: string[];
  healthConditions?: string[];
  targetBodyAreas?: string[]; // New field for body areas
  timeAvailable: number
};

export type ChatbotContextType = {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  processAudioInput: (audioBlob: Blob) => Promise<void>;
  suggestedWorkoutPlan: WorkoutPlan | null;
  clearChat: () => void;
  processingAudio: boolean;
  executeCommand: (command: ChatCommand) => void; // New function to execute commands
};
