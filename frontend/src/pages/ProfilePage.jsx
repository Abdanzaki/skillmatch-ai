import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/firestoreService';
import { User, Mail, Phone, MapPin, Briefcase, CheckCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [preferredWorkMode, setPreferredWorkMode] = useState('HYBRID');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || '');
      setPhone(userProfile.phone || '');
      setLocation(userProfile.location || '');
      setBio(userProfile.bio || '');
      setPreferredWorkMode(userProfile.preferredWorkMode || 'HYBRID');
      setPreferredRoles(userProfile.preferredRoles ? userProfile.preferredRoles.join(', ') : '');
    }
  }, [userProfile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSaving(true);
      const updatedData = {
        displayName,
        phone,
        location,
        bio,
        preferredWorkMode,
        preferredRoles: preferredRoles.split(',').map(r => r.trim()).filter(Boolean)
      };

      await updateUserProfile(currentUser.uid, updatedData);
      await refreshUserProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Candidate Profile</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your personal information, contact methods, and career preferences.
            </p>
          </div>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="glass-card">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="displayName">Full Name</label>
                  <input
                    id="displayName"
                    type="text"
                    className="input-field"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    value={currentUser?.email || ''}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    className="input-field"
                    placeholder="City, State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  className="input-field"
                  placeholder="Summary of your background and career interests..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="workMode">Preferred Work Mode</label>
                  <select
                    id="workMode"
                    className="input-field"
                    value={preferredWorkMode}
                    onChange={(e) => setPreferredWorkMode(e.target.value)}
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                    <option value="ANY">Any / Open</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="preferredRoles">Target Job Titles (comma separated)</label>
                  <input
                    id="preferredRoles"
                    type="text"
                    className="input-field"
                    placeholder="Full Stack Developer, Java Backend..."
                    value={preferredRoles}
                    onChange={(e) => setPreferredRoles(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? (
                    <span className="spinner" style={{ width: 18, height: 18 }}></span>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
