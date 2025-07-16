const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // This function is triggered by Cognito post-confirmation
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const { sub: userId, email, given_name, family_name } = event.request.userAttributes;

    const params = {
      TableName: process.env.USER_TABLE,
      Item: {
        id: userId,
        email: email,
        firstName: given_name || '',
        lastName: family_name || '',
        profileImageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    try {
      await ddb.put(params).promise();
      console.log('User created in DynamoDB:', userId);
    } catch (error) {
      console.error('Error creating user in DynamoDB:', error);
      throw error;
    }
  }

  return event;
};