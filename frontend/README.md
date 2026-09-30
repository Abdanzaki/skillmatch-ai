# SkillMatch AI — Frontend Application

Modern React single-page application for AI-powered resume analysis and deterministic job matching.

## Tech Stack

- **Framework**: React 18 + JavaScript (Vite bundler)
- **Routing**: React Router 6
- **Backend / BaaS**: Firebase Authentication, Cloud Firestore, Cloud Storage
- **UI & Styling**: Custom responsive CSS design system with glassmorphic styling and CSS variables (no generic Bootstrap)
- **Icons**: Lucide React
- **Deployment**: Vercel ready (`vercel.json` SPA rewrites)

---

## Directory Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── .env
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── firebase/
│   │   └── config.js            # Firebase App, Auth, Firestore, Storage client initialization
│   ├── context/
│   │   └── AuthContext.jsx       # Email/password, Google sign-in, user profile, admin claims
│   ├── hooks/
│   │   └── useAuth.js           # Reusable hook accessing AuthContext
│   ├── components/
│   │   ├── Navbar.jsx           # Global header with responsive mobile drawer & user badge
│   │   ├── Sidebar.jsx          # Dashboard navigation (candidate & admin sections)
│   │   ├── Footer.jsx           # Platform footer & algorithm transparency info
│   │   ├── ProtectedRoute.jsx   # Route guard enforcing authenticated sessions
│   │   ├── AdminRoute.jsx       # Route guard enforcing admin claims / admin role
│   │   └── LoadingSpinner.jsx   # Uniform loading state display
│   ├── pages/
│   │   ├── LandingPage.jsx      # Marketing hero, feature breakdown, algorithm formula
│   │   ├── LoginPage.jsx        # Email/password + Google auth + test credentials
│   │   ├── RegisterPage.jsx     # Candidate registration + Firestore user doc sync
│   │   ├── ForgotPasswordPage.jsx # Password recovery
│   │   ├── UserDashboardPage.jsx# Stats cards, top skills progress bars, recent activity
│   │   ├── ResumeUploadPage.jsx # Drag-and-drop PDF upload with type/size validation
│   │   ├── ResumeAnalysisPage.jsx # Explainable score breakdown & editable extracted skills
│   │   ├── JobsPage.jsx         # Search, workMode/experience filters, real-time match scores
│   │   ├── JobDetailsPage.jsx   # Position requirements & "Your Match" panel with apply action
│   │   ├── MyApplicationsPage.jsx # Status tracking (Applied, Under Review, Interview)
│   │   ├── SkillGapPage.jsx     # Missing skills & curated learning recommendations
│   │   ├── ProfilePage.jsx      # Candidate bio, target titles, work mode preferences
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx # System metrics, user directory, applications
│   │   │   └── AdminJobsPage.jsx      # Job CRUD, active/archive toggle, creation modal
│   │   └── NotFoundPage.jsx     # 404 fallback page
│   └── styles/
│       └── index.css            # Custom glassmorphic design system
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional emulator support
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
VITE_FIRESTORE_EMULATOR_HOST=localhost
VITE_FIRESTORE_EMULATOR_PORT=8080
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost
VITE_FIREBASE_STORAGE_EMULATOR_PORT=9199

# Python Cloud Functions API
VITE_API_URL=http://127.0.0.1:5001/skillmatch-ai/us-central1
```

---

## Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview
```
