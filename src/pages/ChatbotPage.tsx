
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Mic, Send, StopCircle, Dumbbell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useUser } from '@/contexts/UserContext';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';
import { BodyAreaSelector } from '@/components/workout/BodyAreaSelector';
import { CommandButton } from '@/components/chatbot/CommandButton';
import { useNavigate } from 'react-router-dom';
import { CommandInfo } from '@/types/chat';

const ChatbotPage = () => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);
  const [showBodySelector, setShowBodySelector] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isTyping, 
    sendMessage, 
    processAudioInput, 
    suggestedWorkoutPlan, 
    clearChat, 
    processingAudio,
    executeCommand 
  } = useChatbot();
  const { isAuthenticated, login } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  
  // Command definitions with descriptions
  const commands: CommandInfo[] = [
    { command: 'updateplan', description: 'Generate a new workout plan based on your preferences' },
    { command: 'save plan', description: 'Save the current workout plan to your profile' },
    { command: '+1', description: 'Generate an alternative workout plan' },
    { command: 'delete plan', description: 'Delete your current workout plan' },
  ];
  
  // Auto-login for demo purposes
  useEffect(() => {
    if (!isAuthenticated) {
      login('demo_user');
    }
  }, [isAuthenticated, login]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Detect when to show body area selector
  useEffect(() => {
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
    if (lastBotMessage && 
        (lastBotMessage.text.toLowerCase().includes("updateplan") || 
         lastBotMessage.text.toLowerCase().includes("generate a workout"))) {
      setShowBodySelector(true);
    }
  }, [messages]);
  
  // Hide body selector when workout plan is generated
  useEffect(() => {
    if (suggestedWorkoutPlan) {
      setShowBodySelector(false);
    }
  }, [suggestedWorkoutPlan]);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        processAudioInput(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      });
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleExecuteCommand = (command: CommandInfo) => {
    executeCommand(command.command);
  };

  const viewDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleBodySelectorComplete = () => {
    setShowBodySelector(false);
    // Use the selected body areas to update the plan
    if (selectedBodyAreas.length > 0) {
      executeCommand(`updateplan for ${selectedBodyAreas.join(', ')}`);
    } else {
      executeCommand('updateplan');
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Flexifit Assistant</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
              <Button variant="default" size="sm" onClick={viewDashboard}>
                View Dashboard
              </Button>
            </div>
          </div>
          
          <Card className="flex-1 flex flex-col h-full overflow-hidden">
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              ref={chatContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-xl p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {showBodySelector && !suggestedWorkoutPlan && (
                <div className="flex justify-start w-full">
                  <div className="bg-secondary text-secondary-foreground rounded-xl p-3 w-full">
                    <p className="mb-2 font-medium">Select body areas to focus on:</p>
                    <BodyAreaSelector 
                      selectedAreas={selectedBodyAreas}
                      onChange={setSelectedBodyAreas}
                      onComplete={handleBodySelectorComplete}
                    />
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Press Enter to send, Ctrl+Enter for new line)"
                  className="resize-none"
                  rows={1}
                />
                <div className="flex gap-2">
                  {isRecording ? (
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="destructive" 
                      onClick={stopRecording}
                      disabled={processingAudio}
                    >
                      <StopCircle className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="secondary" 
                      onClick={startRecording}
                      disabled={processingAudio}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                  <Button type="submit" size="icon" disabled={!input.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </Card>
          
          <div className="mt-4">
            <p className="font-semibold text-sm text-muted-foreground mb-2">Available commands:</p>
            <div className="flex flex-wrap gap-2">
              {commands.map((cmd) => (
                <CommandButton 
                  key={cmd.command} 
                  commandInfo={cmd} 
                  onClick={() => handleExecuteCommand(cmd)} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Workout Plan Preview */}
        <div className="lg:w-1/2 h-full">
          {suggestedWorkoutPlan ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Suggested Workout Plan</h2>
                <Button 
                  onClick={() => {
                    executeCommand('save plan');
                    navigate('/dashboard');
                  }}
                  className="flex items-center"
                >
                  Save & View <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <WorkoutPlanDisplay plan={suggestedWorkoutPlan} />
              </div>
            </div>
          ) : (
            <Card className="p-6 h-full flex flex-col justify-center items-center text-center">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Workout Plan Yet</h3>
              <p className="text-muted-foreground mt-2">
                Chat with the assistant to get a personalized workout plan based on your goals and preferences.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Try typing "updateplan" to generate a workout plan.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
