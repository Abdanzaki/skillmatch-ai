# SkillMatch AI — Build Plan (Firebase stack)

## 1. Goal
AI-Powered Resume Analyzer & Job Matching System for students/job seekers.
Flow: Sign up → Login → Complete profile → Upload resume (PDF) → AI analyzes resume →
skills/experience extracted → analysis displayed → recommended jobs → search/filter jobs →
open job → match % + matched/missing skills → apply → track in My Applications →
view Skill Gap + learning recommendations.

## 2. Tech stack (mandatory)
- Frontend: React + JavaScript + React Router + Axios/fetch + HTML5/CSS3, responsive,
  **award-winning modern UI** (custom CSS, NOT Bootstrap-looking). Desktop-first, works on mobile/tablet.
  Deployed on **Vercel**.
- Backend: **Firebase** —
  - Firebase Authentication (email/password + Google sign-in)
  - Cloud Firestore (database)
  - Cloud Storage for Firebase (resume PDFs)
  - Cloud Functions 2nd gen, **Python** runtime (resume parsing + job matching AI)
- File processing: PDF upload to Storage (validate type/size), extract text, send to AI function.
- No passwords stored by us — Firebase Auth handles credentials securely.

## 3. Architecture
```
React (Vercel)
  → Firebase Auth (login/register, ID tokens)
  → Cloud Firestore (all app data)
  → Cloud Storage (resume PDFs)
  → Python Cloud Functions:
       parseResume  — extracts structured info from resume text
       matchJobs    — scores user profile vs jobs, returns matched/missing skills
```
Repo layout: `/frontend`, `/functions` (python), `/firestore.rules`, `/storage.rules`,
`firebase.json`, seed script `/seed/seed.js` (Admin SDK), each area with README.
- All config (Firebase web config, function URLs) via environment variables.
- Firestore Security Rules + Storage Rules enforce user/admin access.

## 4. Roles
- USER (role field on user doc): register/login, upload resume, add/edit skills, view AI analysis,
  recommended jobs, search/filter jobs, job details, apply, save jobs, skill gaps, track applications, manage profile.
- ADMIN (custom claim `admin: true` set via seed script): login, CRUD jobs, view users,
  view applications, platform analytics dashboard. Admin routes + rules restricted to admins.

## 5. Pages (frontend, React Router)
1. Landing: logo "SkillMatch AI", tagline "Your Skills. Our AI. Better Opportunities.",
   buttons "Analyze My Resume" / "Find Jobs", Features, How it works, AI matching explanation,
   Login/Sign Up, footer.
2. Login: email, password, Login, Continue with Google, Forgot Password, link to Sign Up.
3. Register: full name, email, password, confirm password.
4. User Dashboard: stat cards (Resume Score %, Skills Found, Jobs Matched, Applications),
   Top Skills with bars (e.g. Java 90%), Recent Activity feed.
   Sidebar nav: Dashboard, My Resume, Jobs, Applications, Skill Gap, Profile, Settings, Logout.
5. Resume Upload: drag-and-drop PDF (DOC/DOCX if easy), shows "Resume uploaded successfully.",
   never expose storage paths.
6. Resume Analysis: personal info (name/email/phone), education (degree/college/field/year),
   skills, experience (company/position/duration/responsibilities), projects (name/tech/description),
   certifications. Editable when AI extraction is wrong.
7. Resume Score: explainable breakdown — Skills, Experience, Education, Projects, Completeness.
   Show reasons, NOT a guarantee of job success.
8. Jobs page: search by title/skill/company/location; filters: remote/hybrid/on-site, experience, salary, technology.
9. Recommended Jobs: sorted by match %, job cards with title/company/location/work mode/salary/match %,
   matched + missing skills, Apply + Save buttons.
10. Job Details: full description, required/preferred skills, "Your Match" panel
    (match %, matched skills, missing skills), Apply Now + Save Job.
11. My Applications: table/cards (Job, Company, Status, Applied Date).
    Statuses: Applied, Under Review, Interview, Selected, Rejected.
12. Skill Gap: your skills count vs required count, missing skills list, learning recommendations
    per skill (clearly labeled as recommendations, not guarantees).
13. Profile: name, email, phone, location, education, skills, experience, projects,
    certifications, preferred roles/locations/work mode. Editable.
14. Admin Dashboard: totals (users, jobs, applications, active jobs, applications this month),
    charts (applications over time, jobs by category, popular skills), job CRUD, user list, applications list.

## 6. API / Functions
Cloud Functions (Python, callable or HTTPS):
- POST /parseResume {storagePath} → {personal_info, education[], skills[], experience[], projects[], certifications[], experience_years} → saved to `resumeAnalysis` doc.
- POST /matchJobs {userId} → [{jobId, score, matched_skills[], missing_skills[], explanation}] sorted desc.
- POST /matchJob {userId, jobId} → single job breakdown.
- Admin: create/update/delete job via Admin SDK in functions OR direct Firestore writes with admin-only rules.
Firestore collections:
`users`, `resumes`, `skills`, `userSkills`, `education`, `experience`, `projects`,
`jobs`, `jobSkills`, `applications`, `savedJobs`, `resumeAnalysis`.

## 7. Job fields
title, company, location, workMode (REMOTE/HYBRID/ON_SITE), salaryMin, salaryMax,
experienceRequired, description, requiredSkills[], preferredSkills[], postedAt, deadline, active.

## 8. Matching algorithm (explainable — no fake AI)
Document in README + show in UI ("How matching works"):
1. Normalize skills (lowercase, alias map e.g. "springboot"→"Spring Boot").
2. Score = weighted: required-skill overlap (60%) + preferred-skill overlap (20%) +
   experience fit (10%) + education fit (10%).
3. Semantic similarity: Python function uses TF-IDF/cosine (and embeddings if available)
   between resume text and job description to refine; always show matched vs missing skills.
4. Never present the score as a guarantee.
Example: user {Java, Spring Boot, React, MySQL, Git} vs job {+Docker} → 83%,
matched ✓ list, missing ✗ Docker.

## 9. AI service (Python Cloud Functions)
- `parseResume`: download PDF from Storage → extract text (pdfminer/pypdf) →
  skill extraction via curated tech vocabulary + regex/NLP → structured JSON only.
- `matchJobs` / `matchJob`: deterministic scoring (section 8) + TF-IDF similarity.
- requirements.txt pinned; structured JSON responses only.

## 10. Seed data
15–20 realistic jobs (Java Developer, Backend Developer, Full Stack Developer,
Frontend Developer, Python Developer, Software Engineer, Data Analyst, AI/ML Engineer...),
one admin user (`admin@skillmatch.ai` / `admin123`, with admin custom claim),
one demo user, skills, sample applications. Seed via Admin SDK script.

## 11. Quality bars
- Frontend: organized api/service layer (no raw fetch in components), reusable components,
  protected routes (user/admin), loading/error/empty states, toasts, confirm dialogs.
- Functions: clean modules, input validation, error handling, no secrets in code.
- Security: Firestore + Storage rules (users access own data; admins manage jobs),
  file type/size validation on upload.
- Error handling: invalid login, duplicate email, invalid/oversized/unsupported resume,
  AI failure fallback, job not found, unauthorized, duplicate application — friendly messages.
- README: setup, env vars, architecture diagram, matching explanation, deploy steps.

## 12. Build order
1. Firebase project setup files (firebase.json, rules) + Firestore data model + seed script
2. Auth (email/password + Google) + protected routes + roles
3. Profile
4. Resume upload (Storage) + PDF text extraction
5. parseResume function + analysis display + editable corrections
6. Jobs CRUD + admin UI
7. Job search + filters
8. Matching (matchJob/matchJobs functions) + recommended jobs + job details match panel
9. NLP improvements in functions
10. Applications + tracking
11. Skill gap + recommendations
12. Dashboards + analytics + charts
13. Responsive + UI polish (award-winning look)
14. Build verification
15. Deployment docs (Vercel for frontend, Firebase for backend)

## 13. Deployment targets
- Frontend → Vercel (`vercel.json` with SPA rewrites). API config via env vars.
- Backend → Firebase: `firebase deploy` (functions, firestore rules, storage rules).
- Service account keys: created at deploy time, stored securely, never committed.
