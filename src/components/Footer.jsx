import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Phone, Mail, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../data/siteContent';

export default function Footer() {
  return (
    <footer 
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '64px',
        paddingBottom: '32px',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--soft-blue) 0%, var(--muted-indigo) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B132B'
                }}
              >
                <Zap size={20} strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                {siteConfig.name}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '20px' }}>
              {siteConfig.supportingStatement}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
                aria-label="Direct WhatsApp Enquiry"
              >
                <MessageSquare size={15} color="var(--energy-green)" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Col 2: Clean Energy Division */}
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--soft-blue)', marginBottom: '16px' }}>
              Clean Energy Advisory
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/clean-energy" style={{ color: 'var(--text-secondary)' }}>
                  Rooftop Solar Assessment
                </Link>
              </li>
              <li>
                <Link to="/clean-energy" style={{ color: 'var(--text-secondary)' }}>
                  APDCL Net-Metering Support
                </Link>
              </li>
              <li>
                <Link to="/clean-energy" style={{ color: 'var(--text-secondary)' }}>
                  Commercial Electricity-Cost Analysis
                </Link>
              </li>
              <li>
                <Link to="/clean-energy" style={{ color: 'var(--text-secondary)' }}>
                  Solar O&amp;M Maintenance AMC
                </Link>
              </li>
              <li>
                <Link to="/clean-energy#calculator" style={{ color: 'var(--text-secondary)' }}>
                  Solar Savings Estimator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Digital Growth Division */}
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--soft-blue)', marginBottom: '16px' }}>
              Digital Growth &amp; IT
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/digital-growth" style={{ color: 'var(--text-secondary)' }}>
                  Corporate Website Design
                </Link>
              </li>
              <li>
                <Link to="/digital-growth" style={{ color: 'var(--text-secondary)' }}>
                  Business Landing Pages
                </Link>
              </li>
              <li>
                <Link to="/digital-growth" style={{ color: 'var(--text-secondary)' }}>
                  Northeast Local SEO Setup
                </Link>
              </li>
              <li>
                <Link to="/digital-growth" style={{ color: 'var(--text-secondary)' }}>
                  Speed &amp; Accessibility Audits
                </Link>
              </li>
              <li>
                <Link to="/digital-growth" style={{ color: 'var(--text-secondary)' }}>
                  IT Networking Infrastructure
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Registered Regional Office */}
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--soft-blue)', marginBottom: '16px' }}>
              Regional Office
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={17} style={{ color: 'var(--soft-blue)', flexShrink: 0, marginTop: '2px' }} />
                <span>{siteConfig.location}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={17} style={{ color: 'var(--soft-blue)', flexShrink: 0 }} />
                <a href={`tel:${siteConfig.phoneClean}`} style={{ color: 'inherit' }}>
                  {siteConfig.phone}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={17} style={{ color: 'var(--soft-blue)', flexShrink: 0 }} />
                <a href={`mailto:${siteConfig.email}`} style={{ color: 'inherit' }}>
                  {siteConfig.email}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={17} style={{ color: 'var(--soft-blue)', flexShrink: 0, marginTop: '2px' }} />
                <span>{siteConfig.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div 
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Guwahati, Assam, India.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/about" style={{ color: 'inherit' }}>About</Link>
            <Link to="/industries" style={{ color: 'inherit' }}>Industries</Link>
            <Link to="/projects" style={{ color: 'inherit' }}>Projects</Link>
            <Link to="/insights" style={{ color: 'inherit' }}>Insights</Link>
            <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
