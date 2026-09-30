import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  FileSearch,
  Target,
  BarChart3,
  CheckCircle,
  Briefcase,
  ArrowRight,
  Shield,
  Brain,
  Zap,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '90px 0 80px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25) 0%, rgba(14, 165, 233, 0.1) 40%, rgba(10, 13, 20, 0) 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 24
          }}>
            <Sparkles size={16} />
            <span>Next-Generation Career Intelligence & Resume Parsing</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: '-0.03em'
          }}>
            Your Skills. Our AI.{' '}
            <span className="gradient-text">Better Opportunities.</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 720,
            margin: '0 auto 36px auto'
          }}>
            SkillMatch AI delivers transparent, explainable resume analysis and deterministic job matching for developers, engineers, and ambitious job seekers.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={currentUser ? "/resume" : "/register"}
              className="btn btn-primary btn-lg"
              style={{ minWidth: 200 }}
            >
              <FileSearch size={20} />
              Analyze My Resume
            </Link>
            <Link
              to="/jobs"
              className="btn btn-secondary btn-lg"
              style={{ minWidth: 180 }}
            >
              <Briefcase size={20} />
              Find Jobs
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div style={{
            marginTop: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#10b981" />
              <span>Zero Fake AI / Black Boxes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#10b981" />
              <span>Full Skill-Gap Transparency</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#10b981" />
              <span>Secure Cloud Storage Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>How SkillMatch Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              Four simple, transparent steps from resume PDF to precision job application.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24
          }}>
            {/* Step 1 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                01
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>Upload Resume</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Securely drop your PDF. Files are validated and processed in sandboxed Cloud Storage without exposing storage paths.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                02
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>AI Skill Extraction</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Our Python AI service extracts technical competencies, work chronology, and projects into structured, editable JSON.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                03
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>Precision Match %</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Transparently calculated match scores with clear breakdowns of your matched skills vs required missing skills.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                04
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>Close the Gap & Apply</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Follow targeted learning recommendations to bridge skill gaps and submit applications directly to companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Algorithm Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            padding: '48px',
            background: 'linear-gradient(135deg, rgba(21, 27, 45, 0.8) 0%, rgba(30, 41, 68, 0.8) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12
              }}>
                <Brain size={16} />
                <span>Deterministic Scoring Engine</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>
                How Our Matching Algorithm Works
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
                We believe candidates deserve complete transparency. Your compatibility score is computed deterministically rather than generated by an unpredictable black box:
              </p>

              {/* Formula Breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                marginBottom: 32,
                textAlign: 'left'
              }}>
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>60%</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Required Skills</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exact & normalized tech overlap</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>20%</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Preferred Skills</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bonus tools & frameworks</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>10%</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Experience Fit</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Years in software engineering</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>10%</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Education Fit</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Degrees & coursework relevant to role</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                color: '#fbbf24',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                <strong>Important:</strong> Matching scores are data-driven algorithmic guidelines to assist candidates and are never presented as a guarantee of employment.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section style={{ padding: '60px 0 100px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 16 }}>Ready to Accelerate Your Career?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
            Experience instant skill extraction, discover compatible tech jobs, and pinpoint missing competencies today.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
