import { ChatCommand, ConversationState } from '@/types/chat';
import { WorkoutPlan, UserModel } from '@/types/user';
import { generateWorkoutPlan } from './workoutGenerator';

export const processCommand = (
  command: ChatCommand,
  conversationState: ConversationState,
  setSuggestedWorkoutPlan: (plan: WorkoutPlan) => void,
  savePlan: (plan: WorkoutPlan) => void,
  currentPlan: WorkoutPlan | null,
  deletePlan: () => void,
  suggestedWorkoutPlan: WorkoutPlan | null,
  user?: UserModel | null,
  feedbackHistory?: any[]
): string => {
  switch (command) {
    case 'updateplan':
      // Pass user data to generate an adaptive workout plan
      const updatedPlan = generateWorkoutPlan(
        conversationState,
        undefined,
        undefined,
        user,                          // Pass user data
        currentPlan,                   // Pass current plan
        feedbackHistory                // Pass feedback history
      );
      
      setSuggestedWorkoutPlan(updatedPlan);
      const forPerson = conversationState.forWhom === 'self' ? 'you' : conversationState.forWhom;
      
      // Customize message if adaptive engine was used
      if (user && (currentPlan || user.dynamicAttributes?.workoutProgress?.completedExercises?.length > 10)) {
        return `I've created an adaptive workout plan for ${forPerson} based on your progress and feedback. This plan has been optimized based on your performance data. The plan is now visible on the right side of your screen.`;
      } else {
        return `I've created a personalized workout plan for ${forPerson} based on our conversation. The plan is now visible on the right side of your screen. Would you like to save it to your dashboard?`;
      }
    
    case 'save plan':
      if (suggestedWorkoutPlan) {
        savePlan(suggestedWorkoutPlan);
        return `Great! The ${suggestedWorkoutPlan.name} has been saved. You can view it on your dashboard anytime.`;
      } else {
        return "I don't have a workout plan to save yet. Let me create one for you first.";
      }
    
    case '+1':
      // Generate alternative plan with adaptive features if available
      const alternativePlan = generateWorkoutPlan(
        conversationState,
        undefined,
        undefined,
        user,                          // Pass user data
        currentPlan,                   // Pass current plan
        feedbackHistory                // Pass feedback history
      );
      
      setSuggestedWorkoutPlan(alternativePlan);
      return "Here's an alternative workout plan. Let me know if this one works better for you.";
    
    case 'delete plan':
      if (currentPlan) {
        deletePlan();
        return "Your current workout plan has been deleted. Would you like me to create a new one?";
      } else {
        return "You don't have an active workout plan to delete.";
      }
    
      case 'report injury':
        return "I'll help you report an injury or physical limitation. This will help me adjust your workout plan to accommodate your condition.";
      
      default:
        return "I'm not sure what command you're trying to use. Try 'updateplan', 'save plan', '+1', 'delete plan', or 'report injury'.";
  
    }
};

export const isCommand = (text: string): boolean => {
  const commands: ChatCommand[] = ['updateplan', 'save plan', '+1', 'delete plan', 'report injury'];
  return commands.includes(text.toLowerCase().trim() as ChatCommand);
};

export const getCommandFromText = (text: string): ChatCommand | null => {
  const lowerCaseText = text.toLowerCase().trim();
  const commands: ChatCommand[] = ['updateplan', 'save plan', '+1', 'delete plan', 'report injury'];
  
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
    { command: 'report injury', description: 'Report an injury or physical limitation' },
  ];
};