// Categories handler for Netlify deployment
exports.handler = async (event, context) => {
  const { httpMethod } = event;
  
  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    // Sample categories data
    const categories = [
      { id: 1, name: "Housing", slug: "housing" },
      { id: 2, name: "Employment", slug: "employment" },
      { id: 3, name: "Food & Essentials", slug: "food-essentials" },
      { id: 4, name: "Healthcare", slug: "healthcare" },
      { id: 5, name: "Education", slug: "education" },
      { id: 6, name: "Transportation", slug: "transportation" },
      { id: 7, name: "Legal Aid", slug: "legal-aid" },
      { id: 8, name: "Community Services", slug: "community-services" }
    ];

    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categories)
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
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