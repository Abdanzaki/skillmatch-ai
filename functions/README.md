# SkillMatch AI — Cloud Functions (Python 2nd Gen)

This directory contains the Python Cloud Functions backend powering resume parsing, entity extraction, explainable scoring, and job matching for SkillMatch AI.

## Architecture & Runtime

- **Runtime**: Python 3.12 (Firebase Functions 2nd Gen)
- **SDK**: `firebase-functions` (v2), `firebase-admin`
- **Text Extraction**: `pypdf`
- **Storage**: `google-cloud-storage`

---

## Callable Functions

### `parseResume`
- **Trigger**: HTTPS Callable (`on_call`)
- **Input Payload**:
  ```json
  {
    "storagePath": "resumes/USER_UID/Resume.pdf",
    "resumeId": "resume_12345",
    "userId": "USER_UID"
  }
  ```
- **Operations**:
  1. Downloads PDF binary stream from Firebase Cloud Storage.
  2. Extracts raw text across pages using `pypdf`.
  3. Extracts entities using regex and a curated vocabulary:
     - `personal_info` (name, email, phone, location, LinkedIn, GitHub)
     - `skills` (normalized against standard tech vocabulary)
     - `education` (degrees, universities, fields, years, GPAs)
     - `experience` (companies, roles, durations, responsibilities)
     - `projects` (titles, tech stacks, descriptions)
     - `certifications` (AWS, Oracle, etc.)
     - `experience_years` (estimated years of experience)
  4. Generates an explainable 5-dimension score breakdown (`skillsScore`, `experienceScore`, `educationScore`, `projectsScore`, `completenessScore`, `overallScore`, and `reasons`).
  5. Persists the analysis to Firestore document `resumeAnalysis/analysis_{userId}` and updates `resumes/{resumeId}` with `parsed: true`.
- **Response**:
  ```json
  {
    "success": true,
    "analysisId": "analysis_USER_UID",
    "data": { ... }
  }
  ```

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
