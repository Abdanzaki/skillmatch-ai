import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  Layers,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--navbar-height)',
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {/* Logo */}
        <Link to={currentUser ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)'
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              SkillMatch <span className="gradient-text">AI</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', mdDisplay: 'flex', alignItems: 'center', gap: 24 }} className="desktop-nav">
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Layers size={16} />
                Dashboard
              </Link>
              <Link
                to="/jobs"
                style={{
                  color: isActive('/jobs') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Briefcase size={16} />
                Jobs
              </Link>
              <Link
                to="/resume"
                style={{
                  color: isActive('/resume') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileText size={16} />
                My Resume
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    color: isActive('/admin') ? '#34d399' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <ShieldCheck size={16} color="#34d399" />
                  Admin Portal
                </Link>
              )}

              {/* User Dropdown / Profile Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12 }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="avatar"
                      style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                    />
                  ) : (
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'var(--bg-surface-active)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)'
                    }}>
                      <User size={16} />
                    </div>
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Log out"
                  style={{ padding: '6px 10px' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/jobs" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                Browse Jobs
              </Link>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '8px 16px' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mobile-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-primary)', padding: 6 }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: 'var(--navbar-height)',
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--shadow-lg)'
        }}>
          {currentUser ? (
            <>
              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {userProfile?.displayName || currentUser.email}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Role: {isAdmin ? 'ADMIN' : 'CANDIDATE'}
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
              <Link to="/resume" onClick={() => setMobileMenuOpen(false)}>My Resume</Link>
              <Link to="/applications" onClick={() => setMobileMenuOpen(false)}>Applications</Link>
              <Link to="/skill-gap" onClick={() => setMobileMenuOpen(false)}>Skill Gap</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#34d399', fontWeight: 700 }}>
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="btn btn-danger btn-sm"
                style={{ marginTop: 8 }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Browse Jobs</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">Log in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">Sign Up Free</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
