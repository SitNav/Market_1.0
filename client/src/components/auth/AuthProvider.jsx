import { createContext, useContext, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { useAmplifyAuth } from '../../hooks/useAmplifyAuth';
import awsconfig from '../../../aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const amplifyAuth = useAmplifyAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        await amplifyAuth.checkAuthState();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={amplifyAuth}>
      {children}
    </AuthContext.Provider>
  );
};