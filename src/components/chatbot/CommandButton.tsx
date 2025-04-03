
import React from 'react';
import { Button } from '@/components/ui/button';
import { CommandInfo } from '@/types/chat';

interface CommandButtonProps {
  commandInfo: CommandInfo;
  onClick: () => void;
}

export function CommandButton({ commandInfo, onClick }: CommandButtonProps) {
  return (
    <Button 
      variant="outline" 
      className="text-xs h-8 px-2 py-1 rounded" 
      onClick={onClick}
      title={commandInfo.description}
    >
      {commandInfo.command}
    </Button>
  );
}
