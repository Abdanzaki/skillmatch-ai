import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 24px 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 36,
          paddingBottom: 40,
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                SkillMatch <span className="gradient-text">AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Your Skills. Our AI. Better Opportunities. Transparent, explainable resume matching and skill gap discovery.
            </p>
          </div>

          {/* Candidates */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/jobs" style={{ hover: { color: 'var(--text-primary)' } }}>Browse Jobs</Link></li>
              <li><Link to="/resume">Resume Analyzer</Link></li>
              <li><Link to="/skill-gap">Skill Gap Calculator</Link></li>
              <li><Link to="/dashboard">Candidate Dashboard</Link></li>
            </ul>
          </div>

          {/* Matching Transparency */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>Matching Algorithm</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Weighted deterministic matching: 60% required skills, 20% preferred skills, 10% experience fit, and 10% education fit. No opaque black-box filtering.
            </p>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>Get Started</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Free Account</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          gap: 12,
        }}>
          <div>
            © {new Date().getFullYear()} SkillMatch AI. All rights reserved. Built with Firebase & Python Cloud Functions.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Crafted for exceptional developer & job-seeker experiences
          </div>
        </div>
      </div>
    </footer>
  );
}
