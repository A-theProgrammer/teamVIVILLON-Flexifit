
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function NotAuthenticatedView() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">You need to be logged in to view your dashboard</h1>
      <p className="text-xl text-muted-foreground mb-8">Please interact with the chatbot to create your profile and workout plan.</p>
      <Button size="lg" onClick={() => navigate('/chatbot')}>
        Go to Chatbot
      </Button>
    </div>
  );
}
