import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MatchingExplainer from '../components/MatchingExplainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { matchJobs } from '../services/functionsService';
import {
  getUserSavedJobs,
  saveJob,
  unsaveJob,
  getUserApplications,
  createApplication
} from '../services/firestoreService';
import {
  Sparkles,
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  ArrowRight,
  Filter,
  Search,
  Check,
  AlertCircle,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export default function RecommendedJobsPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // User state
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0); // 0, 60, 75, 85
  const [workModeFilter, setWorkModeFilter] = useState('ALL');

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setErrorMsg('');

        // Parallelize recommendations and user states
        const [matchResults, savedList, applicationsList] = await Promise.all([
          matchJobs({ userId: currentUser?.uid }),
          currentUser ? getUserSavedJobs(currentUser.uid) : Promise.resolve([]),
          currentUser ? getUserApplications(currentUser.uid) : Promise.resolve([])
        ]);

        setMatches(matchResults || []);
        setSavedJobIds(new Set(savedList.map(s => s.jobId)));
        setAppliedJobIds(new Set(applicationsList.map(a => a.jobId)));
      } catch (err) {
        console.error('Failed to load job recommendations:', err);
        setErrorMsg('Failed to load personalized recommendations. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [currentUser]);

  // Handle Save / Unsave
  const handleToggleSave = async (jobId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const isSaved = savedJobIds.has(jobId);
    try {
      if (isSaved) {
        await unsaveJob(currentUser.uid, jobId);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await saveJob(currentUser.uid, jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  // Handle Quick Apply
  const handleApply = async (matchItem) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const { job, score } = matchItem;
    if (appliedJobIds.has(job.id)) return;

    try {
      setApplyingJobId(job.id);
      setErrorMsg('');

      await createApplication({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.displayName || currentUser.displayName || 'Candidate',
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: 'Applied',
        matchScore: score
      });

      setAppliedJobIds(prev => new Set(prev).add(job.id));
      setApplySuccessMsg(`Application submitted for ${job.title} at ${job.company}!`);
      setTimeout(() => setApplySuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error applying to job:', err);
      setErrorMsg('Failed to submit application. Please try again.');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Filtered Matches
  const filteredMatches = matches.filter(item => {
    const job = item.job || {};
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const titleMatch = (job.title || '').toLowerCase().includes(q);
      const companyMatch = (job.company || '').toLowerCase().includes(q);
      const skillMatch = (item.matched_skills || []).some(s => s.toLowerCase().includes(q));
      if (!titleMatch && !companyMatch && !skillMatch) return false;
    }
    // Min score filter
    if (item.score < minScoreFilter) return false;
    // Work mode filter
    if (workModeFilter !== 'ALL' && job.workMode !== workModeFilter) return false;

    return true;
  });

  return (
    <div className="dashboard-layout">
      {currentUser && <Sidebar />}

      <main className="dashboard-content">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}
              >
                <Sparkles size={18} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                Recommended Jobs
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              AI-ranked career opportunities based on verified skill overlap, experience fit, and semantic resume analysis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/jobs" className="btn btn-secondary">
              Browse All Jobs
            </Link>
            <Link to="/resume" className="btn btn-outline">
              Update Resume
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {applySuccessMsg && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <Check size={18} />
            <span>{applySuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Explainability Documentation Banner */}
        <MatchingExplainer defaultOpen={false} />

        {/* Filter Controls Bar */}
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search recommended by role, company, or skill..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
            </div>

            {/* Work Mode Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {['ALL', 'REMOTE', 'HYBRID', 'ON_SITE'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkModeFilter(mode)}
                  className={`btn btn-sm ${workModeFilter === mode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}
                >
                  {mode === 'ALL' ? 'All Modes' : mode.replace('_', ' ').toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Match Score Threshold Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <SlidersHorizontal size={15} />
              <span>Minimum Match %:</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'All Matches', value: 0 },
                { label: '60%+', value: 60 },
                { label: '75%+', value: 75 },
                { label: '85%+ High Fit', value: 85 }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMinScoreFilter(opt.value)}
                  className={`btn btn-sm ${minScoreFilter === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredMatches.length}</strong> of {matches.length} positions
            </div>
          </div>
        </div>

        {/* Content Loading State */}
        {loading ? (
          <LoadingSpinner fullScreen={false} message="Computing explainable match scores across active openings..." />
        ) : filteredMatches.length === 0 ? (
          /* Empty State */
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              border: '1px dashed var(--border-subtle)'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                marginBottom: 16
              }}
            >
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No Positions Match Your Current Filters</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px', fontSize: '0.9rem' }}>
              Try lowering the minimum match threshold or clearing the search terms to inspect more roles.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setMinScoreFilter(0);
                setWorkModeFilter('ALL');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {filteredMatches.map(item => {
              const job = item.job || {};
              const isSaved = savedJobIds.has(job.id);
              const isApplied = appliedJobIds.has(job.id);
              const isApplying = applyingJobId === job.id;

              // Color token for match score
              const scoreColor =
                item.score >= 80 ? '#34d399' : item.score >= 65 ? '#fbbf24' : '#fb7185';
              const scoreBg =
                item.score >= 80
                  ? 'rgba(16, 185, 129, 0.12)'
                  : item.score >= 65
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(244, 63, 94, 0.12)';
              const scoreBorder =
                item.score >= 80
                  ? 'rgba(16, 185, 129, 0.3)'
                  : item.score >= 65
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(244, 63, 94, 0.3)';

              return (
                <div
                  key={item.jobId}
                  className="glass-card"
                  style={{
                    position: 'relative',
                    transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                    <div>
                      {/* Job Title & Mode */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                        <Link
                          to={`/jobs/${job.id}`}
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                          {job.title}
                        </Link>
                        <span className="badge badge-primary">{job.workMode}</span>
                      </div>

                      {/* Meta items */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--text-secondary)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={15} /> {job.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DollarSign size={15} /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={15} /> {job.experienceRequired}+ yrs exp
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: scoreBg,
                        border: `1px solid ${scoreBorder}`
                      }}
                    >
                      <Sparkles size={20} color={scoreColor} />
                      <div>
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: scoreColor, lineHeight: 1 }}>
                          {item.score}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Compatibility
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job snippet description */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 18 }}>
                    {job.description ? `${job.description.slice(0, 190)}...` : 'Exciting career opportunity matching your qualifications.'}
                  </p>

                  {/* Skills Grid: Matched vs Missing */}
                  <div
                    style={{
                      background: 'rgba(10, 14, 26, 0.5)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: 20
                    }}
                  >
                    {/* Matched Skills */}
                    <div style={{ marginBottom: (item.missing_skills || []).length > 0 ? 12 : 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} />
                        <span>Matched Skills ({item.matched_skills?.length || 0}):</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(item.matched_skills || []).map((skill, idx) => (
                          <span
                            key={idx}
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
                            <Check size={12} /> {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {(item.missing_skills || []).length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fb7185', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <XCircle size={14} />
                          <span>Missing Requirements ({item.missing_skills.length}):</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {item.missing_skills.map((skill, idx) => (
                            <span
                              key={idx}
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
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Info size={14} />
                      <span>{item.scoreBreakdown ? `Req: ${item.scoreBreakdown.requiredScore}/60 • Pref: ${item.scoreBreakdown.preferredScore}/20 • Exp: ${item.scoreBreakdown.experienceScore}/10` : 'Algorithmic estimate'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Save Job Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(job.id)}
                        className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-ghost'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        title={isSaved ? 'Remove from saved' : 'Save position'}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck size={16} color="var(--accent-primary)" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark size={16} />
                            <span>Save</span>
                          </>
                        )}
                      </button>

                      {/* View Details Link */}
                      <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
                        View Role
                        <ArrowRight size={14} />
                      </Link>

                      {/* Apply Button */}
                      {isApplied ? (
                        <button type="button" className="btn btn-secondary btn-sm" disabled style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} color="#34d399" />
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApply(item)}
                          disabled={isApplying}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          {isApplying ? (
                            <span className="spinner" style={{ width: 14, height: 14 }}></span>
                          ) : (
                            <>
                              <Send size={14} />
                              <span>Apply</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
