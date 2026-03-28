# NeuraDx AI - Medical Imaging Platform

Complete medical imaging platform with AI-powered tumor detection for radiologists. Features include user authentication, patient management, image upload, AI analysis, and professional report generation.

## Features

### 🔐 Authentication
- User login and registration
- Protected routes
- Session management

### 👥 Patient Management
- Patient information forms
- Patient records database
- Search and filter patients
- Medical history tracking

### 📤 Image Upload & Analysis
- Drag & drop interface
- Multi-step workflow (Patient Info → Upload → Results)
- Real-time AI processing
- Support for X-Ray, MRI, CT Scan, Ultrasound

### 📊 AI Analysis
- Tumor detection with confidence scores
- Multiple region highlighting
- Severity classification
- Interactive results viewer

### 📄 Report Generation
- Professional medical reports
- PDF download functionality
- Print-ready format
- Comprehensive patient and scan information
- AI analysis results with recommendations

### 🎨 UI/UX
- Modern gradient design
- Smooth animations (Framer Motion)
- Responsive layout
- Professional color scheme (#3A8BFF, #4B83F6, #F6F6F6)
- Intuitive navigation

## Pages

1. **Login Page** (`/login`) - User authentication
2. **Register Page** (`/register`) - New user registration
3. **Dashboard** (`/dashboard`) - Overview with stats and recent scans
4. **Upload Page** (`/upload`) - 3-step process for new scans
5. **Report Page** (`/report`) - Detailed medical report with PDF export
6. **Patients Page** (`/patients`) - Patient records management

## Tech Stack

- React 19
- React Router DOM (routing)
- Vite (build tool)
- Tailwind CSS 4 (styling)
- Framer Motion (animations)
- React Dropzone (file upload)
- Lucide React (icons)
- jsPDF + html2canvas (PDF generation)
- Axios (API calls)

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── ImageUploader.jsx
│   ├── ResultsViewer.jsx
│   ├── FeatureCards.jsx
│   └── LoadingSpinner.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── UploadPage.jsx
│   ├── ReportPage.jsx
│   ├── PatientsPage.jsx
│   └── HomePage.jsx
├── hooks/
│   └── useImageAnalysis.js
├── utils/
│   └── api.js
├── App.jsx
└── index.css
```

## Color Theme

- Primary Blue: `#3A8BFF` - Main actions, branding
- Accent Blue: `#4B83F6` - Hover states, secondary actions
- White: `#FFFFFF` - Content areas, cards
- Light Gray: `#F6F6F6` - Background

## User Flow

1. **Login/Register** → User authentication
2. **Dashboard** → View stats and recent activity
3. **Upload New Scan**:
   - Step 1: Enter patient information
   - Step 2: Upload medical image
   - Step 3: View AI analysis results
4. **Generate Report** → Create professional PDF report
5. **Manage Patients** → View and search patient records

## API Integration

Currently using mock data. To integrate with backend:

1. Update `VITE_API_URL` in `.env`
2. Replace mock functions in `src/utils/api.js`:

```javascript
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.post(`${API_BASE_URL}/analyze`, formData);
  return response.data;
};
```

Expected API endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/analyze` - Image analysis
- `GET /api/patients` - Get patients list
- `POST /api/patients` - Create patient

## Report Generation

Reports include:
- Patient information
- Scan details
- AI analysis results with confidence scores
- Detection table with severity levels
- Analyzed image
- Recommendations
- Professional disclaimer

Export options:
- Download as PDF
- Print directly

## Security

- Protected routes with authentication check
- LocalStorage for session management
- Form validation
- Secure file upload

## Best Practices

- Component-based architecture
- Custom hooks for state management
- Responsive design
- Accessibility considerations
- Print-optimized reports
- Smooth animations for better UX

## Future Enhancements

- [ ] Backend API integration
- [ ] Real AI model integration
- [ ] User profile management
- [ ] Advanced patient search
- [ ] Scan history timeline
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email report delivery
- [ ] DICOM format support
- [ ] Image zoom/pan controls

## License

For research and clinical decision support purposes.

© 2024 NeuraDx AI
