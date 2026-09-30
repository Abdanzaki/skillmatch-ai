import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob
} from '../../services/firestoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusCircle, Trash2, X } from 'lucide-react';

export default function AdminJobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [salaryMin, setSalaryMin] = useState(100000);
  const [salaryMax, setSalaryMax] = useState(140000);
  const [experienceRequired, setExperienceRequired] = useState(2);
  const [requiredSkills, setRequiredSkills] = useState('Java, Spring Boot, Git');
  const [preferredSkills, setPreferredSkills] = useState('Docker, AWS');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const loadedJobs = await getAllJobs();
      setJobs(loadedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      await updateJob(jobId, { active: !currentStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, active: !currentStatus } : j));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const reqList = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const prefList = preferredSkills.split(',').map(s => s.trim()).filter(Boolean);

      const jobData = {
        title,
        company,
        location,
        workMode,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        experienceRequired: Number(experienceRequired),
        requiredSkills: reqList,
        preferredSkills: prefList,
        description,
        active: true,
        createdBy: currentUser.uid
      };

      await createJob(jobData);
      setShowAddModal(false);
      // Reset form
      setTitle('');
      setCompany('');
      setDescription('');
      fetchJobs();
    } catch (err) {
      console.error('Error creating job:', err);
    } finally {
      setSubmitting(false);
    }
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
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Manage Job Postings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Create, update, toggle active status, and remove job listings.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <PlusCircle size={16} />
            Post New Job
          </button>
        </div>

        {loading ? (
          <LoadingSpinner fullScreen message="Loading listings..." />
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Title & Company</th>
                    <th>Location & Mode</th>
                    <th>Salary Range</th>
                    <th>Required Skills</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{job.company}</div>
                      </td>
                      <td>
                        <div>{job.location}</div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{job.workMode}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 260 }}>
                          {job.requiredSkills?.slice(0, 3).map((s, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                          ))}
                          {job.requiredSkills?.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{job.requiredSkills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleJobStatus(job.id, job.active !== false)}
                          className={`badge ${job.active !== false ? 'badge-success' : 'badge-danger'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {job.active !== false ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.4rem' }}>Post New Job Opening</h3>
                <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateJob}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input className="input-field" value={company} onChange={e => setCompany(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="input-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Austin, TX" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Mode</label>
                    <select className="input-field" value={workMode} onChange={e => setWorkMode(e.target.value)}>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ON_SITE">On-Site</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Salary ($ USD)</label>
                    <input type="number" className="input-field" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Salary ($ USD)</label>
                    <input type="number" className="input-field" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input className="input-field" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="Java, Spring Boot, PostgreSQL..." required />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Skills (comma-separated)</label>
                  <input className="input-field" value={preferredSkills} onChange={e => setPreferredSkills(e.target.value)} placeholder="Docker, AWS, Redis..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea rows={4} className="input-field" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Creating...' : 'Create Job Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
