# Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+
- MongoDB Atlas or local MongoDB
- OpenAI API key
- Vercel account (for frontend)

### Backend Deployment (Heroku/Railway)

1. **Prepare for deployment**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel)

1. **Connect GitHub repository**
   - Import project in Vercel dashboard

2. **Configure environment variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.com
   ```

3. **Deploy**
   - Push to main branch (automatic)

## Docker Deployment

```bash
docker build -t peer-learning-platform .
docker run -p 3000:3000 peer-learning-platform
```

## Monitoring

- Use Sentry for error tracking
- Monitor with DataDog or New Relic
- Set up log aggregation with ELK stack

## Health Checks

Endpoint: `GET /api/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T10:00:00Z",
  "database": "connected"
}
```
