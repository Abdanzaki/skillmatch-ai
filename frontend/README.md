# SkillMatch AI — Frontend Application

Modern React single-page application for AI-powered resume analysis and deterministic job matching.

## Tech Stack

- **Framework**: React 18 + JavaScript (Vite bundler)
- **Routing**: React Router 6
- **Backend / BaaS**: Firebase Authentication, Cloud Firestore, Cloud Functions (2nd Gen Python)
- **PDF Extraction**: `pdfjs-dist` (In-browser client-side extraction — Storage-Free architecture)
- **UI & Styling**: Custom responsive CSS design system with glassmorphic styling and CSS variables (no generic Bootstrap)
- **Icons**: Lucide React
- **Deployment**: Vercel ready (`vercel.json` SPA rewrites)

---

## Architecture: Storage-Free Design

Firebase Storage is disabled on this project. Instead of uploading raw PDF binaries to Cloud Storage buckets:
1. The candidate selects a PDF resume ($\le 5\text{MB}$).
2. [`pdfService.js`](file:///home/hatch/workspace/skillmatch-ai/frontend/src/services/pdfService.js) extracts the document text entirely client-side using `pdfjs-dist`.
3. Extracted text is transmitted to the `parseResume` Python Cloud Function.
4. Python Cloud Function extracts entities and stores structured JSON directly in the `resumeAnalysis` collection in Cloud Firestore.
5. Zero raw-file bucket dependency or storage billing requirements.

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
│   │   └── config.js            # Firebase App, Auth, Firestore, Functions client initialization
│   ├── context/
│   │   └── AuthContext.jsx       # Email/password, Google sign-in, user profile, admin claims
│   ├── hooks/
│   │   └── useAuth.js           # Reusable hook accessing AuthContext
│   ├── services/
│   │   ├── firestoreService.js  # Clean abstraction across all 12 Firestore collections
│   │   ├── pdfService.js        # In-browser client-side PDF text extraction via pdfjs-dist
│   │   ├── storageService.js    # Storage-free client document processing adapter
│   │   └── functionsService.js  # Invokes parseResume Cloud Function with extracted text
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
│   │   ├── ResumeUploadPage.jsx # In-browser PDF extraction & processing
│   │   ├── ResumeAnalysisPage.jsx # Explainable score breakdown & editable extracted skills
│   │   ├── JobsPage.jsx         # Search, workMode/experience/salary/tech filters, match scores
│   │   ├── JobDetailsPage.jsx   # Position requirements & "Your Match" panel with apply action
│   │   ├── MyApplicationsPage.jsx # Status tracking (Applied, Under Review, Interview)
│   │   ├── SkillGapPage.jsx     # Missing skills & curated learning recommendations
│   │   ├── ProfilePage.jsx      # Candidate bio, target titles, work mode preferences
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx # System metrics, user directory, applications
│   │   │   └── AdminJobsPage.jsx      # Full CRUD for job postings (create, edit, delete, list)
│   │   └── NotFoundPage.jsx     # 404 fallback page
│   └── styles/
│       └── index.css            # Custom glassmorphic design system
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials (configured for `skillmatch-ai-abdan`):

```bash
VITE_FIREBASE_API_KEY=AIzaSyAaRIAqrVDbVY9TRzR9RpmN9H-iUwWezBI
VITE_FIREBASE_AUTH_DOMAIN=skillmatch-ai-abdan.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skillmatch-ai-abdan
VITE_FIREBASE_STORAGE_BUCKET=skillmatch-ai-abdan.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=305032069495
VITE_FIREBASE_APP_ID=1:305032069495:web:42dd22040b0e84c9382172

# Optional emulator support
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
VITE_FIRESTORE_EMULATOR_HOST=localhost
VITE_FIRESTORE_EMULATOR_PORT=8080

# Python Cloud Functions API
VITE_API_URL=http://127.0.0.1:5001/skillmatch-ai-abdan/us-central1
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
