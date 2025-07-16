// Netlify serverless function for API requests
exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body } = event;
  
  // Handle CORS preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }
  
  // For static deployment, API functionality is limited
  // Full functionality available in Replit deployment
  return {
    statusCode: 503,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify({
      message: 'API not available in static deployment. Please use Replit deployment for full functionality.',
      path: path,
      method: httpMethod,
      note: 'This is a static site deployment. For full marketplace functionality including user authentication, database operations, and file uploads, please use the Replit deployment.'
    }),
  };
};