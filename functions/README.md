# SkillMatch AI — Cloud Functions (Python 2nd Gen)

This directory contains the Python Cloud Functions backend powering resume entity parsing, explainable scoring, and job matching for SkillMatch AI.

## Architecture & Storage-Free Design

- **Runtime**: Python 3.12 (Firebase Functions 2nd Gen)
- **SDK**: `firebase-functions` (v2), `firebase-admin`
- **Storage-Free Architecture**: Resume PDFs are parsed directly in the web browser using `pdfjs-dist`. Extracted raw text is submitted via HTTPS Callable request, eliminating raw-file Cloud Storage bucket dependencies and credential costs.

---

## Callable Functions

### `parseResume`
- **Trigger**: HTTPS Callable (`on_call`)
- **Input Payload**:
  ```json
  {
    "text": "Clean extracted resume text from in-browser PDF parser...",
    "userId": "USER_UID",
    "fileName": "Resume.pdf",
    "fileSizeBytes": 245120,
    "resumeId": "resume_12345"
  }
  ```
- **Operations**:
  1. Accepts parsed text stream directly from client without Cloud Storage bucket latency or storage costs.
  2. Extracts entities using regex and a curated vocabulary:
     - `personal_info` (name, email, phone, location, LinkedIn, GitHub)
     - `skills` (normalized against standard tech vocabulary)
     - `education` (degrees, universities, fields, years, GPAs)
     - `experience` (companies, roles, durations, responsibilities)
     - `projects` (titles, tech stacks, descriptions)
     - `certifications` (AWS, Oracle, etc.)
     - `experience_years` (estimated years of experience)
  3. Generates an explainable 5-dimension score breakdown (`skillsScore`, `experienceScore`, `educationScore`, `projectsScore`, `completenessScore`, `overallScore`, and `reasons`).
  4. Persists the analysis to Firestore document `resumeAnalysis/analysis_{userId}` and updates `resumes/{resumeId}` with `parsed: true`.
- **Response**:
  ```json
  {
    "success": true,
    "analysisId": "analysis_USER_UID",
    "data": { ... }
  }
  ```

### `matchJobs`
- **Trigger**: HTTPS Callable (`on_call`)
- **Input Payload**:
  ```json
  {
    "userId": "USER_UID"
  }
  ```
- **Operations**:
  1. Reads candidate profile from `users/{userId}` and parsed resume from `resumeAnalysis/analysis_{userId}` via Firebase Admin SDK.
  2. Reads all active jobs from `jobs` collection.
  3. Evaluates deterministic explainable scoring per PLAN.md Section 8:
     - Skill normalization with alias map (e.g. `springboot` &rarr; `Spring Boot`)
     - Required skills overlap (60% weight)
     - Preferred skills overlap (20% weight)
     - Career experience tenure fit (10% weight)
     - Education & STEM degree alignment (10% weight)
     - TF-IDF cosine similarity refinement between resume text and job description
  4. Formulates explicit matched skills and missing skills lists with non-guarantee disclaimer.
  5. Returns matches sorted descending by `score`.

### `matchJob`
- **Trigger**: HTTPS Callable (`on_call`)
- **Input Payload**:
  ```json
  {
    "userId": "USER_UID",
    "jobId": "JOB_ID"
  }
  ```
- **Operations**:
  1. Computes single-job compatibility breakdown for the specified position.
  2. Returns `{ jobId, score, matched_skills, missing_skills, explanation, scoreBreakdown, matchedReq, missingReq, matchedPref, missingPref, disclaimer, job }`.

---

## Local Development & Emulators

To run Cloud Functions locally using Firebase CLI:

```bash
# 1. Ensure Python 3.12 is installed
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Start Firebase Functions Emulator
firebase emulators:start --only functions
```

---

## Verification

To verify Python syntax:
```bash
python3 -m py_compile functions/main.py
```
