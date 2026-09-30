import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 4 }}></div>
        <p style={{ marginTop: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
      <div className="spinner"></div>
      {message && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</span>}
    </div>
  );
}
