# SkillMatch AI

> **Your Skills. Our AI. Better Opportunities.**
> AI-Powered Resume Analyzer & Job Matching System for students, developers, and tech job seekers.

---

## 1. Overview & Flow

SkillMatch AI bridges the gap between candidate resumes and job postings through transparent, explainable machine intelligence:

1. **Sign Up & Profile Setup**: Register securely via Email/Password or Google Sign-In.
2. **Resume PDF Parsing (Storage-Free)**: Drag-and-drop resume PDFs in browser; text is extracted entirely client-side using `pdfjs-dist` (validated for file type and size <= 5MB) without needing any Cloud Storage bucket.
3. **AI Parsing & Extraction**: Python Cloud Function extracts structured personal info, education, skills, experience, and projects into editable JSON.
4. **Deterministic Transparent Matching**: Algorithmic scoring based on verified tech overlap (60% required skills, 20% preferred skills, 10% experience, 10% education) with clear matched vs missing skill indicators.
5. **Skill Gap Discovery**: Identify missing technologies and explore curated learning pathways.
6. **Direct Applications & Tracking**: Submit applications and monitor hiring stage progress (Applied, Under Review, Interview, Selected, Rejected).

---

## 2. Architecture

```
React (Vercel)
  ├── Firebase Auth (Email/Password, Google Sign-In, Custom Claims)
  ├── Cloud Firestore (Candidate profiles, standard skills taxonomy, jobs, applications)
  ├── Storage-Free In-Browser PDF Parser (pdfjs-dist, no Cloud Storage bucket required)
  └── Python Cloud Functions (2nd Gen):
       ├── parseResume  — extracts structured entities from resume text
       └── matchJobs    — scores profiles vs active jobs with TF-IDF similarity
```

---

## 3. Project Structure

```
skillmatch-ai/
├── frontend/                 # React 18 SPA (Vite + React Router 6 + Custom Modern CSS)
├── functions/                # Python Cloud Functions (2nd Gen callable parseResume)
├── seed/                     # Firebase Admin SDK seeder script
├── docs/
│   └── DATA_MODEL.md         # Firestore collection schemas & indexing specifications
├── firebase.json             # Firebase configuration (Firestore, Functions, Emulators; Storage-Free)
├── firestore.rules           # Cloud Firestore security rules with UID & admin claim checks
├── firestore.indexes.json    # Composite indexes for querying jobs and applications
├── storage.rules             # Cloud Storage security rules (retained for reference, undeployed)
├── vercel.json               # SPA routing rewrite rules for Vercel deployment
├── PLAN.md                   # Full master architecture and engineering plan
├── FIREBASE_SETUP.md         # Provisioned Firebase project details (skillmatch-ai-abdan)
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

---

## 4. Firestore Data Model

The database is structured across 12 collections defined in [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md):

- `users`: Candidate profiles and admin accounts
- `resumes`: Resume metadata records (Storage-Free, references extracted client-side)
- `skills`: Standard taxonomy of skills and search aliases
- `userSkills`: Skills associated with a specific candidate
- `education`: Educational history
- `experience`: Professional experience
- `projects`: Portfolio projects
- `jobs`: Job postings with required and preferred skills
- `jobSkills`: Relational index for job skill requirements
- `applications`: Applications submitted by candidates
- `savedJobs`: Candidate bookmarks
- `resumeAnalysis`: Extracted JSON entities, 5-dimension score breakdown, and explanations

---

## 5. Security & Roles

- **Candidate (Role: `USER`)**: Access restricted to their own user document, resumes, profile items, and applications.
- **Administrator (Role: `ADMIN`)**:
  - Enforced via Firebase Auth custom user claims (`request.auth.token.admin == true`) and synced via Firestore user documents.
  - Granted privileges to CRUD jobs, inspect applicant lists, and view platform metrics.

---

## 6. How Matching Works (Deterministic & Explainable)

SkillMatch AI eliminates black-box discrimination by calculating candidate compatibility scores using a transparent weighted formula:

$$\text{Match Score} = (0.60 \times \text{Required Skills Overlap}) + (0.20 \times \text{Preferred Skills Overlap}) + (0.10 \times \text{Experience Fit}) + (0.10 \times \text{Education Fit})$$

- **Normalized Skills**: Lowercased and mapped through an alias dictionary (e.g., `springboot` $\to$ `Spring Boot`).
- **Explainable Feedback**: Every job displays a breakdown of exact matched skills alongside missing skills.
- **Disclaimer**: Match scores are decision-support metrics and are never presented as guarantees of hiring success.

---

## 7. Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v24)
- Python 3.12+

### 1. Configure Environment Variables

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 2. Run Database Seeder

To seed 18 realistic jobs, standard skills taxonomy, demo candidate account (`demo@skillmatch.ai` / `demo123`), and admin account (`admin@skillmatch.ai` / `admin123` with `{ admin: true }` custom claim):

```bash
cd seed
npm install
npm run seed:emulator   # When using Firebase Local Emulators
# OR
npm run seed            # When using serviceAccountKey.json for live Firebase
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 8. Build & Verification

### Frontend Build
To verify that the frontend compiles cleanly and creates optimized Vite production chunks:

```bash
cd frontend
npm run build
```

### Cloud Functions Syntax & Bytecode Compilation
To verify Python Cloud Functions syntax and typing integrity:

```bash
python3 -m py_compile functions/main.py
```

### Seeder Dry Run
To validate data models and job generation without modifying Firestore:

```bash
cd seed
npm run seed:dry-run
```
