import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboardMetrics } from '../../services/firestoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Briefcase,
  Send,
  CheckCircle,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentUsers: [],
    recentApplications: []
  });

  useEffect(() => {
    async function loadAdminMetrics() {
      try {
        setLoading(true);
        const metrics = await getAdminDashboardMetrics();
        setStats(metrics);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <LoadingSpinner fullScreen message="Loading administrator analytics..." />
        </main>
      </div>
    );
  }

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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
              <ShieldCheck size={16} />
              <span>Administrator Portal</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Platform Overview & Analytics</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Comprehensive system status, candidate registrations, and job postings.
            </p>
          </div>
          <div>
            <Link to="/admin/jobs" className="btn btn-primary">
              <PlusCircle size={16} />
              Manage & Add Jobs
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <Users size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Registered Candidates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Briefcase size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalJobs}</div>
              <div className="stat-label">Total Job Postings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <CheckCircle size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeJobs}</div>
              <div className="stat-label">Active Roles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Send size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-label">Applications Submitted</div>
            </div>
          </div>
        </div>

        {/* User List & Applications List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          {/* User List */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} />
              Recent Users
            </h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers?.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.displayName || 'Unnamed'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-success' : 'badge-primary'}`}>
                          {u.role || 'USER'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Applications List */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Send size={18} />
              Recent Applications
            </h3>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications?.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.userName || app.userEmail}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{app.jobTitle}</td>
                      <td>
                        <span className={`badge ${
                          app.status === 'Interview' ? 'badge-success' :
                          app.status === 'Under Review' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
