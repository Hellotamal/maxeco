import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Code2, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../data/siteContent';

export default function HeroSection() {
  return (
    <section 
      style={{
        position: 'relative',
        paddingTop: '80px',
        paddingBottom: '90px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 80% 20%, rgba(158, 202, 214, 0.15) 0%, rgba(11, 19, 43, 0) 70%), var(--bg-primary)'
      }}
    >
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Core Value Proposition */}
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--soft-blue)',
                background: 'rgba(158, 202, 214, 0.12)',
                border: '1px solid rgba(158, 202, 214, 0.28)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '20px'
              }}
            >
              <MapPin size={15} />
              <span>Guwahati, Assam &amp; Northeast India</span>
            </div>

            <h1 
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '20px'
              }}
            >
              Smarter Energy.{' '}
              <span 
                style={{
                  background: 'linear-gradient(135deg, var(--soft-blue) 0%, var(--muted-indigo) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Stronger Digital Growth.
              </span>
            </h1>

            <p 
              style={{
                fontSize: '1.1875rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: '28px',
                maxWidth: '620px'
              }}
            >
              {siteConfig.supportingStatement}
            </p>

            {/* Dual CTAs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <Link to="/clean-energy" className="btn btn-primary">
                <Sun size={18} />
                <span>Clean Energy Advisory</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/digital-growth" className="btn btn-secondary">
                <Code2 size={18} />
                <span>Digital Growth &amp; IT</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--energy-green)" />
                <span>APDCL Net-Metering Aligned</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--energy-green)" />
                <span>Custom React Architecture</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--energy-green)" />
                <span>Data-Backed Engineering</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dual-Division Feature Showcase */}
          <div style={{ position: 'relative' }}>
            <div 
              className="card"
              style={{
                padding: '24px',
                border: '1px solid rgba(158, 202, 214, 0.3)',
                boxShadow: 'var(--shadow-pastel)',
                background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-card) 100%)'
              }}
            >
              {/* Feature 1: Clean Energy Pillar */}
              <div 
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div 
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--solar-amber)',
                    flexShrink: 0
                  }}
                >
                  <Sun size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--solar-amber)', letterSpacing: '0.05em' }}>
                    Division A • Sustainable Power
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '4px 0 6px 0' }}>
                    Commercial Rooftop Solar &amp; Net-Metering
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Feasibility analysis, load profiling, and APDCL regulatory coordination to lower commercial power bills across Assam.
                  </p>
                </div>
              </div>

              {/* Feature 2: Digital Growth Pillar */}
              <div 
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div 
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(158, 202, 214, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--soft-blue)',
                    flexShrink: 0
                  }}
                >
                  <Code2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', letterSpacing: '0.05em' }}>
                    Division B • Modern Technology
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '4px 0 6px 0' }}>
                    Corporate Web &amp; Digital Solutions
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    Custom, lightning-fast multi-page websites engineered for regional enterprise credibility and organic Northeast search traffic.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Callout */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <span>Have an electricity bill or website project in mind?</span>
                <Link to="/contact" style={{ color: 'var(--soft-blue)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Consult</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
