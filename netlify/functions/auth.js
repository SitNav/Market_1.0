const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    switch (httpMethod) {
      case 'GET':
        // Get user info
        const token = headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: 'No token provided' })
          };
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: decoded })
        };
        
      case 'POST':
        // Login/signup
        const { email, password } = JSON.parse(body);
        
        // For demo purposes - in production, verify credentials
        const user = { id: '1', email, name: 'Demo User' };
        
        const token = jwt.sign(user, process.env.JWT_SECRET || 'fallback-secret', {
          expiresIn: '24h'
        });
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, user })
        };
        
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};