# SkillMatch AI — Firestore Data Model

This document outlines the Cloud Firestore collection schema, field definitions, relationships, and indexing strategy as specified in Section 6 and Section 7 of `PLAN.md`.

---

## 1. Collections Overview

| Collection Name | Purpose | Access Control |
|-----------------|---------|----------------|
| `users` | User profile & authentication data | Owner read/update, Admin full |
| `resumes` | Resume PDF metadata & Cloud Storage reference | Owner read/write, Admin read |
| `skills` | Standard taxonomy of skills and aliases | Public read, Admin write |
| `userSkills` | Skills associated with a specific user | Owner read/write, Admin read |
| `education` | Educational history of a user | Owner read/write, Admin read |
| `experience` | Work & professional experience | Owner read/write, Admin read |
| `projects` | User portfolio projects | Owner read/write, Admin read |
| `jobs` | Job postings and requirements | Public read (active), Admin full |
| `jobSkills` | Relational join of jobs & required skills | Public read, Admin write |
| `applications` | Job applications submitted by users | Owner read/create, Admin read/update |
| `savedJobs` | Bookmarked jobs per user | Owner read/write |
| `resumeAnalysis` | AI-extracted structured resume info & score | Owner read/edit, Admin read |

---

## 2. Collection Schemas

### `users`
Document ID: Firebase Auth `uid`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  location?: string;
  bio?: string;
  preferredRoles?: string[];
  preferredLocations?: string[];
  preferredWorkMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### `resumes`
Document ID: Auto-generated UUID or Firestore ID
```typescript
interface Resume {
  id: string;
  userId: string;
  fileName: string;
  storagePath: string; // resumes/{userId}/{filename}
  fileSizeBytes: number;
  mimeType: string; // 'application/pdf'
  uploadedAt: FirebaseFirestore.Timestamp;
  parsed: boolean;
  active: boolean; // Current active resume for matching
}
```

### `skills`
Document ID: Slugified skill name (e.g., `react`, `spring-boot`, `python`)
```typescript
interface Skill {
  id: string;
  name: string; // "Spring Boot"
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI/ML' | 'Mobile' | 'Tools' | 'Soft Skills';
  aliases: string[]; // ["springboot", "spring-boot", "spring"]
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `userSkills`
Document ID: Auto-generated
```typescript
interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  name: string;
  category?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsExperience: number;
  verified: boolean; // Verified from parsed resume
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### `education`
Document ID: Auto-generated
```typescript
interface Education {
  id: string;
  userId: string;
  degree: string; // e.g. "B.S. Computer Science"
  institution: string; // e.g. "University of California, Berkeley"
  fieldOfStudy: string; // e.g. "Computer Science"
  startYear: number;
  endYear: number; // Or expected graduation
  gpa?: string;
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `experience`
Document ID: Auto-generated
```typescript
interface Experience {
  id: string;
  userId: string;
  company: string;
  title: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or null if current
  current: boolean;
  description: string;
  responsibilities: string[];
  technologiesUsed: string[];
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `projects`
Document ID: Auto-generated
```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  role?: string;
  createdAt: FirebaseFirestore.Timestamp;
}
```

### `jobs`
Document ID: Auto-generated
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  salaryMin: number;
  salaryMax: number;
  currency: string; // 'USD'
  experienceRequired: number; // Years, e.g. 2
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits?: string[];
  requiredSkills: string[]; // ["Java", "Spring Boot", "MySQL"]
  preferredSkills: string[]; // ["Docker", "AWS", "Kubernetes"]
  postedAt: FirebaseFirestore.Timestamp;
  deadline?: FirebaseFirestore.Timestamp;
  active: boolean;
  createdBy: string; // Admin uid
  applicantCount: number;
}
```

### `jobSkills`
Document ID: Auto-generated
```typescript
interface JobSkill {
  id: string;
  jobId: string;
  skillName: string;
  isRequired: boolean;
  weight: number; // e.g. 1.0 for required, 0.5 for preferred
}
```

### `applications`
Document ID: Auto-generated
```typescript
interface Application {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Selected' | 'Rejected';
  resumeId: string;
  matchScore?: number; // Match % computed at time of application
  appliedAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  notes?: string;
}
```

### `savedJobs`
Document ID: `${userId}_${jobId}`
```typescript
interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: FirebaseFirestore.Timestamp;
}
```

### `resumeAnalysis`
Document ID: Auto-generated (or `userId`)
```typescript
interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeId: string;
  personal_info: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    year: number | string;
    gpa?: string;
  }>;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
  }>;
  projects: Array<{
    name: string;
    tech: string[];
    description: string;
  }>;
  certifications: string[];
  experience_years: number;
  scoreBreakdown: {
    skillsScore: number;       // 0 - 100
    experienceScore: number;   // 0 - 100
    educationScore: number;    // 0 - 100
    projectsScore: number;     // 0 - 100
    completenessScore: number; // 0 - 100
    overallScore: number;      // 0 - 100
    reasons: string[];         // Explainable reasons for the breakdown
  };
  isEdited: boolean; // Flag if user manually corrected extraction
  analyzedAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
```
