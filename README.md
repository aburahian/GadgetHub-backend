# Express Backend API

A simple Express.js backend providing REST API for item management with JWT authentication.

## 🚀 Features

- **REST API**: CRUD operations for items
- **Authentication**: JWT-based auth with cookies
- **CORS**: Configured for cross-origin requests
- **File Storage**: JSON-based data persistence

## 📦 Technologies

- Express.js
- CORS
- Cookie Parser
- JSON Web Token (JWT)
- Body Parser

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file:
   ```env
   PORT=5000
   NODE_ENV=production
   SECRET_KEY=your-secret-key
   FRONTEND_URL=https://your-frontend-url.com
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run production server:**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item (requires auth)

### Authentication
- `POST /api/login` - Login (username: admin, password: admin)
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user (requires auth)

### Health
- `GET /api/health` - Health check

## 🌐 Deployment (Render/Railway)

### Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Add environment variables
5. Deploy!

### Railway
1. Push code to GitHub
2. Create new project on Railway
3. Connect your repository
4. Add environment variables
5. Deploy!

## 📝 Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `SECRET_KEY` - JWT secret key
- `FRONTEND_URL` - Frontend URL for CORS

## ⚠️ Important Notes

- Data is stored in `data.json` file (not suitable for production at scale)
- For production, consider using a database (MongoDB, PostgreSQL, etc.)
- Update CORS settings with your actual frontend URL
