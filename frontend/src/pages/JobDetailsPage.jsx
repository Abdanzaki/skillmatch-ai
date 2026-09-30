import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import MatchingExplainer from '../components/MatchingExplainer';
import { useAuth } from '../context/AuthContext';
import { matchJob } from '../services/functionsService';
import {
  getJobById,
  hasAppliedToJob,
  createApplication,
  getUserSavedJobs,
  saveJob,
  unsaveJob
} from '../services/firestoreService';
import {
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Cpu,
  GraduationCap,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showExplainer, setShowExplainer] = useState(false);

  useEffect(() => {
    async function loadJobAndMatch() {
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch Job and Match in parallel
        const [jobData, matchResult, applied, savedList] = await Promise.all([
          getJobById(id),
          matchJob({ userId: currentUser?.uid, jobId: id }).catch(err => {
            console.warn('matchJob error:', err);
            return null;
          }),
          currentUser ? hasAppliedToJob(currentUser.uid, id) : Promise.resolve(false),
          currentUser ? getUserSavedJobs(currentUser.uid) : Promise.resolve([])
        ]);

        if (jobData) {
          setJob(jobData);
        } else {
          setErrorMsg('Job posting not found.');
        }

        setMatchData(matchResult);
        setAlreadyApplied(applied);
        setIsSaved(savedList.some(s => s.jobId === id));
      } catch (err) {
        console.error('Error fetching job details or match:', err);
        setErrorMsg('Failed to load position information.');
      } finally {
        setLoading(false);
      }
    }

    loadJobAndMatch();
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
        matchScore: matchData?.score ?? 75
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

  const handleToggleSave = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await unsaveJob(currentUser.uid, id);
        setIsSaved(false);
      } else {
        await saveJob(currentUser.uid, id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        {currentUser && <Sidebar />}
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Evaluating career specifications and match scoring..." />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dashboard-layout">
        {currentUser && <Sidebar />}
        <main className="dashboard-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Position Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>The requested role may have been closed or removed.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 20 }}>
            Back to All Jobs
          </Link>
        </main>
      </div>
    );
  }

  // Match calculations
  const matchScore = matchData?.score ?? 75;
  const matchedSkills = matchData?.matched_skills || [];
  const missingSkills = matchData?.missing_skills || [];
  const scoreBreakdown = matchData?.scoreBreakdown || {
    requiredScore: 45,
    preferredScore: 15,
    experienceScore: 10,
    educationScore: 10,
    semanticSimilarity: 0.45
  };

  const scoreColor = matchScore >= 80 ? '#34d399' : matchScore >= 65 ? '#fbbf24' : '#fb7185';
  const scoreBg = matchScore >= 80 ? 'rgba(16, 185, 129, 0.12)' : matchScore >= 65 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  return (
    <div className="dashboard-layout">
      {currentUser && <Sidebar />}

      <main className="dashboard-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link
            to="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} />
            Back to all jobs
          </Link>

          <Link
            to="/jobs/recommended"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--accent-primary)',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <Sparkles size={15} />
            View Top Recommendations
          </Link>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {applySuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={20} />
            <span>Application submitted successfully! You can track hiring progress in My Applications.</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="glass-card" style={{ marginBottom: 28, padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>{job.title}</h1>
                <span className="badge badge-primary">{job.workMode}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={16} /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={16} /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={16} /> {job.experienceRequired}+ yrs exp
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Save Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                className={`btn btn-lg ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={18} color="var(--accent-primary)" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={18} />
                    <span>Save Job</span>
                  </>
                )}
              </button>

              {/* Apply Button */}
              {alreadyApplied ? (
                <button className="btn btn-secondary btn-lg" disabled style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="#10b981" />
                  Application Submitted
                </button>
              ) : (
                <button onClick={handleApply} disabled={applying} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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

        {/* Main Details & "Your Match" Panel Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: 28, alignItems: 'start' }}>
          {/* Left Column: Job Description & Responsibilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Role Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Key Responsibilities</h3>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Candidate Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Candidate Requirements</h3>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Explainer Accordion on page */}
            <div>
              <MatchingExplainer defaultOpen={false} />
            </div>
          </div>

          {/* Right Column: "Your Match" Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              className="glass-card"
              style={{
                background: 'linear-gradient(135deg, rgba(21, 27, 45, 0.95) 0%, rgba(30, 41, 68, 0.95) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.45)',
                padding: '24px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={16} />
                  <span>Your Match Analysis</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExplainer(!showExplainer)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.78rem'
                  }}
                >
                  <HelpCircle size={14} />
                  <span>How it works</span>
                </button>
              </div>

              {/* Match Score Display */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: scoreBg,
                  border: `1px solid ${scoreColor}40`,
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: scoreColor,
                    lineHeight: 1
                  }}
                >
                  {matchScore}%
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {matchScore >= 80 ? 'Strong Compatibility' : matchScore >= 65 ? 'Moderate Compatibility' : 'Potential Fit'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Evaluated across required skills, experience, and degree qualifications.
                  </div>
                </div>
              </div>

              {/* 4-Dimension Weighted Breakdown */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Algorithmic Score Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Required Skills (60%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Cpu size={12} color="var(--accent-primary)" /> Required Skills (60%)
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scoreBreakdown.requiredScore} / 60 pts</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${(scoreBreakdown.requiredScore / 60) * 100}%`, background: 'var(--accent-primary)' }}></div>
                    </div>
                  </div>

                  {/* Preferred Skills (20%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={12} color="#34d399" /> Preferred Skills (20%)
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scoreBreakdown.preferredScore} / 20 pts</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${(scoreBreakdown.preferredScore / 20) * 100}%`, background: '#34d399' }}></div>
                    </div>
                  </div>

                  {/* Experience Fit (10%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Briefcase size={12} color="#fbbf24" /> Experience Fit (10%)
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scoreBreakdown.experienceScore} / 10 pts</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${(scoreBreakdown.experienceScore / 10) * 100}%`, background: '#fbbf24' }}></div>
                    </div>
                  </div>

                  {/* Education Fit (10%) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <GraduationCap size={12} color="#a78bfa" /> Education Fit (10%)
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scoreBreakdown.educationScore} / 10 pts</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${(scoreBreakdown.educationScore / 10) * 100}%`, background: '#a78bfa' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Skills List */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={15} /> Matched Skills ({matchedSkills.length})
                </div>
                {matchedSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No direct skill overlaps detected.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchedSkills.map((s, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={12} /> {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills List */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fb7185', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={15} /> Missing Requirements ({missingSkills.length})
                </div>
                {missingSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>You possess all required technologies for this position!</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missingSkills.map((s, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(244, 63, 94, 0.12)',
                          color: '#fb7185',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          border: '1px solid rgba(244, 63, 94, 0.25)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Explanation Quote */}
              {matchData?.explanation && (
                <div
                  style={{
                    background: 'rgba(10, 14, 26, 0.5)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--accent-primary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    marginBottom: 20
                  }}
                >
                  {matchData.explanation}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/skill-gap" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Explore Skill Gap & Courses
                </Link>
              </div>

              {/* Non-Guarantee Notice */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                <strong>Transparency Note:</strong> Match scores are automated decision-support estimates and are never presented as a guarantee of hiring selection, interviews, or employment.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
