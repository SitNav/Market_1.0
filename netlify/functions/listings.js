// Basic listings handler for Netlify deployment
exports.handler = async (event, context) => {
  const { httpMethod, path, body, queryStringParameters } = event;
  
  // Handle CORS
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

  try {
    // For demo purposes - return sample data
    // In production, connect to your database
    const sampleListings = [
      {
        id: 1,
        title: 'Sample Listing',
        description: 'This is a sample listing for demonstration',
        price: 100,
        category: 'Housing',
        user: { name: 'Demo User' },
        images: [],
        createdAt: new Date().toISOString()
      }
    ];

    switch (httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sampleListings)
        };
        
      case 'POST':
        const newListing = JSON.parse(body);
        const createdListing = {
          id: Date.now(),
          ...newListing,
          createdAt: new Date().toISOString()
        };
        
        return {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createdListing)
        };
        
      default:
        return {
          statusCode: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
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