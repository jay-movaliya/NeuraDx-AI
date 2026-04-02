# NeuraDx AI - Complete Setup Guide

## Project Overview
Medical Imaging AI Platform for tumor detection in MRI, and CT scans using YOLO model.

---

## Backend Setup (FastAPI + MongoDB + YOLO)

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Environment Configuration
The `.env` file is already configured with MongoDB connection:
```env
MONGODB_URL=mongodb+srv://hemanshutalaj_db_user:0l5Jd7FrQuNd7wOq@cluster0.w6mvswx.mongodb.net/?appName=Cluster0
DATABASE_NAME=neuradx_ai
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=neuradx-ai-secret-key-change-in-production
```

### 6. Run Backend Server
```bash
python main.py
```

Backend will run on: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

---

## Frontend Setup (React + Vite + Tailwind)

### 1. Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register radiologist
  ```json
  {
    "name": "Dr. Jhon Deo",
    "email": "jhondeo@gmail.com",
    "password": "jhon123",
    "hospital": "City Hospital"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "jhondeo@gmail.com",
    "password": "jhon123"
  }
  ```

- `POST /api/auth/logout` - Logout (requires token)

### Scans
- `POST /api/scans/upload` - Upload scan (requires token)
  - Form Data:
    - `file`: Image file
    - `patient_name`: Patient name
    - `patient_id`: Patient ID
    - `age`: Patient age
    - `gender`: Male/Female/Other
    - `contact_no`: Contact number
    - `email`: Patient email
    - `scan_type`: MRI/CT Scan

- `GET /api/scans` - Get all scans (requires token)
- `GET /api/scans/{scan_id}` - Get specific scan (requires token)
- `GET /api/scans/{scan_id}/report` - Download PDF report (requires token)

### Patients
- `GET /api/patients` - Get all patients (requires token)
- `GET /api/patients/{patient_id}` - Get patient details (requires token)

### Dashboard
- `GET /api/dashboard/stats` - Get statistics (requires token)

---

## Frontend Pages

### 1. Home Page (`/`)
- Landing page with features
- Links to login/register

### 2. Register Page (`/register`)
- Register new radiologist
- Fields: name, email, password, hospital

### 3. Login Page (`/login`)
- Login with email and password
- Saves JWT token

### 4. Dashboard (`/dashboard`)
- Overview statistics
- Recent scans table
- Quick actions
- Requires authentication

### 5. Upload Scan (`/upload`)
- 3-step wizard:
  1. Patient information
  2. Upload scan image
  3. View AI analysis results
- Requires authentication

---

## Project Structure

### Backend
```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── best (1).pt            # YOLO model weights
│
└── app/
    ├── core/              # Core functionality
    │   ├── config.py      # Settings
    │   ├── database.py    # MongoDB connection
    │   └── security.py    # JWT authentication
    │
    ├── models/            # Pydantic models
    │   ├── user.py
    │   ├── scan.py
    │   └── dashboard.py
    │
    ├── routes/            # API endpoints
    │   ├── auth.py
    │   ├── scans.py
    │   ├── reports.py
    │   ├── patients.py
    │   └── dashboard.py
    │
    └── services/          # Business logic
        └── ai_model.py    # YOLO tumor detection
```

### Frontend
```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── UploadScanPage.jsx
│   │
│   ├── services/
│   │   └── api.js         # API integration
│   │
│   ├── App.jsx            # Routes
│   └── main.jsx           # Entry point
│
└── package.json
```

---

## Features

### ✅ Implemented
1. User authentication (register/login/logout)
2. JWT token-based security
3. Medical scan upload with patient details
4. YOLO-based tumor detection
5. Image validation (only medical scans accepted)
6. AI analysis with confidence scores
7. Clinical findings and recommendations
8. PDF report generation
9. Patient management
10. Dashboard statistics
11. MongoDB integration

### 🎯 Key Features
- **AI Model**: YOLO for tumor detection
- **Image Validation**: Rejects non-medical images
- **Security**: JWT authentication, HIPAA considerations
- **Reports**: Professional PDF reports
- **Database**: MongoDB for data persistence

---

## Testing the Application

### 1. Start Backend
```bash
cd backend
python main.py
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow
1. Go to http://localhost:5173
2. Click "Get Started" → Register
3. Fill in: Name, Email, Password, Hospital
4. Login with credentials
5. Dashboard loads with statistics
6. Click "Upload New Scan"
7. Fill patient information
8. Upload medical scan image
9. View AI analysis results
10. Download PDF report

---

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change `API_PORT` in `.env`
- **MongoDB connection**: Check internet connection
- **Module not found**: Run `pip install -r requirements.txt`

### Frontend Issues
- **Port 5173 in use**: Vite will auto-assign new port
- **API connection error**: Ensure backend is running on port 8000
- **Token expired**: Login again

---

## Production Deployment

### Backend
1. Set `DEBUG=False` in `.env`
2. Change `SECRET_KEY` to secure random string
3. Use proper HTTPS
4. Deploy with Gunicorn:
```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
1. Build for production:
```bash
npm run build
```
2. Deploy `dist` folder to hosting service
3. Update API base URL in `src/services/api.js`

---

## Technologies Used

### Backend
- FastAPI
- MongoDB (Motor)
- PyJWT
- Ultralytics YOLO
- ReportLab (PDF generation)
- OpenCV
- NumPy

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

---

## Support

For issues or questions:
1. Check API docs: http://localhost:8000/docs
2. Review error messages in browser console
3. Check backend logs in terminal

---

**Project Status**: ✅ Ready for Testing
**Last Updated**: March 28, 2024
