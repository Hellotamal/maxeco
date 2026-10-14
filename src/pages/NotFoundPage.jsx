import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Sun, Code2, Phone } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 — Page Not Found"
        description="The requested page could not be located on the MaxEco Energy & Tech portal."
        canonicalPath="/404"
      />

      <section 
        className="section"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingTop: '60px',
          paddingBottom: '80px'
        }}
      >
        <div className="container" style={{ maxWidth: '640px' }}>
          <div 
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(5rem, 12vw, 8rem)',
              fontWeight: 800,
              color: 'var(--soft-blue)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginBottom: '16px'
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
            Page Not Found
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            The URL you requested does not exist on our corporate platform. Use the navigation links below to return to our primary engineering and technology portals.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <Link to="/" className="btn btn-primary">
              <Home size={17} />
              <span>Return to Homepage</span>
            </Link>
            <Link to="/clean-energy" className="btn btn-secondary">
              <Sun size={17} color="var(--solar-amber)" />
              <span>Clean Energy Advisory</span>
            </Link>
            <Link to="/digital-growth" className="btn btn-secondary">
              <Code2 size={17} color="var(--soft-blue)" />
              <span>Digital Growth &amp; IT</span>
            </Link>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Need direct assistance? Call our Guwahati desk at <a href="tel:+919954493909" style={{ color: 'var(--soft-blue)' }}>+91 99544 93909</a>
          </div>
        </div>
      </section>
    </>
  );
}
