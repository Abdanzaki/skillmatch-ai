import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Send,
  Compass,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Database
} from 'lucide-react';

export default function Sidebar() {
  const { isAdmin, logout, userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `sidebar-item ${isActive ? 'active' : ''}`;

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: 28,
      minHeight: 'calc(100vh - var(--navbar-height))'
    }}>
      {/* User Quick Info */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isAdmin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isAdmin ? '#34d399' : 'var(--text-accent)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0]}
          </div>
          <span className={`badge ${isAdmin ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
            {isAdmin ? 'ADMIN' : 'JOB SEEKER'}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 12,
          paddingLeft: 12
        }}>
          Menu
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/resume" className={navItemClass}>
            <FileText size={18} />
            <span>My Resume</span>
          </NavLink>
          <NavLink to="/jobs" className={navItemClass}>
            <Briefcase size={18} />
            <span>Jobs & Matching</span>
          </NavLink>
          <NavLink to="/applications" className={navItemClass}>
            <Send size={18} />
            <span>Applications</span>
          </NavLink>
          <NavLink to="/skill-gap" className={navItemClass}>
            <Compass size={18} />
            <span>Skill Gap</span>
          </NavLink>
          <NavLink to="/profile" className={navItemClass}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Admin Section (Only rendered if admin) */}
      {isAdmin && (
        <div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#34d399',
            marginBottom: 12,
            paddingLeft: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <ShieldCheck size={14} />
            <span>Admin Tools</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <NavLink to="/admin" end className={navItemClass}>
              <Database size={18} />
              <span>Admin Overview</span>
            </NavLink>
            <NavLink to="/admin/jobs" className={navItemClass}>
              <PlusCircle size={18} />
              <span>Manage Jobs</span>
            </NavLink>
          </nav>
        </div>
      )}

      {/* Bottom Utilities */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: '100%', textAlign: 'left', color: 'var(--color-danger)' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.92rem;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }
        .sidebar-item:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .sidebar-item.active {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          font-weight: 600;
          border-color: rgba(99, 102, 241, 0.25);
        }
        @media (max-width: 992px) {
          aside {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}
