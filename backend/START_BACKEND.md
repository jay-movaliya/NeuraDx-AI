# Backend Setup & Start Guide

## Prerequisites
- Python 3.13 installed
- MongoDB connection string configured in `.env`

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Verify Environment Variables
Check that `backend/.env` has:
- `MONGODB_URL` - Your MongoDB connection string
- `SECRET_KEY` - JWT secret key
- Other configuration values

### 3. Start the Backend Server
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Expected Output
```
✅ Connected to MongoDB successfully
✅ Model loaded successfully from best (1).pt
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## API Documentation
Once running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Common Issues

### Issue: "Cannot import name 'settings'"
**Solution**: Make sure you're in the `backend` directory when running the server.

### Issue: "email-validator is not installed"
**Solution**: Run `pip install pydantic[email]`

### Issue: "ValueError: password cannot be longer than 72 bytes"
**Solution**: Already fixed in `app/core/security.py` - passwords are now truncated to 72 bytes.

### Issue: CORS errors from frontend
**Solution**: Backend is configured to allow `http://localhost:5173` - make sure frontend is running on this port.

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john@hospital.com",
    "password": "password123",
    "hospital": "City Hospital"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@hospital.com",
    "password": "password123"
  }'
```

## Next Steps
1. Start the frontend: `cd frontend && npm run dev`
2. Open browser: http://localhost:5173
3. Register/Login and start uploading scans
