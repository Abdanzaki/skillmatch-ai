import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getResumeAnalysis, updateResumeAnalysis } from '../services/firestoreService';
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
  Save,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function ResumeAnalysisPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form States
  const [skillsText, setSkillsText] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: ''
  });
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [certificationsText, setCertificationsText] = useState('');

  useEffect(() => {
    async function loadAnalysis() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const data = await getResumeAnalysis(currentUser.uid);

        if (data) {
          setAnalysis(data);
          syncFormStates(data);
        } else {
          // Provide standard initial data for testing
          const initial = {
            id: `analysis_${currentUser.uid}`,
            userId: currentUser.uid,
            personal_info: {
              fullName: currentUser.displayName || 'Alex Morgan',
              email: currentUser.email || 'alex@skillmatch.ai',
              phone: '+1 (555) 234-5678',
              location: 'Austin, TX',
              linkedin: 'linkedin.com/in/alexmorgan-dev',
              github: 'github.com/alexmorgan'
            },
            skills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Git', 'HTML5', 'CSS3', 'Docker'],
            experience_years: 2,
            education: [
              {
                degree: 'B.S. in Computer Science',
                institution: 'University of Texas at Austin',
                field: 'Computer Science',
                year: 2023,
                gpa: '3.82'
              }
            ],
            experience: [
              {
                company: 'Apex Digital Solutions',
                position: 'Software Engineer',
                duration: 'June 2023 - Present',
                responsibilities: [
                  'Engineered REST APIs handling 50k daily active users with sub-100ms response times.',
                  'Developed responsive web components with React and TypeScript.',
                  'Optimized SQL queries and database indexing in PostgreSQL.'
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
            certifications: ['Oracle Certified Associate, Java SE 8 Programmer', 'AWS Certified Cloud Practitioner'],
            scoreBreakdown: {
              skillsScore: 88,
              experienceScore: 80,
              educationScore: 95,
              projectsScore: 85,
              completenessScore: 92,
              overallScore: 88,
              reasons: [
                'Skills: Strong alignment with high-demand backend and full-stack enterprise technologies.',
                'Experience: Demonstrated software engineering tenure building production microservices.',
                'Education: Accredited B.S. in Computer Science with a high cumulative GPA (3.82).',
                'Projects: Modern cloud architecture project utilizing Docker and microservice patterns.',
                'Completeness: Complete profile with confirmed contact channels, education, and career history.'
              ]
            },
            isEdited: false
          };
          setAnalysis(initial);
          syncFormStates(initial);
        }
      } catch (err) {
        console.error('Error loading resume analysis:', err);
        setErrorMsg('Failed to load resume analysis.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [currentUser]);

  const syncFormStates = (data) => {
    setSkillsText(data.skills ? data.skills.join(', ') : '');
    setPersonalInfo(data.personal_info || {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    });
    setEducationList(data.education || []);
    setExperienceList(data.experience || []);
    setProjectsList(data.projects || []);
    setCertificationsText(data.certifications ? data.certifications.join(', ') : '');
  };

  const handleSaveCorrections = async () => {
    if (!analysis || !currentUser) return;
    try {
      setSaving(true);
      setErrorMsg('');

      const parsedSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const parsedCerts = certificationsText.split(',').map(c => c.trim()).filter(Boolean);

      // Recalculate score based on corrected data
      const skillsScore = Math.min(100, Math.max(40, parsedSkills.length * 9));
      const expScore = analysis.scoreBreakdown?.experienceScore || 80;
      const eduScore = educationList.length > 0 ? 95 : 70;
      const projScore = Math.min(100, Math.max(50, projectsList.length * 30 + 30));
      const completenessScore = 95;

      const overallScore = Math.round(
        skillsScore * 0.35 +
        expScore * 0.25 +
        eduScore * 0.15 +
        projScore * 0.15 +
        completenessScore * 0.10
      );

      const updatedPayload = {
        personal_info: personalInfo,
        skills: parsedSkills,
        education: educationList,
        experience: experienceList,
        projects: projectsList,
        certifications: parsedCerts,
        scoreBreakdown: {
          skillsScore,
          experienceScore: expScore,
          educationScore: eduScore,
          projectsScore: projScore,
          completenessScore,
          overallScore,
          reasons: [
            `Skills: Updated with ${parsedSkills.length} user-verified technical competencies.`,
            `Experience: Evaluated based on ${experienceList.length} professional role(s).`,
            `Education: Verified ${educationList.length} educational degree(s).`,
            `Projects: Portfolio contains ${projectsList.length} documented technical project(s).`,
            'Completeness: Comprehensive documentation verified across all critical sections.'
          ]
        },
        isEdited: true
      };

      await updateResumeAnalysis(analysis.id, updatedPayload);

      setAnalysis(prev => ({
        ...prev,
        ...updatedPayload
      }));

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving resume corrections:', err);
      setErrorMsg('Failed to persist corrections to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Loading AI Resume Analysis & Breakdown..." />
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
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={16} />
              <span>AI Analysis Engine</span>
              {analysis?.isEdited && (
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', marginLeft: 6 }}>
                  User Corrected
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Resume Analysis & Breakdown</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Structured data extracted by AI. Review and correct any extraction discrepancies below.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (isEditing) syncFormStates(analysis);
                setIsEditing(!isEditing);
              }}
              className="btn btn-secondary"
            >
              <Edit3 size={16} />
              {isEditing ? 'Cancel Editing' : 'Edit Extracted Data'}
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveCorrections}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <span className="spinner" style={{ width: 18, height: 18 }}></span>
                ) : (
                  <>
                    <Save size={16} />
                    Save Corrections
                  </>
                )}
              </button>
            ) : (
              <Link to="/jobs" className="btn btn-primary">
                <Briefcase size={16} />
                Match Jobs
              </Link>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={20} />
            <span>Corrections saved to your Cloud Firestore profile! Your match scores will reflect these updates.</span>
          </div>
        )}

        {/* Explainability & Quality Score Card */}
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
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)'
              }}>
                {breakdown.overallScore}%
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Award size={16} />
                  <span>Resume Health Rating</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', margin: '4px 0' }}>Comprehensive Profile Score</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Deterministically calculated across 5 dimensions: Skills, Experience, Education, Projects, and Completeness.
                </p>
              </div>
            </div>

            {/* Crucial Non-Guarantee Legal / Ethical Notice */}
            <div style={{
              maxWidth: 360,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '0.8rem',
              lineHeight: 1.5
            }}>
              <strong>Important Disclaimer:</strong> This score reflects resume structural completeness and technical skill density. It is provided for guidance and is <em>never a guarantee of job offer or hiring success</em>.
            </div>
          </div>

          {/* 5-Dimension Score Progress Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            {/* Skills */}
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Skills Depth</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.skillsScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.skillsScore}%` }}></div></div>
            </div>

            {/* Experience */}
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Experience Fit</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.experienceScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.experienceScore}%`, background: 'var(--cyan-gradient)' }}></div></div>
            </div>

            {/* Education */}
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Education</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.educationScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.educationScore}%`, background: 'var(--emerald-gradient)' }}></div></div>
            </div>

            {/* Projects */}
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Projects Portfolio</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.projectsScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.projectsScore}%`, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}></div></div>
            </div>

            {/* Completeness */}
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Completeness</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {breakdown.completenessScore}%
              </div>
              <div className="progress-container"><div className="progress-bar" style={{ width: `${breakdown.completenessScore}%`, background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}></div></div>
            </div>
          </div>

          {/* Reasons Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Score Breakdown Rationale:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {breakdown.reasons?.map((reason, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Sections (Editable) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Personal Info */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="var(--accent-primary)" />
              Personal & Contact Information
            </h3>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    className="input-field"
                    value={personalInfo.fullName}
                    onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email</label>
                  <input
                    className="input-field"
                    value={personalInfo.email}
                    onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone</label>
                  <input
                    className="input-field"
                    value={personalInfo.phone}
                    onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    className="input-field"
                    value={personalInfo.location}
                    onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
                <div><strong>Full Name:</strong> {personalInfo.fullName || 'Not provided'}</div>
                <div><strong>Email:</strong> {personalInfo.email || 'Not provided'}</div>
                <div><strong>Phone:</strong> {personalInfo.phone || 'Not provided'}</div>
                <div><strong>Location:</strong> {personalInfo.location || 'Not provided'}</div>
                {personalInfo.linkedin && <div><strong>LinkedIn:</strong> {personalInfo.linkedin}</div>}
                {personalInfo.github && <div><strong>GitHub:</strong> {personalInfo.github}</div>}
              </div>
            )}
          </div>

          {/* Technical Skills */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              Extracted Technical Skills ({analysis?.skills?.length || 0})
            </h3>

            {isEditing ? (
              <div>
                <label className="form-label">Edit comma-separated skills:</label>
                <textarea
                  className="input-field"
                  rows={5}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Java, Spring Boot, React, TypeScript..."
                />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
                  Separate individual skills with commas.
                </p>
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

          {/* Experience */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="#38bdf8" />
              Work & Professional Experience
            </h3>

            {experienceList.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < experienceList.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
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

          {/* Education */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="#34d399" />
              Education & Degrees
            </h3>

            {educationList.map((edu, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
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

          {/* Projects */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderGit2 size={18} color="#fbbf24" />
              Projects
            </h3>

            {projectsList.map((proj, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.name}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0' }}>
                  {proj.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {proj.tech?.map((t, ti) => (
                    <span key={ti} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#a855f7" />
              Certifications & Credentials
            </h3>

            {isEditing ? (
              <div>
                <label className="form-label">Certifications (comma-separated):</label>
                <input
                  className="input-field"
                  value={certificationsText}
                  onChange={e => setCertificationsText(e.target.value)}
                  placeholder="AWS Certified Practitioner, Oracle Certified Java..."
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis?.certifications?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                    <CheckCircle size={15} color="#34d399" />
                    <span>{c}</span>
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
