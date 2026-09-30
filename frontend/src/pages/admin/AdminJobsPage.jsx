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
import {
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  Save,
  Clock
} from 'lucide-react';

export default function AdminJobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter in Admin View
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ARCHIVED'

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null); // null for create, string id for edit
  const [submitting, setSubmitting] = useState(false);

  // Form Fields per PLAN.md Section 7
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formWorkMode, setFormWorkMode] = useState('REMOTE');
  const [formSalaryMin, setFormSalaryMin] = useState(110000);
  const [formSalaryMax, setFormSalaryMax] = useState(150000);
  const [formExperienceRequired, setFormExperienceRequired] = useState(3);
  const [formDescription, setFormDescription] = useState('');
  const [formRequiredSkills, setFormRequiredSkills] = useState('Java, Spring Boot, Git');
  const [formPreferredSkills, setFormPreferredSkills] = useState('Docker, AWS, Redis');
  const [formDeadline, setFormDeadline] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Delete Confirmation State
  const [deletingJobId, setDeletingJobId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const loadedJobs = await getAllJobs();
      setJobs(loadedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setErrorMsg('Failed to load job listings. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJobId(null);
    setFormTitle('');
    setFormCompany('');
    setFormLocation('Austin, TX');
    setFormWorkMode('REMOTE');
    setFormSalaryMin(110000);
    setFormSalaryMax(150000);
    setFormExperienceRequired(2);
    setFormDescription('');
    setFormRequiredSkills('Java, Spring Boot, PostgreSQL, Git');
    setFormPreferredSkills('Docker, AWS, CI/CD');

    // Default deadline 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormDeadline(d.toISOString().split('T')[0]);
    setFormActive(true);

    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJobId(job.id);
    setFormTitle(job.title || '');
    setFormCompany(job.company || '');
    setFormLocation(job.location || '');
    setFormWorkMode(job.workMode || 'REMOTE');
    setFormSalaryMin(job.salaryMin || 0);
    setFormSalaryMax(job.salaryMax || 0);
    setFormExperienceRequired(job.experienceRequired || 0);
    setFormDescription(job.description || '');
    setFormRequiredSkills(Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '');
    setFormPreferredSkills(Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : '');

    // Format deadline to YYYY-MM-DD for date input
    if (job.deadline?.toDate) {
      setFormDeadline(job.deadline.toDate().toISOString().split('T')[0]);
    } else if (typeof job.deadline === 'string') {
      setFormDeadline(job.deadline.split('T')[0]);
    } else {
      setFormDeadline('');
    }

    setFormActive(job.active !== false);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!formTitle || !formCompany || !formDescription) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (Number(formSalaryMin) > Number(formSalaryMax)) {
      setErrorMsg('Minimum salary cannot exceed maximum salary.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const reqSkillsArray = formRequiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const prefSkillsArray = formPreferredSkills.split(',').map(s => s.trim()).filter(Boolean);

      const jobPayload = {
        title: formTitle.trim(),
        company: formCompany.trim(),
        location: formLocation.trim(),
        workMode: formWorkMode,
        salaryMin: Number(formSalaryMin),
        salaryMax: Number(formSalaryMax),
        experienceRequired: Number(formExperienceRequired),
        description: formDescription.trim(),
        requiredSkills: reqSkillsArray,
        preferredSkills: prefSkillsArray,
        deadline: formDeadline || null,
        active: formActive,
        createdBy: currentUser?.uid || 'admin'
      };

      if (editingJobId) {
        // Edit existing job
        await updateJob(editingJobId, jobPayload);
        setSuccessMsg(`Job "${formTitle}" updated successfully!`);
      } else {
        // Create new job
        await createJob(jobPayload);
        setSuccessMsg(`New job "${formTitle}" created successfully!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      setErrorMsg('Failed to save job changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = !(job.active !== false);
    try {
      await updateJob(job.id, { active: newStatus });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, active: newStatus } : j));
      setSuccessMsg(`Job "${job.title}" marked as ${newStatus ? 'Active' : 'Archived'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setErrorMsg('Could not update job status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingJobId) return;
    try {
      await deleteJob(deletingJobId);
      setJobs(jobs.filter(j => j.id !== deletingJobId));
      setDeletingJobId(null);
      setSuccessMsg('Job posting permanently deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to delete job:', err);
      setErrorMsg('Failed to delete job posting.');
    }
  };

  // Filtered job list
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && job.active !== false) ||
      (statusFilter === 'ARCHIVED' && job.active === false);

    return matchesSearch && matchesStatus;
  });

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
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Manage Job Postings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Create, edit, toggle active status, and remove positions visible to candidates.
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <PlusCircle size={18} />
            Post New Job
          </button>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search & Status Filter Bar */}
        <div className="glass-card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="input-field"
                placeholder="Filter by title, company, or required skill..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
              <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            </div>

            <div style={{ width: 180 }}>
              <select
                className="input-field"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({jobs.length})</option>
                <option value="ACTIVE">Active Only ({jobs.filter(j => j.active !== false).length})</option>
                <option value="ARCHIVED">Archived Only ({jobs.filter(j => j.active === false).length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List Table */}
        {loading ? (
          <LoadingSpinner fullScreen message="Loading job listings..." />
        ) : filteredJobs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No job postings match your filters</h3>
            <p style={{ marginTop: 8 }}>Try clearing your search query or create a new job opening.</p>
            <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: 16 }}>
              <PlusCircle size={16} />
              Create First Job
            </button>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Job Title & Company</th>
                    <th>Location & Mode</th>
                    <th>Salary Range</th>
                    <th>Experience</th>
                    <th>Required Skills</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{job.company}</div>
                      </td>
                      <td>
                        <div>{job.location}</div>
                        <span className={`badge ${
                          job.workMode === 'REMOTE' ? 'badge-primary' :
                          job.workMode === 'HYBRID' ? 'badge-info' : 'badge-neutral'
                        }`} style={{ fontSize: '0.68rem' }}>
                          {job.workMode}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>
                        {job.experienceRequired}+ yrs
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
                          {job.requiredSkills?.slice(0, 3).map((s, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                          ))}
                          {job.requiredSkills?.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {job.deadline?.toDate
                          ? job.deadline.toDate().toLocaleDateString()
                          : typeof job.deadline === 'string' && job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : 'Open'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className={`badge ${job.active !== false ? 'badge-success' : 'badge-neutral'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle status"
                        >
                          {job.active !== false ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(job)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Job"
                            style={{ padding: '6px 10px' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingJobId(job.id)}
                            className="btn btn-outline btn-sm"
                            title="Delete Job"
                            style={{ color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 10px' }}
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

        {/* Create / Edit Job Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 36,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.45rem', marginBottom: 4 }}>
                    {editingJobId ? 'Edit Job Opening' : 'Post New Job Opening'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Configure all fields specified in PLAN.md Section 7.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ color: 'var(--text-secondary)', padding: 4 }}
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveJob}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Title */}
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      className="input-field"
                      placeholder="e.g. Senior Java Backend Engineer"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Company */}
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      className="input-field"
                      placeholder="e.g. FinTech Innovations Inc."
                      value={formCompany}
                      onChange={e => setFormCompany(e.target.value)}
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      className="input-field"
                      placeholder="e.g. New York, NY or Austin, TX"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      required
                    />
                  </div>

                  {/* Work Mode */}
                  <div className="form-group">
                    <label className="form-label">Work Mode *</label>
                    <select
                      className="input-field"
                      value={formWorkMode}
                      onChange={e => setFormWorkMode(e.target.value)}
                    >
                      <option value="REMOTE">REMOTE</option>
                      <option value="HYBRID">HYBRID</option>
                      <option value="ON_SITE">ON_SITE</option>
                    </select>
                  </div>

                  {/* Salary Min */}
                  <div className="form-group">
                    <label className="form-label">Minimum Salary ($ USD) *</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formSalaryMin}
                      onChange={e => setFormSalaryMin(e.target.value)}
                      required
                      min={0}
                      step={5000}
                    />
                  </div>

                  {/* Salary Max */}
                  <div className="form-group">
                    <label className="form-label">Maximum Salary ($ USD) *</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formSalaryMax}
                      onChange={e => setFormSalaryMax(e.target.value)}
                      required
                      min={0}
                      step={5000}
                    />
                  </div>

                  {/* Experience Required */}
                  <div className="form-group">
                    <label className="form-label">Years Experience Required *</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formExperienceRequired}
                      onChange={e => setFormExperienceRequired(e.target.value)}
                      required
                      min={0}
                    />
                  </div>

                  {/* Deadline */}
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formDeadline}
                      onChange={e => setFormDeadline(e.target.value)}
                    />
                  </div>
                </div>

                {/* Required Skills */}
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label className="form-label">Required Skills * (comma-separated, 60% match weight)</label>
                  <input
                    className="input-field"
                    placeholder="Java, Spring Boot, PostgreSQL, Microservices, Git"
                    value={formRequiredSkills}
                    onChange={e => setFormRequiredSkills(e.target.value)}
                    required
                  />
                </div>

                {/* Preferred Skills */}
                <div className="form-group">
                  <label className="form-label">Preferred Skills (comma-separated, 20% match weight)</label>
                  <input
                    className="input-field"
                    placeholder="Docker, Kubernetes, AWS, Redis, CI/CD"
                    value={formPreferredSkills}
                    onChange={e => setFormPreferredSkills(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Full Role Description *</label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Provide overview of the role, team context, and responsibilities..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Active Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 24px' }}>
                  <input
                    type="checkbox"
                    id="formActiveCheck"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="formActiveCheck" style={{ fontSize: '0.92rem', cursor: 'pointer', fontWeight: 500 }}>
                    Active Status (Candidate facing and included in recommendation matching)
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ minWidth: 140 }}
                  >
                    {submitting ? (
                      <span className="spinner" style={{ width: 18, height: 18 }}></span>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingJobId ? 'Save Changes' : 'Publish Job'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingJobId && (
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
            zIndex: 1100,
            padding: 20
          }}>
            <div className="glass-card" style={{ maxWidth: 440, padding: 32, textAlign: 'center' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Delete Job Posting?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                This action will permanently delete this job posting from Cloud Firestore. Candidates will no longer be matched to this position.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setDeletingJobId(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-danger"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
