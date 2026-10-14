import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sun, Code2, Users, FileText, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import HeroSection from '../sections/HeroSection';
import ServicesOverviewSection from '../sections/ServicesOverviewSection';
import SolarCalculatorSection from '../sections/SolarCalculatorSection';
import ProcessSection from '../sections/ProcessSection';
import FaqSection from '../sections/FaqSection';
import ContactSection from '../sections/ContactSection';
import { siteConfig, projectsData } from '../data/siteContent';

export default function HomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.canonicalUrl,
    "telephone": siteConfig.phone,
    "email": siteConfig.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Maligaon",
      "addressLocality": "Guwahati",
      "addressRegion": "Assam",
      "postalCode": "781011",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.1550",
      "longitude": "91.6880"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ]
  };

  return (
    <>
      <SEO
        title="Smarter Energy. Stronger Digital Growth."
        description="Practical clean energy advisory and digital solutions for commercial enterprises and growing businesses across Guwahati, Assam, and Northeast India."
        canonicalPath="/"
        schemaData={schema}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem & Solution Comparison */}
      <section className="section" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">The Regional Reality</span>
            <h2 className="section-title">Addressing Core Operating Challenges in Northeast India</h2>
            <p className="section-desc">
              Commercial businesses in Assam face rising grid power tariffs and the pressure to build credible digital channels. Here is how we bridge both needs with practical engineering.
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}
          >
            {/* Energy Challenge & Solution */}
            <div className="card" style={{ borderLeft: '4px solid var(--solar-amber)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sun size={22} color="var(--solar-amber)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Energy Operating Cost Challenge</h3>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                Commercial enterprises face APDCL electricity tariffs of ₹7.65–₹8.90 per unit, while rooftop space remains an unmonetized dead asset. Navigating APDCL net-metering approvals and vendor specifications often stalls adoption.
              </p>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--soft-blue)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Our Advisory Solution
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  We provide rigorous shadow-gradient modeling, single-line diagrams, APDCL bi-directional net-metering coordination, and unbiased Tier-1 hardware specification.
                </div>
              </div>
            </div>

            {/* Digital Challenge & Solution */}
            <div className="card" style={{ borderLeft: '4px solid var(--soft-blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Code2 size={22} color="var(--soft-blue)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Digital Authority Challenge</h3>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                Many regional businesses rely on static social media handles or bloated, slow WordPress templates that fail to rank in Guwahati search results and lack credibility with corporate partners.
              </p>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--soft-blue)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Our Digital Solution
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  We engineer custom React web platforms with sub-second load times, WCAG 2.2 accessibility, Northeast local SEO schemas, and verified contact channels.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <ServicesOverviewSection />

      {/* Process Section */}
      <ProcessSection />

      {/* Selected Verified Technical Work Showcase */}
      <section className="section">
        <div className="container">
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '40px'
            }}
          >
            <div>
              <span className="section-eyebrow">Technical Capability Showcase</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Selected Engineering Concepts &amp; Scope</h2>
            </div>
            <Link to="/projects" className="btn btn-secondary">
              <span>View All Project Layouts</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}
          >
            {projectsData.slice(0, 2).map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-soft-blue" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</span>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                  {item.summary}
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', marginBottom: '8px' }}>
                    Key Deliverables:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {item.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="var(--energy-green)" style={{ flexShrink: 0 }} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Solar Calculator */}
      <SolarCalculatorSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Direct Contact & Consultation Section */}
      <ContactSection />
    </>
  );
}
