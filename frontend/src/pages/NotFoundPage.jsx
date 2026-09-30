import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - var(--navbar-height) - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{ maxWidth: 480, padding: '48px 32px' }}>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          lineHeight: 1,
          marginBottom: 16
        }} className="gradient-text">
          404
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem' }}>
          The page or matching resource you are looking for does not exist or has been relocated.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
