
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PasswordRequirement } from './PasswordRequirement';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { z } from 'zod';
import { useUser } from '@/contexts/UserContext';

// Define schema for form validation
const registrationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .refine(val => /[A-Z]/.test(val), { message: "Password must contain an uppercase letter" })
    .refine(val => /[0-9]/.test(val), { message: "Password must contain a number" })
    .refine(val => /[^A-Za-z0-9]/.test(val), { message: "Password must contain a special character" }),
  age: z.number().min(1, { message: "Age is required" }),
  gender: z.enum(["male", "female", "other"]),
  location: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    name: '',
    email: '',
    password: '',
    age: undefined,
    gender: undefined,
    location: '',
    height: undefined,
    weight: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useUser();

  // Password requirements checking
  const requirements = [
    { text: "At least 6 characters", validator: (val: string) => val.length >= 6 },
    { text: "At least one uppercase letter", validator: (val: string) => /[A-Z]/.test(val) },
    { text: "At least one number", validator: (val: string) => /[0-9]/.test(val) },
    { text: "At least one special character", validator: (val: string) => /[^A-Za-z0-9]/.test(val) },
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    let parsedValue: string | number = value;
    if (type === 'number' && value) {
      parsedValue = parseFloat(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear the error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const calculatePasswordStrength = (): 'weak' | 'medium' | 'strong' => {
    const password = formData.password || '';
    // Count how many requirements are met
    const metRequirements = requirements.filter(req => req.validator(password)).length;
    
    if (password.length >= 15 && metRequirements === requirements.length) {
      return 'strong';
    } else if (metRequirements === requirements.length) {
      return 'medium';
    } else {
      return 'weak';
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the form data
      const validData = registrationSchema.parse(formData);
      
      // In a real app, you would send this data to your backend API
      console.log('Registration data:', validData);
      
      // Show success message
      toast.success("Account created successfully! Redirecting to dashboard...");
      
      // Perform login with the new user
      login(validData.email);
      
      // Redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a format we can use
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Sign up to track your fitness journey and access personalized workout plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name || ''} 
              onChange={handleChange} 
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""} 
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email || ''} 
              onChange={handleChange} 
              placeholder="name@example.com"
              className={errors.email ? "border-destructive" : ""} 
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              value={formData.password || ''} 
              onChange={handleChange} 
              placeholder="Create a secure password"
              className={errors.password ? "border-destructive" : ""} 
            />
            {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            
            <div className="space-y-3 mt-2">
              <div>
                <PasswordStrengthMeter strength={calculatePasswordStrength()} />
              </div>
              
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <PasswordRequirement
                    key={index}
                    text={req.text}
                    fulfilled={req.validator(formData.password || '')}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                name="age"
                type="number" 
                value={formData.age || ''} 
                onChange={handleChange} 
                placeholder="e.g. 30"
                className={errors.age ? "border-destructive" : ""} 
              />
              {errors.age && <p className="text-destructive text-sm">{errors.age}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                name="gender"
                value={formData.gender || ''} 
                onChange={handleChange} 
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? "border-destructive" : ""}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-destructive text-sm">{errors.gender}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location" 
              name="location"
              value={formData.location || ''} 
              onChange={handleChange} 
              placeholder="City, Country"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) (Optional)</Label>
              <Input 
                id="height" 
                name="height"
                type="number" 
                value={formData.height || ''} 
                onChange={handleChange} 
                placeholder="e.g. 175"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) (Optional)</Label>
              <Input 
                id="weight" 
                name="weight"
                type="number" 
                value={formData.weight || ''} 
                onChange={handleChange} 
                placeholder="e.g. 70"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <Button variant="link" onClick={() => navigate('/login')}>
          Already have an account? Log in
        </Button>
      </CardFooter>
    </Card>
  );
}
