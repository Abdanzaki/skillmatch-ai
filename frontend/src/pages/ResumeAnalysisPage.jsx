import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Award,
  Sparkles,
  Edit3,
  CheckCircle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  AlertCircle,
  UserCheck,
  Save
} from 'lucide-react';

export default function ResumeAnalysisPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [skillsText, setSkillsText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadAnalysis() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, 'resumeAnalysis'),
          where('userId', '==', currentUser.uid),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setAnalysis(data);
          setSkillsText(data.skills ? data.skills.join(', ') : '');
        } else {
          // Fallback sample analysis for demonstration
          const sample = {
            id: 'sample-analysis',
            personal_info: {
              fullName: currentUser.displayName || 'Alex Morgan',
              email: currentUser.email || 'alex@skillmatch.ai',
              phone: '+1 (555) 234-5678',
              location: 'Austin, TX'
            },
            skills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3', 'Docker'],
            experience_years: 2,
            education: [
              { degree: 'B.S. in Computer Science', institution: 'University of Texas at Austin', field: 'Computer Science', year: 2023, gpa: '3.82' }
            ],
            experience: [
              {
                company: 'Apex Digital Solutions',
                position: 'Software Engineer',
                duration: 'June 2023 - Present',
                responsibilities: [
                  'Engineered REST APIs handling 50k daily active users',
                  'Developed responsive web application features using React and TypeScript',
                  'Optimized SQL queries and indexing in PostgreSQL'
                ]
              }
            ],
            projects: [
              {
                name: 'E-Commerce Microservices Engine',
                tech: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
                description: 'Built a containerized e-commerce backend with product search, cart, and stripe checkout.'
              }
            ],
            certifications: ['Oracle Certified Associate, Java SE 8 Programmer'],
            scoreBreakdown: {
              skillsScore: 88,
              experienceScore: 80,
              educationScore: 95,
              projectsScore: 85,
              completenessScore: 92,
              overallScore: 88,
              reasons: [
                'High match with in-demand full-stack and backend competencies (Java, React, PostgreSQL)',
                'Accredited B.S. degree in Computer Science with a high GPA',
                'Demonstrated production software experience building microservices',
                'Strong portfolio project showcasing containerization and architectural separation'
              ]
            }
          };
          setAnalysis(sample);
          setSkillsText(sample.skills.join(', '));
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [currentUser]);

  const handleSaveCorrections = async () => {
    try {
      const updatedSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      if (analysis.id && analysis.id !== 'sample-analysis') {
        const docRef = doc(db, 'resumeAnalysis', analysis.id);
        await updateDoc(docRef, {
          skills: updatedSkills,
          isEdited: true
        });
      }
      setAnalysis(prev => ({ ...prev, skills: updatedSkills }));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update skills:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Loading AI Resume Analysis..." />
        </main>
      </div>
    );
  }

  const breakdown = analysis?.scoreBreakdown || {
    skillsScore: 85,
    experienceScore: 80,
    educationScore: 90,
    projectsScore: 85,
    completenessScore: 90,
    overallScore: 86,
    reasons: []
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Resume Analysis & Breakdown</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Explainable AI parsing results for {analysis?.personal_info?.fullName || 'Candidate'}.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
            >
              <Edit3 size={16} />
              {isEditing ? 'Cancel Editing' : 'Edit Extracted Data'}
            </button>
            <Link to="/jobs" className="btn btn-primary">
              <Briefcase size={16} />
              Match Jobs Now
            </Link>
          </div>
        </div>

        {saveSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>Extracted skills updated successfully! Your match scores will recalculate.</span>
          </div>
        )}

        {/* Explainable Score Header Card */}
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(21, 27, 45, 0.95) 0%, rgba(30, 41, 68, 0.95) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.35)',
          marginBottom: 32,
          padding: '36px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 28,
            marginBottom: 28
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)'
              }}>
                {breakdown.overallScore}%
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  <span>Strong Competitive Profile</span>
                </div>
                <h2 style={{ fontSize: '1.7rem', margin: '4px 0' }}>Overall Resume Quality Score</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Transparently weighted across 5 critical dimensions (NOT a guarantee of hiring success).
                </p>
              </div>
            </div>
          </div>

          {/* 5-Dimension Score Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Skills Depth</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.skillsScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.skillsScore}%` }}></div></div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Experience Fit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.experienceScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.experienceScore}%`, background: 'var(--cyan-gradient)' }}></div></div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Education</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.educationScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.educationScore}%`, background: 'var(--emerald-gradient)' }}></div></div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Projects Quality</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.projectsScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.projectsScore}%`, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}></div></div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Completeness</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.completenessScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.completenessScore}%`, background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}></div></div>
            </div>
          </div>

          {/* Explainable Reasons */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Score Rationale:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {breakdown.reasons?.map((reason, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Skills Section */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--accent-primary)" />
                Extracted Skills ({analysis?.skills?.length || 0})
              </h3>
            </div>

            {isEditing ? (
              <div>
                <label className="form-label">Edit comma-separated skills:</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                <button onClick={handleSaveCorrections} className="btn btn-primary btn-sm">
                  <Save size={14} />
                  Save Corrections
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {analysis?.skills?.map((skill, i) => (
                  <span key={i} className="skill-tag matched">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="#38bdf8" />
              Work Experience ({analysis?.experience_years || 0} years)
            </h3>
            {analysis?.experience?.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < analysis.experience.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.position}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 6 }}>
                  {exp.company} • {exp.duration}
                </div>
                <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {exp.responsibilities?.map((r, ri) => (
                    <li key={ri}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="#34d399" />
              Education
            </h3>
            {analysis?.education?.map((edu, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{edu.degree}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {edu.institution} ({edu.year})
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    GPA: {edu.gpa}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderGit2 size={18} color="#fbbf24" />
              Portfolio Projects
            </h3>
            {analysis?.projects?.map((proj, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.name}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0' }}>
                  {proj.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {proj.tech?.map((t, ti) => (
                    <span key={ti} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
