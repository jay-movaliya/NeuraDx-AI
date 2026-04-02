# NeuraDx-AI

AI-assisted medical imaging platform for radiologists:
- upload scans (MRI/CT/X-ray-style images)
- run YOLO-based tumor detection
- generate a PDF report (and optionally email it)
- store scan/report data in MongoDB

## Architecture

- `frontend/` - React + Vite UI (login, dashboard, upload, reports, patients)
- `backend/` - FastAPI API (JWT auth, MongoDB, YOLO inference, PDF generation, email sending)

## Prerequisites

- MongoDB
- Python 3.13+
- Node.js 18+ (for the frontend)
- (Optional) SMTP credentials (only needed if you use the email endpoints)

## Configure Environment Variables

### Backend (`backend/.env`)

The backend loads settings from `backend/app/core/config.py`. At minimum, set:

- `MONGODB_URL`
- `SECRET_KEY`
- `API_HOST` (default: `0.0.0.0`)
- `API_PORT` (default: `8000`)
- `MODEL_PATH` (default: `best (1).pt`)
- `CONFIDENCE_THRESHOLD` (default: `0.25`)
- `MAX_FILE_SIZE` (default: `10485760` = 10MB)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`

### Frontend (`frontend/.env`)

- `VITE_API_URL` - base URL for the API, typically `http://localhost:8000/api`

## Getting Started

### 1) Start the backend

From repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

Notes:
- If you see import errors and `backend/requirements.txt` is empty in your checkout, install the required Python packages manually or update `backend/requirements.txt` based on the imports used in `backend/app/` (FastAPI, Uvicorn, Motor, PyJWT, bcrypt, NumPy, OpenCV, Pillow, Ultralytics, etc.).

Backend URLs:
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Root: `http://localhost:8000/`

### 2) Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

## API Endpoints (high-level)

Protected endpoints require a Bearer token:
`Authorization: Bearer <token>`

- Authentication (`/api/auth`)
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

- Scans (`/api/scans`)
  - `POST /api/scans/upload` (multipart form: `file` + patient fields)
  - `GET /api/scans`
  - `GET /api/scans/{scan_id}`
  - `GET /api/scans/{scan_id}/report` (PDF download)
  - `POST /api/scans/{scan_id}/email` (email report)

- Patients (`/api/patients`)
  - `GET /api/patients`
  - `GET /api/patients/{patient_id}`

- Dashboard (`/api/dashboard`)
  - `GET /api/dashboard/stats`

## Disclaimer

This project is for research and clinical decision support purposes only.
It does not provide a medical diagnosis. Always consult a qualified medical professional.

## License

No license file was found in this repository snapshot. If you plan to publish or share this code, add an appropriate license.