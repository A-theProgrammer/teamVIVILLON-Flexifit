import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatHistoryRef = useRef<Message[]>([]);
  
  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'bot',
        text: "👋 Hi there! I'm your Flexifit workout assistant. Before we start, could you tell me your name?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Keep the ref in sync with the state
  useEffect(() => {
    chatHistoryRef.current = messages;
  }, [messages]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem('flexifit_chat_history');
    
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing stored chat messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('flexifit_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const addUserMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);
    return botMessage;
  };

  const clearMessages = () => {
    setMessages([{
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi there! I'm your Flexifit workout assistant. Before we start, could you tell me your name?",
      timestamp: new Date(),
    }]);
    localStorage.removeItem('flexifit_chat_history');
  };

  return {
    messages,
    isTyping,
    setIsTyping,
    addUserMessage,
    addBotMessage,
    clearMessages,
    chatHistoryRef
  };
}
