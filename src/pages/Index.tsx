
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Dumbbell, Target, BarChart4, CalendarCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text animate-fade-in">
            Personalized Workouts <br className="hidden md:block" />For Your Fitness Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto animate-fade-in">
            Flexifit generates custom workout plans tailored to your goals, experience, and lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              size="lg" 
              onClick={() => navigate('/chatbot')}
              className="font-semibold"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="font-semibold"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            How <span className="gradient-text">Flexifit</span> Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Target className="h-10 w-10 text-flexifit-blue" />,
                title: "Set Your Goals",
                description: "Tell us about your fitness goals, experience, and preferences."
              },
              {
                icon: <Dumbbell className="h-10 w-10 text-flexifit-teal" />,
                title: "Get Your Plan",
                description: "Receive a personalized workout plan designed specifically for you."
              },
              {
                icon: <BarChart4 className="h-10 w-10 text-flexifit-blue" />,
                title: "Track Progress",
                description: "Log your workouts and see your improvements over time."
              },
              {
                icon: <CalendarCheck className="h-10 w-10 text-flexifit-teal" />,
                title: "Stay Consistent",
                description: "Adjust your plan as needed to keep making progress."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="gradient-text">Flexifit</span>?
              </h2>
              <ul className="space-y-4">
                {[
                  "Personalized workout plans based on your fitness level and goals",
                  "Adaptive training that evolves with your progress",
                  "Easy tracking of your workout activities and results",
                  "Intelligent recommendations based on your feedback",
                  "Interactive chatbot assistant available 24/7"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" onClick={() => navigate('/chatbot')}>
                Start Your Fitness Journey
              </Button>
            </div>
            <div className="bg-gradient-to-br from-flexifit-blue to-flexifit-teal rounded-2xl p-1">
              <div className="bg-card rounded-xl p-8">
                <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center">
                  <div className="text-center">
                    <Dumbbell className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Your Personalized</p>
                    <h3 className="text-2xl font-bold gradient-text">Fitness Coach</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-flexifit-blue to-flexifit-teal text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get your personalized workout plan today and start your journey to a healthier you.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/chatbot')}
            className="font-semibold"
          >
            Create Your Plan Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
