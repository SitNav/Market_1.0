const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting TerraNav build process...');

// Build the client
console.log('📦 Building client application...');
execSync('npm run build:client', { stdio: 'inherit' });

// Build the server
console.log('🔧 Building server application...');
execSync('npm run build:server', { stdio: 'inherit' });

// Copy static assets
console.log('📁 Copying static assets...');
const distDir = path.join(__dirname, 'dist');
const staticDir = path.join(__dirname, 'client/public');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets
if (fs.existsSync(staticDir)) {
  execSync(`cp -r ${staticDir}/* ${distDir}/`, { stdio: 'inherit' });
}

// Create uploads directory in dist
const distUploadsDir = path.join(distDir, 'uploads');
if (!fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
}

// Copy existing uploads if they exist
if (fs.existsSync(uploadsDir)) {
  execSync(`cp -r ${uploadsDir}/* ${distUploadsDir}/`, { stdio: 'inherit' });
}

console.log('✅ Build completed successfully!');
console.log('📋 Next steps for deployment:');
console.log('1. Set up environment variables in your deployment platform');
console.log('2. Configure your database connection');
console.log('3. Run database migrations: npm run db:push');
console.log('4. Start the application: npm run start:prod');