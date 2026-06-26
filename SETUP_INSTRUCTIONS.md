# InsightX Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v20.19+ or v22.12+)
- **Python** (3.8+)
- **MongoDB** (Community Edition)

### 1. Install MongoDB

#### Windows:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# from the backend folder
py -3.13 -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# Install Python dependencies
python -m pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload
```

The startup script will:
- ✅ Check MongoDB connection
- ✅ Start MongoDB if needed
- ✅ Launch FastAPI server on http://127.0.0.1:8000

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 4. Verify Setup

1. **Backend Health Check**: Visit http://127.0.0.1:8000/health
2. **Database Check**: Visit http://127.0.0.1:8000/health/db
3. **Frontend**: Visit http://localhost:5173

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoDB connection failed`

**Solutions**:
1. **Check if MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is listening**:
   ```bash
   netstat -an | grep 27017
   ```

3. **Check MongoDB logs**:
   - Windows: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
   - macOS: `/usr/local/var/log/mongodb/mongo.log`
   - Linux: `/var/log/mongodb/mongod.log`

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Ensure backend is running on `127.0.0.1:8000` and frontend on `localhost:5173`

### Port Conflicts

**Backend Port 8000 in use**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000
# Kill the process (Windows)
taskkill /PID <PID> /F
```

**Frontend Port 5173 in use**:
```bash
# Vite will automatically use next available port
npm run dev
```

### Authentication Issues

**Error**: `Invalid email or password`

**Solutions**:
1. Check MongoDB is running and accessible
2. Verify user exists in database:
   ```javascript
   // In MongoDB Compass or shell
   db.users.find({})
   ```
3. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

## 📊 Database Structure

The application creates these MongoDB collections:
- `users` - User accounts
- `datasets` - Dataset metadata
- `analytics_cache` - Cached analytics results

## 🔐 Default Test User

For testing, you can create a user through the signup page or manually:

**Email**: `test@insightx.com`
**Password**: `password123`

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Datasets
- `GET /datasets/user` - Get user's datasets
- `POST /datasets/upload` - Upload new dataset
- `GET /datasets/{id}/preview` - Get data preview

### Analytics
- `GET /analytics/{id}/summary` - Get analytics summary

### Health Checks
- `GET /health` - API health check
- `GET /health/db` - Database health check

## 🚀 Production Deployment

### Backend (Railway/Heroku)
1. Set environment variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
   MONGO_DB_NAME=InsightX
   ```

2. Deploy with:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend (Vercel/Netlify)
1. Update API base URL in `frontend/src/api/api.js`:
   ```javascript
   baseURL: "https://your-backend-url.com"
   ```

2. Build and deploy:
   ```bash
   npm run build
   ```

## 📝 Development Notes

- Backend uses FastAPI with automatic OpenAPI docs at `/docs`
- Frontend uses Vite for fast development and building
- MongoDB stores all data with automatic indexing
- JWT tokens for authentication with 60-minute expiration
- CORS configured for local development

## 🆘 Need Help?

1. Check the console for error messages
2. Verify all services are running
3. Check network connectivity
4. Review the logs in both frontend and backend

**Common Issues**:
- MongoDB not started → Run `net start MongoDB`
- Wrong Node.js version → Upgrade to v20.19+
- Port conflicts → Use different ports
- CORS errors → Check backend URL in frontend