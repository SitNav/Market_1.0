import { Auth } from 'aws-amplify';

// Authentication functions
export const signUp = async (email, password, firstName, lastName) => {
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
    console.error('Sign up error:', error);
    throw error;
  }
};

export const confirmSignUp = async (email, code) => {
  try {
    const result = await Auth.confirmSignUp(email, code);
    return result;
  } catch (error) {
    console.error('Confirm sign up error:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    console.log('No authenticated user:', error);
    return null;
  }
};

export const getCurrentUserInfo = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userInfo = await Auth.currentUserInfo();
    return {
      ...user,
      ...userInfo,
    };
  } catch (error) {
    console.log('Error getting user info:', error);
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    const result = await Auth.forgotPassword(email);
    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const confirmResetPassword = async (email, code, newPassword) => {
  try {
    const result = await Auth.forgotPasswordSubmit(email, code, newPassword);
    return result;
  } catch (error) {
    console.error('Confirm reset password error:', error);
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const result = await Auth.changePassword(user, oldPassword, newPassword);
    return result;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const updateUserProfile = async (attributes) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const result = await Auth.updateUserAttributes(user, attributes);
    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};