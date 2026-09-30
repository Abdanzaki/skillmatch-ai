import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Award,
  Sparkles,
  Briefcase,
  Send,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';

export default function UserDashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    resumeScore: 88,
    skillsFound: 10,
    jobsMatched: 14,
    applicationsCount: 3
  });
  const [topSkills, setTopSkills] = useState([
    { name: 'Java', level: 90, category: 'Backend' },
    { name: 'React', level: 85, category: 'Frontend' },
    { name: 'Spring Boot', level: 80, category: 'Backend' },
    { name: 'PostgreSQL', level: 75, category: 'Database' },
    { name: 'Git & GitHub', level: 95, category: 'Tools' }
  ]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [hasResume, setHasResume] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;
      try {
        setLoading(true);

        // 1. Fetch user applications
        const appsQuery = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid),
          limit(5)
        );
        const appsSnap = await getDocs(appsQuery);
        const apps = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentApplications(apps);

        // 2. Fetch user resumeAnalysis if exists
        const analysisQuery = query(
          collection(db, 'resumeAnalysis'),
          where('userId', '==', currentUser.uid),
          limit(1)
        );
        const analysisSnap = await getDocs(analysisQuery);

        if (!analysisSnap.empty) {
          const analysis = analysisSnap.docs[0].data();
          setHasResume(true);
          const overallScore = analysis.scoreBreakdown?.overallScore || 85;
          const skillsCount = analysis.skills?.length || 8;

          setStats(prev => ({
            ...prev,
            resumeScore: overallScore,
            skillsFound: skillsCount,
            applicationsCount: apps.length
          }));
        } else {
          // If no resume uploaded yet
          setHasResume(false);
          setStats(prev => ({
            ...prev,
            resumeScore: 0,
            skillsFound: 0,
            applicationsCount: apps.length
          }));
        }

        // 3. Fetch userSkills
        const skillsQuery = query(
          collection(db, 'userSkills'),
          where('userId', '==', currentUser.uid)
        );
        const skillsSnap = await getDocs(skillsQuery);
        if (!skillsSnap.empty) {
          const mapped = skillsSnap.docs.map(d => {
            const data = d.data();
            let score = 75;
            if (data.level === 'Expert') score = 95;
            else if (data.level === 'Advanced') score = 85;
            else if (data.level === 'Intermediate') score = 70;
            else if (data.level === 'Beginner') score = 50;
            return { name: data.name, level: score, category: data.category || 'Skill' };
          });
          setTopSkills(mapped.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Loading candidate metrics..." />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {/* Welcome Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>
              Welcome back, {userProfile?.displayName || currentUser?.displayName || 'Candidate'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Here is your AI resume health overview and active job matching opportunities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/resume" className="btn btn-outline">
              <UploadCloud size={16} />
              Upload New Resume
            </Link>
            <Link to="/jobs" className="btn btn-primary">
              <Briefcase size={16} />
              Explore Jobs
            </Link>
          </div>
        </div>

        {/* If user hasn't uploaded a resume, display an onboarding banner */}
        {!hasResume && (
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>Upload your resume to activate AI matching</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Our Python Cloud Function will parse your experience, calculate your score, and match compatible jobs.
                </p>
              </div>
            </div>
            <Link to="/resume" className="btn btn-primary">
              Upload PDF Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="stats-grid">
          {/* Resume Score */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Award size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.resumeScore}%</div>
              <div className="stat-label">Resume Score</div>
            </div>
          </div>

          {/* Skills Found */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <Sparkles size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.skillsFound}</div>
              <div className="stat-label">Skills Extracted</div>
            </div>
          </div>

          {/* Jobs Matched */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Briefcase size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.jobsMatched}</div>
              <div className="stat-label">Jobs Matched</div>
            </div>
          </div>

          {/* Applications */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Send size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.applicationsCount}</div>
              <div className="stat-label">Active Applications</div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Top Skills & Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 32
        }}>
          {/* Top Skills with Visual Bars */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Top Technical Skills</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Relative proficiency identified from your portfolio & resume
                </p>
              </div>
              <Link to="/profile" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Edit Skills
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topSkills.map((skill, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{skill.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${skill.level}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications Feed */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Recent Applications</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Live status updates from your submitted applications
                </p>
              </div>
              <Link to="/applications" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>No job applications submitted yet.</p>
                <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                  Browse Matching Jobs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      padding: '14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{app.jobTitle}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{app.company}</div>
                    </div>
                    <span className={`badge ${
                      app.status === 'Interview' ? 'badge-success' :
                      app.status === 'Under Review' ? 'badge-warning' :
                      app.status === 'Selected' ? 'badge-success' : 'badge-neutral'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
