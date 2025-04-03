
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from './UserContext';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversation } from '@/hooks/useConversation';
import { processCommand, getCommandFromText, isCommand } from '@/utils/chatCommands';
import { ChatbotContextType } from '@/types/chat';
import { WorkoutPlan } from '@/types/user';

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suggestedWorkoutPlan, setSuggestedWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [processingAudio, setProcessingAudio] = useState(false);
  const { user, savePlan, currentPlan, deletePlan } = useUser();
  
  const {
    messages,
    isTyping,
    setIsTyping,
    addUserMessage,
    addBotMessage,
    clearMessages,
  } = useChatMessages();
  
  const {
    conversationState,
    getNextQuestion,
    processUserResponse,
    resetConversation,
    setConversationState
  } = useConversation();

  const botResponse = async (userMessage: string): Promise<string> => {
    // Check for commands first
    const command = getCommandFromText(userMessage);
    if (command) {
      return processCommand(
        command, 
        conversationState, 
        setSuggestedWorkoutPlan, 
        savePlan, 
        currentPlan, 
        deletePlan,
        suggestedWorkoutPlan
      );
    }
    
    // Process the user's response based on conversation state
    processUserResponse(userMessage);
    
    // Generate response based on conversation state
    const { step, userName, forWhom } = conversationState;
    
    // Early conversation flow to get name and who the plan is for
    if (step === 0) {
      return `Nice to meet you, ${userMessage}! Who is this workout plan for? (You can say "me" or enter someone else's name)`;
    } else if (step === 1) {
      const target = forWhom === 'self' ? 'yourself' : forWhom;
      return `Great! I'll help create a personalized workout plan for ${target}. Let's start with the basics. ${getNextQuestion()}`;
    } else {
      // Continue with other questions
      return getNextQuestion();
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    addUserMessage(text);
    setIsTyping(true);
    
    // Simulate network delay for bot response
    setTimeout(async () => {
      try {
        const responseText = await botResponse(text);
        // Add bot response to chat
        addBotMessage(responseText);
      } catch (error) {
        console.error('Error getting bot response:', error);
        toast.error('Failed to get response. Please try again.');
      } finally {
        setIsTyping(false);
      }
    }, 1000);
  };

  const processAudioInput = async (audioBlob: Blob): Promise<void> => {
    setProcessingAudio(true);
    
    // In a real app, we would send the audio to a speech-to-text service
    // For this demo, we'll simulate a response after a delay
    try {
      // Simulate audio processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcription result based on conversation state
      let mockTranscription = "";
      
      if (conversationState.step === 0) {
        mockTranscription = "My name is Alex";
      } else if (conversationState.step === 1) {
        mockTranscription = "This is for me";
      } else {
        const responses = [
          "I want to build muscle and work out 4 times a week",
          "I have access to a gym",
          "No injuries or health conditions",
          "I prefer workouts that are around 45 minutes",
          "I enjoy weight training but dislike long cardio sessions"
        ];
        mockTranscription = responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Send the transcribed message
      sendMessage(mockTranscription);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio. Please try again or type your message.');
    } finally {
      setProcessingAudio(false);
    }
  };

  const executeCommand = (command: string) => {
    if (isCommand(command)) {
      sendMessage(command);
    }
  };

  const clearChat = () => {
    clearMessages();
    setSuggestedWorkoutPlan(null);
    resetConversation();
  };

  // Update conversation state with selected body areas
  const updateBodyAreas = (areas: string[]) => {
    setConversationState(prev => ({
      ...prev,
      targetBodyAreas: areas
    }));
  };

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isTyping,
        sendMessage,
        processAudioInput,
        suggestedWorkoutPlan,
        clearChat,
        processingAudio,
        executeCommand,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
