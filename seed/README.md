# SkillMatch AI — Database Seeder

This directory contains the Firebase Admin SDK seeder for initializing the SkillMatch AI Cloud Firestore and Firebase Authentication environments.

## Data Seeded

1. **Admin User**:
   - Email: `admin@skillmatch.ai`
   - Default Password: `admin123`
   - Role: `ADMIN` in `users` collection
   - Custom Claim: `{ admin: true }` set on Firebase Auth token

2. **Demo Candidate User**:
   - Email: `demo@skillmatch.ai`
   - Default Password: `demo123`
   - Role: `USER` in `users` collection
   - Profile: complete education, work experience, projects, skills, sample parsed resume & resume analysis.

3. **18 Realistic Jobs**:
   - Diverse roles (Java, Full Stack, Frontend, Python, AI/ML, DevOps, Data Analyst, QA, Security, Cloud Architect, etc.)
   - Experience levels, salary ranges, required and preferred skills, locations, work modes (Remote, Hybrid, On-site).
   - Linked to `jobSkills` relational records.

4. **Skills Taxonomy**:
   - Standard skills with categories (Backend, Frontend, AI/ML, DevOps, Database, Tools) and aliases for matching normalization.

5. **Sample Applications & Saved Jobs**:
   - Applications with statuses (`Applied`, `Under Review`, `Interview`).
   - Bookmarked saved jobs.

---

## How to Run

### Option 1: Against Firebase Local Emulators (Recommended for Dev)

Make sure Firebase Emulators are running:
```bash
firebase emulators:start
```

Then run:
```bash
npm run seed:emulator
```

Or manually:
```bash
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" GCLOUD_PROJECT="skillmatch-ai" node seed.js
```

### Option 2: Against Live Firebase Project

1. Generate a Firebase Service Account key:
   - Go to **Firebase Console** -> **Project Settings** -> **Service Accounts**.
   - Click **Generate new private key**.
   - Save the file as `seed/serviceAccountKey.json` (do not commit to git).
2. Run:
```bash
npm run seed
```
