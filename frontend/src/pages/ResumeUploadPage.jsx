import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function ResumeUploadPage() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selected) => {
    setErrorMessage('');
    if (!selected) return false;
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selected.type) && !selected.name.endsWith('.pdf')) {
      setErrorMessage('Unsupported file format. Please upload a PDF document.');
      return false;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (validateFile(dropped)) {
        setFile(dropped);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatusMessage('Uploading and encrypting resume in Cloud Storage...');

    try {
      // Simulation of upload progress (real cloud storage integration in step 4-5)
      setUploadProgress(40);
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(85);
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(100);
      setStatusMessage('Resume uploaded successfully. Ready for AI parsing.');
      setTimeout(() => {
        navigate('/resume/analysis');
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Resume Upload & Analysis</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Upload your latest resume (PDF format) to unlock AI skill extraction and precision job compatibility.
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{statusMessage}</span>
            </div>
          )}

          <div
            className="glass-card"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              border: dragActive ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-default)',
              background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-glass-card)',
              cursor: 'pointer',
              marginBottom: 28,
              transition: 'all 0.2s ease'
            }}
            onClick={() => document.getElementById('resume-file-input').click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleChange}
            />

            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <UploadCloud size={36} />
            </div>

            {file ? (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
                  <FileText size={20} />
                  <span>{file.name}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Drag and drop your resume PDF here</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                  or click to browse files from your computer (Max 10MB)
                </p>
                <span className="btn btn-outline btn-sm">Select PDF File</span>
              </div>
            )}
          </div>

          {file && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="btn btn-secondary"
                disabled={uploading}
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn btn-primary"
                style={{ minWidth: 160 }}
              >
                {uploading ? (
                  <span className="spinner" style={{ width: 18, height: 18 }}></span>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Process with AI
                  </>
                )}
              </button>
            </div>
          )}

          <div style={{
            marginTop: 40,
            padding: '20px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Security & Data Privacy</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your resumes are stored securely inside your private Firebase Cloud Storage bucket. Storage paths are never leaked to client responses, and access is enforced strictly per candidate UID.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
