
import { ChatCommand, ConversationState } from '@/types/chat';
import { WorkoutPlan } from '@/types/user';
import { generateWorkoutPlan } from './workoutGenerator';

export const processCommand = (
  command: ChatCommand,
  conversationState: ConversationState,
  setSuggestedWorkoutPlan: (plan: WorkoutPlan) => void,
  savePlan: (plan: WorkoutPlan) => void,
  currentPlan: WorkoutPlan | null,
  deletePlan: () => void,
  suggestedWorkoutPlan: WorkoutPlan | null
): string => {
  switch (command) {
    case 'updateplan':
      const updatedPlan = generateWorkoutPlan(conversationState);
      setSuggestedWorkoutPlan(updatedPlan);
      const forPerson = conversationState.forWhom === 'self' ? 'you' : conversationState.forWhom;
      return `I've created a personalized workout plan for ${forPerson} based on our conversation. The plan is now visible on the right side of your screen. Would you like to save it to your dashboard?`;
    
    case 'save plan':
      if (suggestedWorkoutPlan) {
        savePlan(suggestedWorkoutPlan);
        return `Great! The ${suggestedWorkoutPlan.name} has been saved. You can view it on your dashboard anytime.`;
      } else {
        return "I don't have a workout plan to save yet. Let me create one for you first.";
      }
    
    case '+1':
      const alternativePlan = generateWorkoutPlan(conversationState);
      setSuggestedWorkoutPlan(alternativePlan);
      return "Here's an alternative workout plan. Let me know if this one works better for you.";
    
    case 'delete plan':
      if (currentPlan) {
        deletePlan();
        return "Your current workout plan has been deleted. Would you like me to create a new one?";
      } else {
        return "You don't have an active workout plan to delete.";
      }
    
    default:
      return "I'm not sure what command you're trying to use. Try 'updateplan', 'save plan', '+1', or 'delete plan'.";
  }
};

export const isCommand = (text: string): boolean => {
  const commands: ChatCommand[] = ['updateplan', 'save plan', '+1', 'delete plan'];
  return commands.includes(text.toLowerCase().trim() as ChatCommand);
};

export const getCommandFromText = (text: string): ChatCommand | null => {
  const lowerCaseText = text.toLowerCase().trim();
  const commands: ChatCommand[] = ['updateplan', 'save plan', '+1', 'delete plan'];
  
  for (const cmd of commands) {
    if (lowerCaseText === cmd) {
      return cmd;
    }
  }
  
  return null;
};

export const getAllCommands = (): { command: ChatCommand; description: string }[] => {
  return [
    { command: 'updateplan', description: 'Generate a new workout plan based on your preferences' },
    { command: 'save plan', description: 'Save the current workout plan to your profile' },
    { command: '+1', description: 'Generate an alternative workout plan' },
    { command: 'delete plan', description: 'Delete your current workout plan' },
  ];
};
