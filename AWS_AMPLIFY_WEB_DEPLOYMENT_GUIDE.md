# 🚀 AWS Amplify Web Interface Deployment Guide

## Overview
This guide walks you through deploying your TerraNav marketplace using the AWS Amplify web interface. This is the easiest way to deploy without using the command line.

## Prerequisites
- AWS Account (free tier available)
- GitHub account with your code repository
- Your project is ready for deployment (Phase 2 complete)

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, ensure your code is in a GitHub repository:

```bash
# If not already done, push your code to GitHub
git add .
git commit -m "Ready for AWS Amplify deployment"
git push origin main
```

### 2. Access AWS Amplify Console

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Sign in to your AWS account
3. Search for "Amplify" in the services search bar
4. Click on "AWS Amplify"

### 3. Create New Amplify App

1. Click "Get Started" under "Amplify Hosting"
2. Select "GitHub" as your repository service
3. Click "Continue"
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository from the dropdown
6. Select the branch (usually "main" or "master")
7. Click "Next"

### 4. Configure Build Settings

AWS Amplify will auto-detect your build settings. Your `amplify.yml` file should look like this:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
backend:
  phases:
    build:
      commands:
        - '# Execute Amplify CLI with the helper script'
        - amplifyPush --simple
```

### 5. Configure Environment Variables

1. Expand "Advanced settings"
2. Add these environment variables:

```
NODE_ENV=production
VITE_GA_MEASUREMENT_ID=your_google_analytics_id
```

### 6. Deploy Your App

1. Click "Next" to review your settings
2. Click "Save and deploy"
3. Wait for the deployment to complete (5-10 minutes)

### 7. Set Up Backend Services

After initial deployment, you'll need to add backend services:

#### A. Add Authentication (AWS Cognito)
1. In your Amplify app console, click "Authentication"
2. Click "Set up authentication"
3. Choose "Cognito User Pool"
4. Configure sign-up attributes: Email, Name
5. Set password policy (minimum 8 characters)
6. Click "Create service"

#### B. Add API (GraphQL)
1. Click "API" in the left sidebar
2. Click "Create API"
3. Choose "GraphQL API"
4. Upload your schema file: `amplify/backend/api/marketplace/schema.graphql`
5. Configure authorization:
   - Default: Amazon Cognito User Pool
   - Additional: API Key (for public access)
6. Click "Create API"

#### C. Add Storage (S3)
1. Click "Storage" in the left sidebar
2. Click "Add storage"
3. Choose "Content" (images and files)
4. Configure bucket name: `marketplace-storage-[random-id]`
5. Set permissions:
   - Auth users: Create, Read, Update, Delete
   - Guest users: Read
6. Click "Create storage"

### 8. Update Your App Configuration

After backend services are created, update your `aws-exports.js`:

1. Download the configuration from Amplify console
2. Replace the placeholder values in `client/aws-exports.js`
3. Commit and push changes to trigger redeployment

### 9. Custom Domain (Optional)

1. Click "Domain management" in Amplify console
2. Click "Add domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### 10. Monitor Your Deployment

1. Check build logs in the Amplify console
2. Test your application at the provided URL
3. Monitor performance in CloudWatch
4. Set up alerts for errors or performance issues

## Troubleshooting

### Common Issues:

**Build Fails:**
- Check build logs in Amplify console
- Verify Node.js version compatibility
- Ensure all dependencies are listed in package.json

**Authentication Issues:**
- Verify Cognito configuration
- Check redirect URLs in auth settings
- Ensure aws-exports.js is properly configured

**API Errors:**
- Check GraphQL schema syntax
- Verify API permissions
- Test queries in GraphQL playground

**File Upload Issues:**
- Verify S3 bucket permissions
- Check CORS configuration
- Ensure proper file size limits

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify listing creation and editing
- [ ] Test image uploads
- [ ] Check search functionality
- [ ] Verify real-time messaging
- [ ] Test mobile responsiveness
- [ ] Check analytics tracking
- [ ] Verify SEO meta tags
- [ ] Test form submissions
- [ ] Check error handling

## Scaling and Optimization

### Performance Optimization:
- Enable CloudFront CDN (automatic)
- Optimize images for web
- Implement lazy loading
- Use GraphQL query optimization

### Security:
- Enable WAF (Web Application Firewall)
- Set up CloudTrail for audit logging
- Configure proper CORS settings
- Use least privilege IAM policies

### Monitoring:
- Set up CloudWatch alarms
- Configure real user monitoring
- Track business metrics
- Monitor error rates

## Cost Management

### Free Tier Limits:
- 1000 build minutes/month
- 15 GB data transfer/month
- 5 GB storage
- 50,000 requests/month

### Cost Optimization:
- Use caching effectively
- Optimize build times
- Monitor data transfer
- Use appropriate instance sizes

## Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS Amplify Discord Community](https://discord.gg/amplify)
- [GitHub Issues](https://github.com/aws-amplify/amplify-js/issues)

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan scaling strategies
4. Set up CI/CD pipelines
5. Configure production environment variables
6. Set up custom domain and SSL
7. Implement advanced security measures
8. Plan disaster recovery procedures

Your TerraNav marketplace is now ready for production with enterprise-grade infrastructure, automatic scaling, and global CDN distribution!