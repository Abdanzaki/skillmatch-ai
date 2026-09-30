import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';
import { Send, Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

export default function MyApplicationsPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(list);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [currentUser]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
      case 'Interview':
        return 'badge-success';
      case 'Under Review':
        return 'badge-warning';
      case 'Rejected':
        return 'badge-danger';
      case 'Applied':
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>My Applications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track the status of your applications and interview schedules.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner fullScreen message="Loading your submitted applications..." />
        ) : applications.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Send size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No applications submitted yet</h3>
            <p style={{ marginTop: 8 }}>Explore open roles and start applying based on your AI match score.</p>
            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse Matched Jobs
            </Link>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.jobTitle}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{app.company}</td>
                      <td>
                        {app.matchScore ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                            {app.matchScore}%
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {app.notes || 'No active notes'}
                      </td>
                      <td>
                        <Link to={`/jobs/${app.jobId}`} className="btn btn-outline btn-sm">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
