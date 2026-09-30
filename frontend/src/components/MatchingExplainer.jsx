import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function MatchingExplainer({ defaultOpen = false, compact = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="glass-card"
      style={{
        border: '1px solid rgba(99, 102, 241, 0.35)',
        background: 'linear-gradient(135deg, rgba(21, 27, 45, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        marginBottom: 24,
        overflow: 'hidden'
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                How Matching Works: Transparent, Explainable Intelligence
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Algorithmic Clarity
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Deterministic weighted scoring backed by technical taxonomy normalization and TF-IDF semantic relevance.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}
          aria-label={isOpen ? 'Collapse explainer' : 'Expand explainer'}
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          {/* Key Formula Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 20
            }}
          >
            <div
              style={{
                background: 'rgba(10, 14, 26, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-primary)', marginBottom: 6, fontWeight: 700, fontSize: '0.9rem' }}>
                <Cpu size={16} />
                <span>Required Skills (60%)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Direct overlap between your normalized competencies and non-negotiable role requirements.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(10, 14, 26, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', marginBottom: 6, fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} />
                <span>Preferred Skills (20%)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Bonus competencies (e.g. Docker, Redis, AWS) that elevate your application above standard qualifications.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(10, 14, 26, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', marginBottom: 6, fontWeight: 700, fontSize: '0.9rem' }}>
                <Briefcase size={16} />
                <span>Experience Fit (10%)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Candidate verified career tenure evaluated proportionally against the role's required years.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(10, 14, 26, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', marginBottom: 6, fontWeight: 700, fontSize: '0.9rem' }}>
                <GraduationCap size={16} />
                <span>Education Fit (10%)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Degree level and STEM / Computer Science field alignment extracted from verified academic credentials.
              </p>
            </div>
          </div>

          {/* Mathematical Formula & Refinement Details */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--accent-primary)',
              marginBottom: 16
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={16} color="var(--accent-primary)" />
              <span>Exact Mathematical Formula</span>
            </div>
            <code
              style={{
                display: 'block',
                background: 'rgba(10, 13, 20, 0.85)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
                marginBottom: 10,
                overflowX: 'auto'
              }}
            >
              Match Score = (0.60 × ReqSkills) + (0.20 × PrefSkills) + (0.10 × ExpFit) + (0.10 × EduFit) ± TF-IDF Refinement
            </code>
            <ul style={{ paddingLeft: 18, margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              <li>
                <strong>Skill Normalization:</strong> Skills are lowercased and mapped through an alias dictionary (e.g., <code>"springboot"</code> &rarr; <code>"Spring Boot"</code>, <code>"js"</code> &rarr; <code>"JavaScript"</code>, <code>"k8s"</code> &rarr; <code>"Kubernetes"</code>) to eliminate formatting discrepancies.
              </li>
              <li>
                <strong>Semantic Signal:</strong> TF-IDF cosine similarity analyzes full resume project and experience narratives against the job description to provide fine-grained contextual tuning.
              </li>
              <li>
                <strong>Transparent Feedback:</strong> Every job always renders an explicit audit of matched skills alongside missing skills, empowering targeted career upskilling.
              </li>
            </ul>
          </div>

          {/* Ethical Disclaimer Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              lineHeight: 1.5
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#f87171' }} />
            <div>
              <strong>Non-Guarantee & Decision-Support Notice:</strong> Match percentages are calculated as algorithmic decision-support estimates. They are never presented as a guarantee of employment, hiring selection, or interview invitations. Final employment decisions remain solely with human hiring teams.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
