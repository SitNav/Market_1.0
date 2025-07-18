import { useState, useEffect } from 'react';
import { fetchAuthSession, signIn, signUp, signOut, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

export const useAmplifyAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, firstName, lastName) => {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          given_name: firstName,
          family_name: lastName,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const confirmSignUp = async (email, code) => {
    try {
      const result = await Auth.confirmSignUp(email, code);
      await checkAuthState();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await Auth.forgotPassword(email);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const confirmResetPassword = async (email, code, newPassword) => {
    try {
      const result = await Auth.forgotPasswordSubmit(email, code, newPassword);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (attributes) => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const result = await Auth.updateUserAttributes(user, attributes);
      await checkAuthState();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    resetPassword,
    confirmResetPassword,
    updateProfile,
    checkAuthState,
  };
};