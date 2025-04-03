
import { useState, useEffect } from 'react';
import { ConversationState } from '@/types/chat';

export function useConversation() {
  // State to track conversation flow and avoid repetitive questions
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 0,
    userName: '',
    forWhom: '',
    askedQuestions: new Set<string>(),
    targetBodyAreas: [],
  });

  // Load conversation state from localStorage on mount
  useEffect(() => {
    const storedConversationState = localStorage.getItem('flexifit_conversation_state');
    
    if (storedConversationState) {
      try {
        const parsedState = JSON.parse(storedConversationState);
        // Convert askedQuestions back to a Set
        parsedState.askedQuestions = new Set(parsedState.askedQuestions);
        setConversationState(parsedState);
      } catch (error) {
        console.error('Error parsing stored conversation state:', error);
      }
    }
  }, []);

  // Save conversation state to localStorage
  useEffect(() => {
    if (conversationState.step > 0) {
      // Convert Set to Array for JSON serialization
      const serializableState = {
        ...conversationState,
        askedQuestions: Array.from(conversationState.askedQuestions),
      };
      localStorage.setItem('flexifit_conversation_state', JSON.stringify(serializableState));
    }
  }, [conversationState]);

  // Function to determine the next question based on conversation state
  const getNextQuestion = (): string => {
    const { step, userName, forWhom, askedQuestions } = conversationState;
    
    // Define possible questions
    const questions = [
      // We don't include name questions as they are handled separately in steps 0 and 1
      { id: 'fitness_goals', text: `${userName}, what are your main fitness goals? (e.g., lose weight, build muscle, improve endurance)` },
      { id: 'experience', text: `What's your current fitness level? (beginner, intermediate, advanced)` },
      { id: 'frequency', text: `How many days per week would you like to work out?` },
      { id: 'location', text: `Do you have access to gym equipment, or will you be working out at home?` },
      { id: 'injuries', text: `Do you have any injuries or health conditions I should be aware of?` },
      { id: 'duration', text: `How long would you prefer each workout session to be?` },
      { id: 'preferences', text: `Are there any specific types of exercises you enjoy or dislike?` }
    ];
    
    // Filter out questions already asked
    const availableQuestions = questions.filter(q => !askedQuestions.has(q.id));
    
    // If we've asked all questions, suggest creating a plan
    if (availableQuestions.length === 0) {
      return `Thanks for sharing all that information! I now have enough details to create a personalized workout plan for ${forWhom === 'self' ? 'you' : forWhom}. Type "updateplan" when you're ready to see it!`;
    }
    
    // Otherwise, ask the next available question
    const nextQuestion = availableQuestions[0];
    setConversationState(prev => ({
      ...prev,
      askedQuestions: new Set([...prev.askedQuestions, nextQuestion.id])
    }));
    
    return nextQuestion.text;
  };

  const processUserResponse = (userMessage: string): void => {
    const lowerCaseMessage = userMessage.toLowerCase().trim();
    const { step } = conversationState;
    
    // Update conversation state based on the step
    switch (step) {
      case 0: // Getting user's name
        setConversationState(prev => ({
          ...prev,
          userName: userMessage,
          step: 1
        }));
        break;
      
      case 1: // Getting who the workout is for
        let forWhom;
        if (lowerCaseMessage.includes('me') || 
            lowerCaseMessage.includes('myself') || 
            lowerCaseMessage.includes('i am') || 
            lowerCaseMessage === 'self') {
          forWhom = 'self';
        } else {
          // Extract a name from the response
          forWhom = userMessage.replace(/for\s+|my\s+/gi, '').trim();
        }
        
        setConversationState(prev => ({
          ...prev,
          forWhom,
          step: 2
        }));
        break;
      
      default: // Process responses to other questions
        // Update relevant state based on the last question asked
        const lastAskedQuestion = Array.from(conversationState.askedQuestions).pop();
        
        if (lastAskedQuestion === 'fitness_goals') {
          let fitnessGoals = 'general_health';
          if (lowerCaseMessage.includes('los') || lowerCaseMessage.includes('weight') || lowerCaseMessage.includes('fat')) {
            fitnessGoals = 'fat_loss';
          } else if (lowerCaseMessage.includes('musc') || lowerCaseMessage.includes('strength') || lowerCaseMessage.includes('build')) {
            fitnessGoals = 'muscle_gain';
          } else if (lowerCaseMessage.includes('endur') || lowerCaseMessage.includes('stamina') || lowerCaseMessage.includes('cardio')) {
            fitnessGoals = 'endurance';
          }
          setConversationState(prev => ({ ...prev, fitnessGoals }));
        } 
        else if (lastAskedQuestion === 'experience') {
          let experienceLevel = 'beginner';
          if (lowerCaseMessage.includes('inter')) {
            experienceLevel = 'intermediate';
          } else if (lowerCaseMessage.includes('adv') || lowerCaseMessage.includes('expert')) {
            experienceLevel = 'advanced';
          }
          setConversationState(prev => ({ ...prev, experienceLevel }));
        }
        else if (lastAskedQuestion === 'frequency') {
          // Try to extract a number from the response
          const frequencyMatch = lowerCaseMessage.match(/(\d+)/);
          const frequency = frequencyMatch ? parseInt(frequencyMatch[0]) : 3;
          setConversationState(prev => ({ ...prev, workoutFrequency: frequency }));
        }
        else if (lastAskedQuestion === 'location') {
          let workoutLocation: 'home' | 'gym' | 'both' = 'both';
          if (lowerCaseMessage.includes('home') || lowerCaseMessage.includes('house')) {
            workoutLocation = 'home';
          } else if (lowerCaseMessage.includes('gym') || lowerCaseMessage.includes('equipment')) {
            workoutLocation = 'gym';
          } else if (lowerCaseMessage.includes('both')) {
            workoutLocation = 'both';
          }
          setConversationState(prev => ({ ...prev, workoutLocation }));
        }
        else if (lastAskedQuestion === 'injuries') {
          const injuries = [];
          // Look for common injuries or health conditions in the response
          if (lowerCaseMessage.includes('knee')) injuries.push('knee issues');
          if (lowerCaseMessage.includes('back')) injuries.push('back pain');
          if (lowerCaseMessage.includes('shoulder')) injuries.push('shoulder issues');
          if (lowerCaseMessage.includes('wrist')) injuries.push('wrist problems');
          if (lowerCaseMessage.includes('ankle')) injuries.push('ankle issues');
          
          // Handle cases where user says they have no injuries
          if (lowerCaseMessage.includes('no') || 
              lowerCaseMessage.includes('none') || 
              lowerCaseMessage.includes('healthy')) {
            setConversationState(prev => ({ ...prev, injuries: [] }));
          } else if (injuries.length > 0) {
            setConversationState(prev => ({ ...prev, injuries }));
          }
        }
        break;
    }
  };

  const resetConversation = () => {
    setConversationState({
      step: 0,
      userName: '',
      forWhom: '',
      askedQuestions: new Set<string>(),
      targetBodyAreas: [],
    });
    localStorage.removeItem('flexifit_conversation_state');
  };

  return {
    conversationState,
    setConversationState,
    getNextQuestion,
    processUserResponse,
    resetConversation
  };
}
