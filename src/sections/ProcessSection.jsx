import React from 'react';
import { processSteps } from '../data/siteContent';

export default function ProcessSection() {
  return (
    <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Structured Engagement</span>
          <h2 className="section-title">How We Deliver Engineering &amp; Technology Work</h2>
          <p className="section-desc">
            A transparent, milestone-driven working model ensuring every clean energy audit or digital deployment meets strict quality, safety, and performance standards.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {processSteps.map((step) => (
            <div 
              key={step.step}
              className="card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                paddingTop: '32px'
              }}
            >
              <div 
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--soft-blue)',
                  opacity: 0.7,
                  lineHeight: 1,
                  marginBottom: '16px'
                }}
              >
                {step.step}
              </div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
