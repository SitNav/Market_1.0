const { createProxyMiddleware } = require('http-proxy-middleware');

// For development, proxy to local Express server
const proxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
});

exports.handler = async (event, context) => {
  // For production, you would need to implement your API logic here
  // or use serverless functions that match your Express routes
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'API endpoint - configure for production' })
  };
};