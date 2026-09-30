import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  getJobById,
  hasAppliedToJob,
  createApplication,
  getUserSkills
} from '../services/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(['Java', 'Spring Boot', 'React', 'JavaScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3']);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadJobDetails() {
      try {
        setLoading(true);
        const jobData = await getJobById(id);

        if (jobData) {
          setJob(jobData);
        } else {
          setErrorMsg('Job posting not found.');
        }

        if (currentUser) {
          const applied = await hasAppliedToJob(currentUser.uid, id);
          setAlreadyApplied(applied);

          const skillsList = await getUserSkills(currentUser.uid);
          if (skillsList.length > 0) {
            setUserSkills(skillsList.map(d => d.name));
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setErrorMsg('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    }
    loadJobDetails();
  }, [id, currentUser]);

  const handleApply = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      setErrorMsg('');

      const applicationData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.displayName || currentUser.displayName || 'Candidate',
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: 'Applied',
        matchScore: matchInfo.score
      };

      await createApplication(applicationData);
      setAlreadyApplied(true);
      setApplySuccess(true);
    } catch (err) {
      console.error('Error applying for job:', err);
      setErrorMsg('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        {currentUser && <Sidebar />}
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Loading position specifics..." />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dashboard-layout">
        {currentUser && <Sidebar />}
        <main className="dashboard-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Job Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>The requested role may have been closed.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 20 }}>
            Back to Jobs
          </Link>
        </main>
      </div>
    );
  }

  // Calculate Match
  const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];

  const matchedReq = reqSkills.filter(s => userSkillsLower.has(s.toLowerCase()));
  const missingReq = reqSkills.filter(s => !userSkillsLower.has(s.toLowerCase()));
  const matchedPref = prefSkills.filter(s => userSkillsLower.has(s.toLowerCase()));

  const reqScore = reqSkills.length > 0 ? (matchedReq.length / reqSkills.length) * 60 : 60;
  const prefScore = prefSkills.length > 0 ? (matchedPref.length / prefSkills.length) * 20 : 15;
  const matchInfo = {
    score: Math.min(100, Math.round(reqScore + prefScore + 15)),
    matchedReq,
    missingReq,
    matchedPref
  };

  return (
    <div className="dashboard-layout">
      {currentUser && <Sidebar />}
      <main className="dashboard-content">
        <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', marginBottom: 20 }}>
          <ArrowLeft size={16} />
          Back to all jobs
        </Link>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {applySuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={20} />
            <span>Application submitted successfully! Track your status in My Applications.</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="glass-card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: '2rem' }}>{job.title}</h1>
                <span className="badge badge-primary">{job.workMode}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={16} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={16} /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={16} /> {job.experienceRequired}+ yrs exp</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {alreadyApplied ? (
                <button className="btn btn-secondary" disabled>
                  <CheckCircle size={16} color="#10b981" />
                  Application Submitted
                </button>
              ) : (
                <button onClick={handleApply} disabled={applying} className="btn btn-primary btn-lg">
                  {applying ? (
                    <span className="spinner" style={{ width: 18, height: 18 }}></span>
                  ) : (
                    <>
                      <Send size={18} />
                      Apply Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Details & "Your Match" Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {/* Job Overview & Responsibilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: 'span 2' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Role Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Key Responsibilities</h3>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && (
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Candidate Requirements</h3>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* "Your Match" Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, rgba(21, 27, 45, 0.9) 0%, rgba(30, 41, 68, 0.9) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-primary)', marginBottom: 12, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <Sparkles size={16} />
                <span>Your AI Match Breakdown</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: matchInfo.score >= 80 ? '#34d399' : matchInfo.score >= 60 ? '#fbbf24' : '#fb7185'
                }}>
                  {matchInfo.score}%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Calculated against your verified profile competencies
                </div>
              </div>

              {/* Matched Required Skills */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#34d399', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> Matched Skills ({matchInfo.matchedReq.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {matchInfo.matchedReq.map((s, i) => (
                    <span key={i} className="skill-tag matched">{s}</span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fb7185', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={14} /> Missing Skills ({matchInfo.missingReq.length})
                </div>
                {matchInfo.missingReq.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>You possess all required skills for this position!</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchInfo.missingReq.map((s, i) => (
                      <span key={i} className="skill-tag missing">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/skill-gap" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                View Learning Recommendations
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
