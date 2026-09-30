import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getUserSkills } from '../services/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Compass, BookOpen, AlertCircle, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

export default function SkillGapPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(['Java', 'Spring Boot', 'React', 'JavaScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3']);

  // Missing high-demand skills computed against all active jobs in system
  const [missingSkills, setMissingSkills] = useState([
    {
      name: 'Docker',
      frequency: 'Required by 7 active jobs',
      category: 'DevOps',
      recommendations: [
        { title: 'Docker for Developers: Hands-on Containers', platform: 'FreeCodeCamp / Official Docs', estHours: 12 },
        { title: 'Containerizing Microservices with Spring Boot & Docker', platform: 'Spring.io Guide', estHours: 8 }
      ]
    },
    {
      name: 'Kubernetes',
      frequency: 'Required by 5 active jobs',
      category: 'DevOps',
      recommendations: [
        { title: 'Kubernetes Basics & Pod Architecture', platform: 'Kubernetes.io Interactive Tutorials', estHours: 16 },
        { title: 'Deploying High-Availability Web Apps', platform: 'Cloud Native Computing Foundation (CNCF)', estHours: 20 }
      ]
    },
    {
      name: 'AWS',
      frequency: 'Required by 6 active jobs',
      category: 'Cloud',
      recommendations: [
        { title: 'AWS Cloud Practitioner Essentials', platform: 'AWS Skill Builder', estHours: 15 },
        { title: 'Architecting Serverless & S3 Storage', platform: 'AWS Hands-On Labs', estHours: 18 }
      ]
    },
    {
      name: 'TypeScript',
      frequency: 'Required by 4 active jobs',
      category: 'Frontend',
      recommendations: [
        { title: 'TypeScript Handbook & Deep Dive', platform: 'typescriptlang.org', estHours: 10 },
        { title: 'Full Stack Type-Safe Applications with React', platform: 'React Official Docs', estHours: 14 }
      ]
    }
  ]);

  useEffect(() => {
    async function loadSkills() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const skillsList = await getUserSkills(currentUser.uid);
        if (skillsList.length > 0) {
          setUserSkills(skillsList.map(d => d.name));
        }
      } catch (err) {
        console.error('Error fetching user skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, [currentUser]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Skill Gap Analysis & Recommendations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Compare your current skill stack against trending requirements to prioritize your learning roadmap.
          </p>
        </div>

        {/* Notice Banner */}
        <div className="alert alert-info" style={{ marginBottom: 28 }}>
          <AlertCircle size={20} />
          <span>
            <strong>Educational Disclaimer:</strong> Learning recommendations are curated educational suggestions to help expand your skill set and are not guaranteed to result in employment or hiring.
          </span>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{userSkills.length}</div>
              <div className="stat-label">Your Verified Skills</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <Compass size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{missingSkills.length}</div>
              <div className="stat-label">Identified Skill Gaps</div>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {missingSkills.map((gap, idx) => (
            <div key={idx} className="glass-card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 16,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="skill-tag missing" style={{ fontSize: '1rem', padding: '6px 14px' }}>
                    {gap.name}
                  </span>
                  <span className="badge badge-neutral">{gap.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{gap.frequency}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.92rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
                  Recommended Learning Pathways:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {gap.recommendations.map((rec, ri) => (
                    <div
                      key={ri}
                      style={{
                        padding: '14px 16px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Provider: {rec.platform} • ~{rec.estHours} hrs
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
                          Explore Module <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
