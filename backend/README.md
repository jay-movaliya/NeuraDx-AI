# NeuraDx AI Backend

FastAPI backend with MongoDB for the NeuraDx AI Medical Imaging Platform.

## Features

- ✅ FastAPI REST API
- ✅ MongoDB database integration
- ✅ JWT authentication
- ✅ YOLO-based tumor detection
- ✅ Image upload and analysis
- ✅ User management
- ✅ Scan history
- ✅ Dashboard statistics

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

The `.env` file is already configured with your MongoDB connection.

### 5. Run Server

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── config.py            # Configuration settings
├── database.py          # MongoDB connection
├── models.py            # Pydantic models
├── auth.py              # Authentication utilities
├── model.py             # YOLO tumor detection
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── best (1).pt          # YOLO model weights
└── uploads/             # Uploaded images
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Scans
- `POST /api/scans/upload` - Upload and analyze scan (requires auth)
- `GET /api/scans` - Get all user scans (requires auth)
- `GET /api/scans/{scan_id}` - Get specific scan (requires auth)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (requires auth)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## MongoDB Collections

- **users** - User accounts
- **scans** - Medical scan analyses
- **patients** - Patient records
- **reports** - Generated reports

## Environment Variables

See `.env` file for all configuration options.

## Development

The API runs in debug mode by default with auto-reload enabled.

## Production Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Change `SECRET_KEY` to a secure random string
3. Use proper HTTPS
4. Set up proper CORS origins
5. Use Gunicorn with Uvicorn workers:

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
