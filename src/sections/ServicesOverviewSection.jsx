import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sun, Code, ShieldCheck, Zap } from 'lucide-react';
import { divisionA, divisionB } from '../data/siteContent';

export default function ServicesOverviewSection() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Integrated Capabilities</span>
          <h2 className="section-title">Two Specialized Divisions. One High-Standard Partner.</h2>
          <p className="section-desc">
            We provide practical, engineering-led clean energy consulting and bespoke digital platforms designed specifically for commercial organizations in Northeast India.
          </p>
        </div>

        {/* Division A Block */}
        <div style={{ marginBottom: '64px' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div>
              <span className="badge-soft-blue" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, textTransform: 'uppercase' }}>
                {divisionA.eyebrow}
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>
                {divisionA.title}
              </h3>
            </div>
            <Link to="/clean-energy" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              <span>View All Solar Services</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}
          >
            {divisionA.services.slice(0, 3).map((service) => (
              <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--solar-amber)',
                    marginBottom: '16px'
                  }}
                >
                  <Sun size={20} />
                </div>
                <h4 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px' }}>
                  {service.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                  {service.desc}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {service.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color="var(--energy-green)" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Division B Block */}
        <div>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div>
              <span className="badge-blush-pink" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, textTransform: 'uppercase' }}>
                {divisionB.eyebrow}
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>
                {divisionB.title}
              </h3>
            </div>
            <Link to="/digital-growth" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              <span>View All Digital Solutions</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}
          >
            {divisionB.services.slice(0, 3).map((service) => (
              <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(158, 202, 214, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--soft-blue)',
                    marginBottom: '16px'
                  }}
                >
                  <Code size={20} />
                </div>
                <h4 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px' }}>
                  {service.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                  {service.desc}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {service.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color="var(--energy-green)" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
