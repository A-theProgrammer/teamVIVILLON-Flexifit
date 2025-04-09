// src/components/adaptive/InjuryAdaptation.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WorkoutPlanDisplay } from '@/components/workout/WorkoutPlanDisplay';
import { InjuryReportingModal } from './InjuryReportingModal';
import { Ambulance, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateWorkoutPlan } from '@/utils/workoutGenerator';
import { sampleUsers } from '@/utils/sampleUsers';
import { AdaptiveEngine } from '@/adaptiveEngine/AdaptiveEngine';

export function InjuryAdaptation() {
  // Use a sample user and plan
  const sampleUser = sampleUsers[1]; // Intermediate user
  
  // State management
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  const [originalPlan, setOriginalPlan] = useState<any>(null);
  const [adaptedPlan, setAdaptedPlan] = useState<any>(null);
  const [injuryDetails, setInjuryDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('original');
  
  // Initialize original plan
  React.useEffect(() => {
    // Create conversation state for sample user
    const conversationState = {
      step: 2,
      userName: sampleUser.staticAttributes.basicInformation.name,
      forWhom: 'self',
      askedQuestions: new Set<string>([
        'fitness_goals', 'experience', 'frequency', 'location', 'injuries'
      ]),
      fitnessGoals: sampleUser.staticAttributes.fitnessGoals.primaryGoal,
      experienceLevel: sampleUser.staticAttributes.exerciseBackground.experienceLevel,
      workoutFrequency: sampleUser.staticAttributes.exerciseBackground.currentExerciseHabits.frequencyPerWeek,
      workoutLocation: 'both',
      injuries: [],
      targetBodyAreas: []
    };
    
    // Generate original plan
    const plan = generateWorkoutPlan(
      conversationState,
      sampleUser.staticAttributes.fitnessGoals.primaryGoal,
      sampleUser.staticAttributes.exerciseBackground.experienceLevel,
      sampleUser
    );
    
    setOriginalPlan(plan);
  }, []);
  
  // Handle injury submission
  const handleInjurySubmit = (injuryData: any) => {
    setInjuryDetails(injuryData);
    
    // Create an updated user with injury information
    const updatedUser = {
      ...sampleUser,
      staticAttributes: {
        ...sampleUser.staticAttributes,
        basicInformation: {
          ...sampleUser.staticAttributes.basicInformation,
          healthStatus: [
            ...(sampleUser.staticAttributes.basicInformation.healthStatus || []),
            injuryData
          ]
        }
      }
    };
    
    // Use adaptive engine to generate adjusted plan
    try {
      const adaptiveEngine = new AdaptiveEngine();
      const adjustedPlan = adaptiveEngine.generateAdaptiveWorkoutPlan(
        updatedUser,
        originalPlan,
        [] // Empty feedback history
      );
      
      setAdaptedPlan(adjustedPlan);
      setActiveTab('adapted');
    } catch (error) {
      console.error('Failed to generate adapted plan', error);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ambulance className="mr-2 h-5 w-5 text-primary" />
          Handling Sudden Circumstances Demonstration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This demonstration shows how the system handles sudden circumstances such as a knee injury.
          Click the "Report Injury" button to simulate an injury situation and see how the system adapts the training plan.
        </p>
        
        {!adaptedPlan ? (
          <div>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Simulated Scenario</AlertTitle>
              <AlertDescription>
                Imagine you're following your workout plan, but suddenly injure your knee.
                Use the button below to report this injury and see how the system would adjust your training plan.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={() => setIsInjuryModalOpen(true)}
                className="px-6"
              >
                Report Injury
              </Button>
            </div>
            
            {originalPlan && (
              <div>
                <h3 className="font-medium text-lg mb-4">Current Workout Plan</h3>
                <WorkoutPlanDisplay plan={originalPlan} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Plan Adjusted</AlertTitle>
              <AlertDescription>
                The system has automatically adjusted your workout plan based on your reported
                {injuryDetails.affectedAreas.join(', ')} injury ({injuryDetails.severity === 'mild' ? 'mild' : injuryDetails.severity === 'moderate' ? 'moderate' : 'severe'}).
                Affected exercises have been replaced with safer alternatives.
              </AlertDescription>
            </Alert>
            
            <Tabs 
              defaultValue="original" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="original">Original Plan</TabsTrigger>
                <TabsTrigger value="adapted">Adapted Plan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4">
                <WorkoutPlanDisplay plan={originalPlan} />
              </TabsContent>
              
              <TabsContent value="adapted" className="mt-4">
                <WorkoutPlanDisplay plan={adaptedPlan} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <h3 className="font-medium mb-3">Adjustment Summary</h3>
              <div className="space-y-2 text-sm">
                <p>• System identified and replaced all exercises that could aggravate the knee injury</p>
                <p>• Lower body exercises replaced with knee-friendly alternatives</p>
                <p>• Cardiovascular training adjusted to activities that don't apply pressure to the knees</p>
                <p>• Specific instructions added for each replaced exercise</p>
                <p>• Overall intensity slightly reduced to promote recovery</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Injury reporting modal */}
        <InjuryReportingModal 
          isOpen={isInjuryModalOpen}
          onClose={() => setIsInjuryModalOpen(false)}
          onSave={handleInjurySubmit}
        />
      </CardContent>
    </Card>
  );
}