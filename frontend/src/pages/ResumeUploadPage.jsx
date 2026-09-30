import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { extractTextFromDocument, validateResumeDocument } from '../services/pdfService';
import { parseResume } from '../services/functionsService';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileCheck
} from 'lucide-react';

export default function ResumeUploadPage() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(''); // 'extracting' | 'parsing' | 'complete'
  const [extractionProgress, setExtractionProgress] = useState(0);
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

  const handleFileSelection = (selected) => {
    setErrorMessage('');
    if (!selected) return;

    try {
      validateResumeDocument(selected);
      setFile(selected);
    } catch (err) {
      setErrorMessage(err.message);
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !currentUser) return;
    setProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: In-Browser PDF Text Extraction using pdfjs-dist
      setProcessingStep('extracting');
      setStatusMessage('Extracting text directly in your browser with PDF.js...');

      const extractedText = await extractTextFromDocument(file, (progress) => {
        setExtractionProgress(progress);
      });

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Very little text was found in the PDF. Please ensure the document is not an image-only scan.');
      }

      // Step 2: Send extracted text to Python Cloud Function for AI entity extraction
      setProcessingStep('parsing');
      setStatusMessage('Analyzing text, extracting technical competencies, and scoring profile...');

      await parseResume({
        text: extractedText,
        userId: currentUser.uid,
        fileName: file.name,
        fileSizeBytes: file.size
      });

      // Step 3: Complete & redirect to analysis page
      setProcessingStep('complete');
      setStatusMessage('Resume parsed and analyzed successfully! Redirecting to breakdown...');

      setTimeout(() => {
        navigate('/resume/analysis');
      }, 1000);
    } catch (err) {
      console.error('Error during client-side resume extraction & analysis:', err);
      setErrorMessage(err.message || 'Failed to process resume. Please ensure the file is a valid PDF and try again.');
    } finally {
      setProcessing(false);
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
              Upload your resume PDF (max 5MB). Text is extracted directly in your browser for speed, privacy, and precision AI matching.
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

          {/* Drag & Drop Zone */}
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
              cursor: processing ? 'default' : 'pointer',
              marginBottom: 28,
              transition: 'all 0.2s ease'
            }}
            onClick={() => !processing && document.getElementById('resume-file-input').click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              style={{ display: 'none' }}
              onChange={handleChange}
              disabled={processing}
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
              {processingStep === 'parsing' ? (
                <Cpu size={36} className="spinner" style={{ border: 'none', animation: 'spin 2s linear infinite' }} />
              ) : processingStep === 'extracting' ? (
                <FileCheck size={36} color="#38bdf8" />
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
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for in-browser extraction
                </p>

                {processing && (
                  <div style={{ maxWidth: 360, margin: '20px auto 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span>{processingStep === 'extracting' ? 'Extracting Text (PDF.js)' : 'AI Skill Analysis'}</span>
                      <span>{processingStep === 'extracting' ? `${extractionProgress}%` : 'Processing...'}</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: processingStep === 'parsing' || processingStep === 'complete' ? '100%' : `${extractionProgress}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Drag and drop your resume PDF here</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                  Supported formats: PDF (.pdf) or Text (.txt) — Maximum size 5MB
                </p>
                <span className="btn btn-outline btn-sm">Select PDF Document</span>
              </div>
            )}
          </div>

          {file && !processing && (
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
                Extract Text & Analyze
              </button>
            </div>
          )}

          {/* Privacy & Storage-Free Architecture Notice */}
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
              <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>Storage-Free & Client-Side Privacy</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your resume PDF is parsed directly in your web browser using <code>pdfjs-dist</code>. No raw binary files are stored in public or unencrypted storage buckets. Extracted text is analyzed to build your structured candidate profile in Cloud Firestore, and you can edit or remove it at any time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
