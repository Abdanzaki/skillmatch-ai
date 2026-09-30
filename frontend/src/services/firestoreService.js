import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// -------------------------------------------------------------
// USER PROFILES
// -------------------------------------------------------------

export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------------------
// RESUMES
// -------------------------------------------------------------

export async function createResumeRecord(data) {
  const resumeId = data.id || `resume_${Date.now()}`;
  const resumeRef = doc(db, 'resumes', resumeId);
  const payload = {
    id: resumeId,
    ...data,
    uploadedAt: serverTimestamp(),
    parsed: Boolean(data.parsed),
    active: true
  };
  await setDoc(resumeRef, payload, { merge: true });
  return payload;
}

export async function updateResumeRecord(resumeId, data) {
  const resumeRef = doc(db, 'resumes', resumeId);
  await updateDoc(resumeRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function getUserResumes(userId) {
  const q = query(collection(db, 'resumes'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------------------
// RESUME ANALYSIS
// -------------------------------------------------------------

export async function getResumeAnalysis(userId) {
  if (!userId) return null;
  const q = query(
    collection(db, 'resumeAnalysis'),
    where('userId', '==', userId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docData = snap.docs[0];
    return { id: docData.id, ...docData.data() };
  }
  return null;
}

export async function saveResumeAnalysis(analysisId, data) {
  const docRef = doc(db, 'resumeAnalysis', analysisId);
  const payload = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

export async function updateExtractedSkills(analysisId, skillsList) {
  const docRef = doc(db, 'resumeAnalysis', analysisId);
  await updateDoc(docRef, {
    skills: skillsList,
    isEdited: true,
    updatedAt: serverTimestamp()
  });
}

export async function updateResumeAnalysis(analysisId, data) {
  const docRef = doc(db, 'resumeAnalysis', analysisId);
  await updateDoc(docRef, {
    ...data,
    isEdited: true,
    updatedAt: serverTimestamp()
  });
}

// -------------------------------------------------------------
// USER SKILLS
// -------------------------------------------------------------

export async function getUserSkills(userId) {
  if (!userId) return [];
  const q = query(collection(db, 'userSkills'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveUserSkill(data) {
  const id = data.id || `${data.userId}_${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const ref = doc(db, 'userSkills', id);
  await setDoc(ref, {
    id,
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// -------------------------------------------------------------
// JOBS
// -------------------------------------------------------------

export async function getActiveJobs() {
  const q = query(collection(db, 'jobs'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllJobs() {
  const snap = await getDocs(collection(db, 'jobs'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getJobById(jobId) {
  const snap = await getDoc(doc(db, 'jobs', jobId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createJob(jobData) {
  const newId = jobData.id || `job-${Date.now()}`;
  const jobRef = doc(db, 'jobs', newId);
  const payload = {
    id: newId,
    ...jobData,
    postedAt: serverTimestamp(),
    applicantCount: 0
  };
  await setDoc(jobRef, payload);
  return payload;
}

export async function updateJob(jobId, data) {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(db, 'jobs', jobId));
}

// -------------------------------------------------------------
// APPLICATIONS
// -------------------------------------------------------------

export async function getUserApplications(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, 'applications'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllApplications() {
  const snap = await getDocs(collection(db, 'applications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function hasAppliedToJob(userId, jobId) {
  if (!userId || !jobId) return false;
  const q = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    where('jobId', '==', jobId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createApplication(applicationData) {
  const payload = {
    ...applicationData,
    status: applicationData.status || 'Applied',
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, 'applications'), payload);
  return { id: docRef.id, ...payload };
}

export async function updateApplicationStatus(applicationId, status) {
  const ref = doc(db, 'applications', applicationId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp()
  });
}

// -------------------------------------------------------------
// SAVED JOBS
// -------------------------------------------------------------

export async function getUserSavedJobs(userId) {
  if (!userId) return [];
  const q = query(collection(db, 'savedJobs'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveJob(userId, jobId) {
  const saveId = `${userId}_${jobId}`;
  await setDoc(doc(db, 'savedJobs', saveId), {
    id: saveId,
    userId,
    jobId,
    savedAt: serverTimestamp()
  });
}

export async function unsaveJob(userId, jobId) {
  const saveId = `${userId}_${jobId}`;
  await deleteDoc(doc(db, 'savedJobs', saveId));
}

// -------------------------------------------------------------
// ADMIN METRICS
// -------------------------------------------------------------

export async function getAdminDashboardMetrics() {
  const [users, jobs, applications] = await Promise.all([
    getAllUsers(),
    getAllJobs(),
    getAllApplications()
  ]);

  const activeJobs = jobs.filter(j => j.active !== false).length;

  return {
    totalUsers: users.length,
    totalJobs: jobs.length,
    activeJobs,
    totalApplications: applications.length,
    recentUsers: users.slice(0, 5),
    recentApplications: applications.slice(0, 5)
  };
}
