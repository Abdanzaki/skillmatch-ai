import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  getActiveJobs,
  getUserSkills,
  getUserSavedJobs,
  saveJob,
  unsaveJob,
  getSkillsTaxonomy
} from '../services/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import MatchingExplainer from '../components/MatchingExplainer';
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
  X,
  RotateCcw,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

export default function JobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [userSkills, setUserSkills] = useState(['Java', 'Spring Boot', 'React', 'JavaScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3']);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [availableSkills, setAvailableSkills] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('ALL'); // 'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'
  const [experienceFilter, setExperienceFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'MID' | 'SENIOR'
  const [minSalaryFilter, setMinSalaryFilter] = useState(0); // 0, 80000, 100000, 120000, 140000, 160000
  const [selectedTech, setSelectedTech] = useState('ALL'); // 'ALL' or specific skill name
  const [sortBy, setSortBy] = useState('MATCH'); // 'MATCH' | 'SALARY' | 'DATE'

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch user skills & saved jobs via firestoreService
      if (currentUser) {
        const [skillsList, savedList] = await Promise.all([
          getUserSkills(currentUser.uid),
          getUserSavedJobs(currentUser.uid)
        ]);

        if (skillsList.length > 0) {
          setUserSkills(skillsList.map(s => s.name));
        }
        setSavedJobIds(new Set(savedList.map(s => s.jobId)));
      }

      // 2. Fetch active jobs via firestoreService
      const loadedJobs = await getActiveJobs();
      setJobs(loadedJobs);

      // 3. Extract all unique required & preferred skills for technology filter
      const techSet = new Set();
      loadedJobs.forEach(j => {
        (j.requiredSkills || []).forEach(s => techSet.add(s));
        (j.preferredSkills || []).forEach(s => techSet.add(s));
      });
      setAvailableSkills(Array.from(techSet).sort());
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setErrorMsg('Failed to load opportunities from Cloud Firestore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Deterministic Matching Score Formula:
  // 60% required skills overlap + 20% preferred skills overlap + 20% baseline experience fit
  const calculateMatch = (job) => {
    const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));

    const reqSkills = job.requiredSkills || [];
    const prefSkills = job.preferredSkills || [];

    const matchedReq = reqSkills.filter(s => userSkillsLower.has(s.toLowerCase()));
    const missingReq = reqSkills.filter(s => !userSkillsLower.has(s.toLowerCase()));
    const matchedPref = prefSkills.filter(s => userSkillsLower.has(s.toLowerCase()));

    const reqScore = reqSkills.length > 0 ? (matchedReq.length / reqSkills.length) * 60 : 60;
    const prefScore = prefSkills.length > 0 ? (matchedPref.length / prefSkills.length) * 20 : 15;
    const expScore = 15;

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
      if (isSaved) {
        newSaved.delete(jobId);
        await unsaveJob(currentUser.uid, jobId);
      } else {
        newSaved.add(jobId);
        await saveJob(currentUser.uid, jobId);
      }
      setSavedJobIds(newSaved);
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setWorkModeFilter('ALL');
    setExperienceFilter('ALL');
    setMinSalaryFilter(0);
    setSelectedTech('ALL');
    setSortBy('MATCH');
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .map(job => ({ ...job, match: calculateMatch(job) }))
    .filter(job => {
      // 1. Search Query: checks title, company, location, skills, and description
      const queryLower = searchTerm.trim().toLowerCase();
      const matchSearch =
        !queryLower ||
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.location.toLowerCase().includes(queryLower) ||
        (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(queryLower))) ||
        (job.preferredSkills && job.preferredSkills.some(s => s.toLowerCase().includes(queryLower))) ||
        (job.description && job.description.toLowerCase().includes(queryLower));

      // 2. Work Mode Filter
      const matchMode = workModeFilter === 'ALL' || job.workMode === workModeFilter;

      // 3. Experience Level Filter
      const expReq = Number(job.experienceRequired) || 0;
      const matchExp =
        experienceFilter === 'ALL' ||
        (experienceFilter === 'ENTRY' && expReq <= 1) ||
        (experienceFilter === 'MID' && expReq >= 2 && expReq <= 4) ||
        (experienceFilter === 'SENIOR' && expReq >= 5);

      // 4. Salary Filter (Checks max or min salary)
      const matchSalary = minSalaryFilter === 0 || (job.salaryMax >= minSalaryFilter);

      // 5. Technology Filter
      const matchTech =
        selectedTech === 'ALL' ||
        (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase() === selectedTech.toLowerCase())) ||
        (job.preferredSkills && job.preferredSkills.some(s => s.toLowerCase() === selectedTech.toLowerCase()));

      return matchSearch && matchMode && matchExp && matchSalary && matchTech;
    })
    .sort((a, b) => {
      if (sortBy === 'MATCH') {
        return b.match.score - a.match.score;
      }
      if (sortBy === 'SALARY') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      if (sortBy === 'DATE') {
        const dateA = a.postedAt?.toDate ? a.postedAt.toDate().getTime() : 0;
        const dateB = b.postedAt?.toDate ? b.postedAt.toDate().getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  // Common quick-filter skills
  const popularTechPills = ['ALL', 'Java', 'Python', 'React', 'TypeScript', 'Docker', 'AWS', 'Spring Boot', 'PostgreSQL', 'FastAPI', 'Kubernetes'];

  return (
    <div className="dashboard-layout">
      {currentUser && <Sidebar />}
      <main className="dashboard-content">
        {/* Page Title & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Explore Tech Roles & Opportunities</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Search and filter open tech opportunities with deterministic compatibility matching.
            </p>
          </div>
          <Link to="/jobs/recommended" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} />
            <span>Recommended Jobs (AI Matches)</span>
          </Link>
        </div>

        {/* Explainability Accordion */}
        <MatchingExplainer defaultOpen={false} />

        {/* Error State Banner */}
        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 24 }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{errorMsg}</span>
              <button onClick={loadData} className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Control Panel */}
        <div className="glass-card" style={{ marginBottom: 28, padding: 24 }}>
          {/* Main Search Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search by job title, skill (e.g. Java, Python), company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
              <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            </div>

            {/* Work Mode */}
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

            {/* Experience Filter */}
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

            {/* Minimum Salary Range Filter */}
            <div>
              <select
                className="input-field"
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
              >
                <option value={0}>Any Salary Range</option>
                <option value={80000}>$80k+ / year</option>
                <option value={100000}>$100k+ / year</option>
                <option value={120000}>$120k+ / year</option>
                <option value={140000}>$140k+ / year</option>
                <option value={160000}>$160k+ / year</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="MATCH">Sort: Highest Match %</option>
                <option value="SALARY">Sort: Highest Salary</option>
                <option value="DATE">Sort: Most Recent</option>
              </select>
            </div>
          </div>

          {/* Technology Quick-Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} /> Technology Filter:
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {popularTechPills.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setSelectedTech(tech)}
                  className={`btn btn-sm ${selectedTech === tech ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                >
                  {tech === 'ALL' ? 'All Tech' : tech}
                </button>
              ))}

              {/* Extra dropdown if candidate wants a specific skill from taxonomy */}
              {availableSkills.length > popularTechPills.length && (
                <select
                  value={popularTechPills.includes(selectedTech) ? 'MORE' : selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem'
                  }}
                >
                  <option value="MORE" disabled>More Tech Skills...</option>
                  {availableSkills
                    .filter(s => !popularTechPills.includes(s))
                    .map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              )}
            </div>

            {(searchTerm || workModeFilter !== 'ALL' || experienceFilter !== 'ALL' || minSalaryFilter !== 0 || selectedTech !== 'ALL') && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-primary)' }}
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'position' : 'positions'} available
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner fullScreen message="Loading and calculating compatibility scores..." />
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className="glass-card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
            <Briefcase size={54} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              No positions match your current filters
            </h3>
            <p style={{ maxWidth: 480, margin: '0 auto 20px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              We could not find any active job postings matching your selected filters for keyword, work mode, salary, or technology.
            </p>
            <button onClick={resetAllFilters} className="btn btn-primary">
              <RotateCcw size={16} />
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Jobs List Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredJobs.map(job => (
              <div key={job.id} className="glass-card glass-card-interactive" style={{ padding: 26 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 16
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: '1.3rem' }}>{job.title}</h3>
                      <span className={`badge ${
                        job.workMode === 'REMOTE' ? 'badge-primary' :
                        job.workMode === 'HYBRID' ? 'badge-info' : 'badge-neutral'
                      }`}>
                        {job.workMode}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{job.company}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={15} /> {job.location}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={15} /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Briefcase size={15} /> {job.experienceRequired}+ yrs
                      </span>
                    </div>
                  </div>

                  {/* Match Score Badge & Bookmark */}
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
                        type="button"
                        onClick={() => toggleSaveJob(job.id)}
                        className={`btn ${savedJobIds.has(job.id) ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        title={savedJobIds.has(job.id) ? 'Saved' : 'Save Job'}
                      >
                        <Bookmark size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: 18, lineHeight: 1.55 }}>
                  {job.description}
                </p>

                {/* Matched vs Missing Skills Breakdown */}
                <div style={{
                  padding: '12px 18px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                  alignItems: 'center',
                  fontSize: '0.86rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Matched:</span>
                    {job.match.matched.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None yet</span>
                    ) : (
                      job.match.matched.slice(0, 5).map((s, i) => (
                        <span key={i} className="skill-tag matched" style={{ fontSize: '0.75rem' }}>
                          <Check size={12} /> {s}
                        </span>
                      ))
                    )}
                    {job.match.matched.length > 5 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        +{job.match.matched.length - 5} more
                      </span>
                    )}
                  </div>

                  {job.match.missing.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: '#fb7185', fontWeight: 700 }}>Missing:</span>
                      {job.match.missing.slice(0, 3).map((s, i) => (
                        <span key={i} className="skill-tag missing" style={{ fontSize: '0.75rem' }}>
                          <X size={12} /> {s}
                        </span>
                      ))}
                      {job.match.missing.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          +{job.match.missing.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Apply CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                    View Full Job Details & Apply
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
