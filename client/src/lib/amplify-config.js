import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

// Export configuration for use in components
export default awsconfig;