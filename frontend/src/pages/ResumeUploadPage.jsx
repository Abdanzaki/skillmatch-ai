import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { uploadResumeFile } from '../services/storageService';
import { createResumeRecord } from '../services/firestoreService';
import { parseResume } from '../services/functionsService';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function ResumeUploadPage() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(''); // 'validating' | 'uploading' | 'parsing' | 'complete'
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

  const validateAndSetFile = (selected) => {
    setErrorMessage('');
    if (!selected) return;

    const ext = selected.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'doc', 'docx'];
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validExts.includes(ext) && !validTypes.includes(selected.type)) {
      setErrorMessage('Unsupported file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setErrorMessage(`File is too large (${(selected.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 10MB.`);
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !currentUser) return;
    setUploading(true);
    setErrorMessage('');

    try {
      // Step 1: Upload to Cloud Storage
      setUploadStep('uploading');
      setStatusMessage('Encrypting and uploading resume document to Cloud Storage...');

      const uploadResult = await uploadResumeFile(currentUser.uid, file, (progress) => {
        setUploadProgress(progress);
      });

      // Step 2: Record metadata in Firestore resumes collection
      setStatusMessage('Creating document metadata record...');
      const resumeDoc = await createResumeRecord({
        userId: currentUser.uid,
        fileName: uploadResult.fileName,
        storagePath: uploadResult.storagePath,
        fileSizeBytes: uploadResult.fileSizeBytes,
        mimeType: uploadResult.mimeType,
        parsed: false
      });

      // Step 3: Call parseResume Python Cloud Function
      setUploadStep('parsing');
      setStatusMessage('Invoking AI entity extraction (pypdf & technical skill vocabulary)...');

      await parseResume({
        storagePath: uploadResult.storagePath,
        resumeId: resumeDoc.id,
        userId: currentUser.uid,
        fileName: uploadResult.fileName
      });

      // Step 4: Completion & Navigation
      setUploadStep('complete');
      setStatusMessage('Resume uploaded and parsed successfully! Redirecting to breakdown...');

      setTimeout(() => {
        navigate('/resume/analysis');
      }, 1200);
    } catch (err) {
      console.error('Error during resume processing pipeline:', err);
      setErrorMessage(err.message || 'Failed to process resume. Please verify your file and try again.');
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
              Upload your latest resume (PDF, DOC, or DOCX) to trigger AI extraction of skills, education, experience, and precision job matches.
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle size={20} style={{ flexShrink: 0 }} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
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
              cursor: uploading ? 'default' : 'pointer',
              marginBottom: 28,
              transition: 'all 0.2s ease'
            }}
            onClick={() => !uploading && document.getElementById('resume-file-input').click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={handleChange}
              disabled={uploading}
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
              {uploadStep === 'parsing' ? (
                <Cpu size={36} className="spinner" style={{ border: 'none', animation: 'spin 2s linear infinite' }} />
              ) : (
                <UploadCloud size={36} />
              )}
            </div>

            {file ? (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                  <FileText size={22} />
                  <span>{file.name}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                </p>

                {uploading && (
                  <div style={{ maxWidth: 360, margin: '20px auto 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span>{uploadStep === 'uploading' ? 'Uploading to Storage' : 'AI Analysis in Progress'}</span>
                      <span>{uploadStep === 'uploading' ? `${uploadProgress}%` : 'Processing...'}</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: uploadStep === 'parsing' || uploadStep === 'complete' ? '100%' : `${uploadProgress}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Drag and drop your resume PDF or Word document</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                  Supported formats: PDF, DOC, DOCX (Max file size: 10MB)
                </p>
                <span className="btn btn-outline btn-sm">Select Document File</span>
              </div>
            )}
          </div>

          {file && !uploading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => { setFile(null); setErrorMessage(''); setStatusMessage(null); }}
                className="btn btn-secondary"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                className="btn btn-primary"
                style={{ minWidth: 200 }}
              >
                <Sparkles size={18} />
                Upload & Analyze with AI
              </button>
            </div>
          )}

          {/* Privacy & Storage Isolation Notice */}
          <div style={{
            marginTop: 40,
            padding: '22px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16
          }}>
            <div style={{ color: '#34d399', marginTop: 2 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>Strict Data Privacy & Storage Isolation</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your resume document is stored in isolated Cloud Storage under your unique authentication identity.
                Storage paths and raw bucket URIs are never exposed in user responses. Extracted structured data is editable and can be updated at any time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
