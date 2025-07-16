# AWS Amplify Deployment Guide - TerraNav Marketplace

## 🚀 AWS Amplify Overview

AWS Amplify is perfect for your TerraNav marketplace because it provides:
- **Full-stack hosting** with frontend and backend
- **Built-in authentication** (Cognito)
- **GraphQL API** with real-time capabilities
- **File storage** (S3)
- **Database** (DynamoDB)
- **CDN** for global performance
- **Generous free tier**

## 📋 Free Tier Benefits

### AWS Amplify Free Tier
- **1,000 build minutes/month**
- **5GB storage for hosted apps**
- **15GB served per month**
- **Custom domains and SSL**

### AWS Services Included
- **Cognito**: 50,000 monthly active users
- **DynamoDB**: 25GB storage + 25 read/write units
- **S3**: 5GB storage + 20,000 GET requests
- **Lambda**: 1M requests/month
- **API Gateway**: 1M requests/month

## 🛠️ Required Changes for Amplify

### 1. Replace Express.js with Amplify Functions
Convert your Express routes to AWS Lambda functions:

```javascript
// amplify/backend/function/api/src/index.js
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
```

### 2. Replace PostgreSQL with DynamoDB
Update your database schema:

```javascript
// amplify/backend/api/marketplace/schema.graphql
type User @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  profileImageUrl: String
  listings: [Listing] @hasMany
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Category @model @auth(rules: [{ allow: public, operations: [read] }]) {
  id: ID!
  name: String!
  slug: String!
  listings: [Listing] @hasMany
}

type Listing @model @auth(rules: [{ allow: owner }, { allow: public, operations: [read] }]) {
  id: ID!
  title: String!
  description: String
  price: Float
  images: [String]
  category: Category @belongsTo
  user: User @belongsTo
  status: String!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Message @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  content: String!
  sender: User @belongsTo
  receiver: User @belongsTo
  listing: Listing @belongsTo
  createdAt: AWSDateTime!
}
```

### 3. Replace Replit Auth with AWS Cognito
Update authentication:

```javascript
// client/src/lib/auth.js
import { Auth } from 'aws-amplify';

export const signUp = async (email, password, attributes) => {
  try {
    const user = await Auth.signUp({
      username: email,
      password,
      attributes
    });
    return user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    return null;
  }
};
```

### 4. Replace File Upload with S3
Update file handling:

```javascript
// client/src/lib/storage.js
import { Storage } from 'aws-amplify';

export const uploadFile = async (file, key) => {
  try {
    const result = await Storage.put(key, file, {
      contentType: file.type,
      level: 'public'
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getFileUrl = async (key) => {
  try {
    const url = await Storage.get(key, { level: 'public' });
    return url;
  } catch (error) {
    throw error;
  }
};
```

## 📦 Required Dependencies

Add AWS Amplify packages:

```json
{
  "dependencies": {
    "aws-amplify": "^6.0.0",
    "@aws-amplify/ui-react": "^6.0.0",
    "aws-serverless-express": "^3.4.0"
  }
}
```

## 🔧 Step-by-Step Deployment

### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify Project
```bash
amplify init
# Follow prompts:
# - Project name: terranav-marketplace
# - Environment: dev
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: client/src
# - Build directory: dist
# - Build command: npm run build
# - Start command: npm run dev
```

### Step 3: Add Authentication
```bash
amplify add auth
# Choose:
# - Default configuration
# - Username
# - No, I am done
```

### Step 4: Add API (GraphQL)
```bash
amplify add api
# Choose:
# - GraphQL
# - Authorization types: Amazon Cognito User Pool
# - Additional authorization: No
# - Do you want to configure advanced settings: No
# - Do you have an annotated GraphQL schema: No
# - Do you want a guided schema creation: Yes
# - What best describes your project: Single object with fields
# - Do you want to edit the schema: Yes
```

### Step 5: Add Storage
```bash
amplify add storage
# Choose:
# - Content (Images, audio, video, etc.)
# - Resource name: marketplace-storage
# - Bucket name: (accept default)
# - Who should have access: Auth and guest users
# - What kind of access: create, read, update, delete
```

### Step 6: Add Hosting
```bash
amplify add hosting
# Choose:
# - Amazon CloudFront and S3
# - DEV (S3 only with HTTP)
```

### Step 7: Deploy
```bash
amplify push
# Review and confirm all resources
# Wait for deployment (5-10 minutes)
```

### Step 8: Publish
```bash
amplify publish
# Builds and deploys your app
```

## 🔄 Frontend Integration

### Update App.js
```javascript
// client/src/App.jsx
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);

function App() {
  return (
    <div className="App">
      {/* Your existing app components */}
    </div>
  );
}

export default withAuthenticator(App);
```

### Update API Calls
```javascript
// client/src/lib/api.js
import { API, graphqlOperation } from 'aws-amplify';

const listListings = /* GraphQL query */;
const createListing = /* GraphQL mutation */;

export const getListings = async () => {
  try {
    const result = await API.graphql(graphqlOperation(listListings));
    return result.data.listListings.items;
  } catch (error) {
    throw error;
  }
};

export const addListing = async (listing) => {
  try {
    const result = await API.graphql(graphqlOperation(createListing, { input: listing }));
    return result.data.createListing;
  } catch (error) {
    throw error;
  }
};
```

## 🔒 Security Features

### Built-in Security
- **Authentication**: AWS Cognito with MFA support
- **Authorization**: Fine-grained access control
- **Data encryption**: At rest and in transit
- **DDoS protection**: AWS Shield
- **WAF**: Web Application Firewall

### Custom Security Rules
```javascript
// amplify/backend/api/marketplace/schema.graphql
type Listing @model 
  @auth(rules: [
    { allow: owner, operations: [create, update, delete] }
    { allow: public, operations: [read] }
    { allow: groups, groups: ["admin"] }
  ]) {
  # Your fields here
}
```

## 📊 Monitoring and Analytics

### Built-in Monitoring
- **CloudWatch**: Performance metrics
- **X-Ray**: Request tracing
- **CloudFormation**: Infrastructure monitoring
- **Amplify Console**: Build and deployment logs

### Custom Analytics
```javascript
// Add to your components
import { Analytics } from 'aws-amplify';

Analytics.record({
  name: 'listingViewed',
  attributes: {
    category: 'Housing',
    price: 500
  }
});
```

## 💰 Cost Estimation

### Free Tier (First 12 months)
- **Hosting**: Up to 5GB and 15GB transfer
- **Authentication**: 50,000 monthly active users
- **Database**: 25GB storage
- **Storage**: 5GB
- **API calls**: 1M requests/month

### Beyond Free Tier
- **Hosting**: $0.15/GB stored, $0.023/GB transferred
- **Authentication**: $0.0055/monthly active user
- **Database**: $0.25/GB/month
- **Storage**: $0.023/GB/month
- **API calls**: $3.50/million requests

## 🚀 Deployment Timeline

### Initial Setup (2-3 hours)
1. **Install and configure Amplify CLI**: 30 minutes
2. **Initialize project**: 15 minutes
3. **Add services**: 1 hour
4. **Deploy backend**: 30 minutes
5. **Test services**: 30 minutes

### Code Migration (4-6 hours)
1. **Convert database schema**: 2 hours
2. **Update authentication**: 1 hour
3. **Migrate API calls**: 2 hours
4. **Update file uploads**: 1 hour

### Testing and Optimization (1-2 hours)
1. **Test all features**: 1 hour
2. **Performance optimization**: 30 minutes
3. **Security review**: 30 minutes

## 🎯 Advantages of Amplify

### vs Railway
- **Better scaling**: Automatic global scaling
- **More services**: Complete AWS ecosystem
- **Better security**: Enterprise-grade security
- **Real-time features**: Built-in subscriptions

### vs Vercel
- **Backend included**: No need for separate backend
- **Database**: DynamoDB included
- **Authentication**: Cognito included
- **File storage**: S3 included

### vs Netlify
- **Full-stack**: Backend services included
- **Real-time**: GraphQL subscriptions
- **Better scaling**: AWS infrastructure
- **More features**: Complete development platform

## 🔄 Migration Strategy

### Phase 1: Basic Setup (Week 1)
- Set up Amplify environment
- Configure authentication
- Create basic GraphQL schema
- Deploy frontend

### Phase 2: Core Features (Week 2)
- Migrate listings functionality
- Add file upload
- Implement messaging
- Test user flows

### Phase 3: Advanced Features (Week 3)
- Add real-time features
- Implement analytics
- Set up monitoring
- Performance optimization

### Phase 4: Production Ready (Week 4)
- Security audit
- Load testing
- Custom domain setup
- Go-live preparation

## 🛠️ Required Skills

### To Learn
- **GraphQL**: For API operations
- **DynamoDB**: NoSQL database concepts
- **AWS services**: Basic understanding
- **Amplify CLI**: Command-line operations

### Migration Complexity
- **Easy**: Frontend hosting
- **Medium**: Authentication migration
- **Complex**: Database schema conversion
- **Advanced**: Real-time features

## 📞 Support Resources

### AWS Support
- **Documentation**: Comprehensive guides
- **Community**: Stack Overflow, GitHub
- **Support tiers**: Basic (free) to Enterprise
- **Training**: AWS certification programs

### Amplify Resources
- **Discord**: Active community
- **GitHub**: Open source repository
- **YouTube**: Tutorial videos
- **Blog**: Regular updates and tutorials

## 🎯 Next Steps

1. **Review the migration requirements**
2. **Decide on migration timeline**
3. **Start with Amplify CLI setup**
4. **Create development environment**
5. **Begin database schema conversion**

**Ready to start your AWS Amplify migration?** The platform offers enterprise-grade features with a generous free tier, making it perfect for scaling your TerraNav marketplace.