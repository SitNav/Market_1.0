import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import Logo from '@/components/logo';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');

  const handleSignInSuccess = () => {
    // Auth state will be handled by AuthProvider
    console.log('Sign in successful');
  };

  const handleSignUpSuccess = () => {
    setActiveTab('signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">TerraNav Solutions</h1>
          <p className="text-gray-600 mt-2">Community Resource Marketplace</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignInForm onSignInSuccess={handleSignInSuccess} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          <p>Helping communities find resources and opportunities</p>
        </div>
      </div>
    </div>
  );
}