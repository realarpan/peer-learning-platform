# Setup Guide for Peer Learning Platform

## Local Development Setup

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Redis installed

### Installation Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start MongoDB and Redis
5. Run development server: `npm run dev`

### Environment Variables

```
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
OPENAI_KEY=sk-...
JWT_SECRET=your_secret
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```
