import React from 'react';
import { AdaptiveTimeline } from '@/components/adaptive/AdaptiveTimeline';
import { UserComparison } from '@/components/adaptive/UserComparison';
import { InjuryAdaptation } from '@/components/adaptive/InjuryAdaptation';

const AdaptiveDemoPage = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Adaptive Algorithm Demonstration</h1>
      <p className="text-lg text-muted-foreground mb-8">
        These demonstrations showcase the adaptive capabilities of the Flexifit system, including longitudinal adaptation,
        user personalization, and handling of sudden circumstances.
      </p>
      
      <div className="space-y-8">
        <AdaptiveTimeline />
        <UserComparison />
        <InjuryAdaptation />
      </div>
    </div>
  );
};

export default AdaptiveDemoPage;