import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

export default function JobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [userSkills, setUserSkills] = useState(['Java', 'Spring Boot', 'React', 'JavaScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3']);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [experienceFilter, setExperienceFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch user skills
        if (currentUser) {
          const userSkillsSnap = await getDocs(
            query(collection(db, 'userSkills'), where('userId', '==', currentUser.uid))
          );
          if (!userSkillsSnap.empty) {
            setUserSkills(userSkillsSnap.docs.map(d => d.data().name));
          }

          // Fetch saved jobs
          const savedSnap = await getDocs(
            query(collection(db, 'savedJobs'), where('userId', '==', currentUser.uid))
          );
          const savedSet = new Set(savedSnap.docs.map(d => d.data().jobId));
          setSavedJobIds(savedSet);
        }

        // 2. Fetch jobs from Firestore
        const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('active', '==', true)));
        const loadedJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setJobs(loadedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Compute deterministic match score:
  // 60% required skills overlap + 20% preferred skills overlap + 20% base/experience
  const calculateMatch = (job) => {
    const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));

    const reqSkills = job.requiredSkills || [];
    const prefSkills = job.preferredSkills || [];

    const matchedReq = reqSkills.filter(s => userSkillsLower.has(s.toLowerCase()));
    const missingReq = reqSkills.filter(s => !userSkillsLower.has(s.toLowerCase()));

    const matchedPref = prefSkills.filter(s => userSkillsLower.has(s.toLowerCase()));

    const reqScore = reqSkills.length > 0 ? (matchedReq.length / reqSkills.length) * 60 : 60;
    const prefScore = prefSkills.length > 0 ? (matchedPref.length / prefSkills.length) * 20 : 15;
    const expScore = 15; // Baseline experience / education fit

    const total = Math.min(100, Math.round(reqScore + prefScore + expScore));

    return {
      score: total,
      matched: [...matchedReq, ...matchedPref],
      missing: missingReq
    };
  };

  const toggleSaveJob = async (jobId) => {
    if (!currentUser) return;
    const isSaved = savedJobIds.has(jobId);
    const newSaved = new Set(savedJobIds);

    try {
      const saveDocId = `${currentUser.uid}_${jobId}`;
      if (isSaved) {
        newSaved.delete(jobId);
        await deleteDoc(doc(db, 'savedJobs', saveDocId));
      } else {
        newSaved.add(jobId);
        await setDoc(doc(db, 'savedJobs', saveDocId), {
          id: saveDocId,
          userId: currentUser.uid,
          jobId: jobId,
          savedAt: new Date()
        });
      }
      setSavedJobIds(newSaved);
    } catch (err) {
      console.error('Error updating saved job:', err);
    }
  };

  // Filtered and scored jobs
  const filteredJobs = jobs
    .map(job => ({ ...job, match: calculateMatch(job) }))
    .filter(job => {
      const matchSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchMode = workModeFilter === 'ALL' || job.workMode === workModeFilter;
      const matchExp = experienceFilter === 'ALL' ||
        (experienceFilter === 'ENTRY' && job.experienceRequired <= 1) ||
        (experienceFilter === 'MID' && job.experienceRequired >= 2 && job.experienceRequired <= 4) ||
        (experienceFilter === 'SENIOR' && job.experienceRequired >= 5);

      return matchSearch && matchMode && matchExp;
    })
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <div className="dashboard-layout">
      {currentUser && <Sidebar />}
      <main className="dashboard-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Tech Opportunities & Recommendations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Jobs ranked deterministically by compatibility with your verified skills.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ marginBottom: 28, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search title, tech, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
              <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            </div>

            <div>
              <select
                className="input-field"
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
              >
                <option value="ALL">All Work Modes</option>
                <option value="REMOTE">Remote Only</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <select
                className="input-field"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="ALL">All Experience Levels</option>
                <option value="ENTRY">Entry-Level (0-1 yrs)</option>
                <option value="MID">Mid-Level (2-4 yrs)</option>
                <option value="SENIOR">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner fullScreen message="Loading and scoring jobs..." />
        ) : filteredJobs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No jobs match your search filters</h3>
            <p style={{ marginTop: 8 }}>Try clearing filters or adjusting your search term.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredJobs.map(job => (
              <div key={job.id} className="glass-card glass-card-interactive" style={{ padding: 24 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 16
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                      <span className={`badge ${
                        job.workMode === 'REMOTE' ? 'badge-primary' :
                        job.workMode === 'HYBRID' ? 'badge-info' : 'badge-neutral'
                      }`}>
                        {job.workMode}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={14} /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  {/* Match Badge & Save Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={`match-score-badge ${
                      job.match.score >= 80 ? 'match-high' :
                      job.match.score >= 60 ? 'match-mid' : 'match-low'
                    }`}>
                      <Sparkles size={16} />
                      <span>{job.match.score}% Match</span>
                    </div>

                    {currentUser && (
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`btn ${savedJobIds.has(job.id) ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        title={savedJobIds.has(job.id) ? 'Saved' : 'Save Job'}
                      >
                        <Bookmark size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 18, lineHeight: 1.5 }}>
                  {job.description}
                </p>

                {/* Matched vs Missing Skills */}
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>Matched:</span>
                    {job.match.matched.slice(0, 5).map((s, i) => (
                      <span key={i} className="skill-tag matched" style={{ fontSize: '0.75rem' }}>
                        <Check size={12} /> {s}
                      </span>
                    ))}
                  </div>

                  {job.match.missing.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: '#fb7185', fontWeight: 600 }}>Missing:</span>
                      {job.match.missing.slice(0, 3).map((s, i) => (
                        <span key={i} className="skill-tag missing" style={{ fontSize: '0.75rem' }}>
                          <X size={12} /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                    View Match Breakdown & Apply
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
