
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserModel, BasicInformation } from '@/types/user';

interface ProfileSectionProps {
  user: UserModel;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  // Extract the user's basic information
  const basicInfo = user.staticAttributes.basicInformation;
  
  // Create initials from user's name
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : 'U';
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt={basicInfo.name || "User"} />
          <AvatarFallback className="text-lg">
            {getInitials(basicInfo.name || "User")}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{basicInfo.name || "User"}</CardTitle>
          <CardDescription>Fitness Enthusiast</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Age</span>
            <span>{basicInfo.age || "Not set"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Gender</span>
            <span>{basicInfo.gender || "Not set"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Location</span>
            <span>{basicInfo.location || "Not set"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Health Status</span>
            <span>
              {basicInfo.healthStatus && basicInfo.healthStatus.length > 0
                ? basicInfo.healthStatus.join(", ")
                : "No health conditions"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
