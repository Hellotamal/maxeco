import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Sun, Code2, Factory, GraduationCap, Stethoscope, ShoppingBag, Briefcase, Landmark } from 'lucide-react';
import SEO from '../components/SEO';
import { industriesData } from '../data/siteContent';

export default function IndustriesPage() {
  const icons = [Building2, ShoppingBag, GraduationCap, Stethoscope, Factory, Briefcase];

  return (
    <>
      <SEO
        title="Industries We Serve — Commercial Energy & Digital Solutions"
        description="Tailored solar energy feasibility and custom digital web solutions for offices, healthcare, hospitality, education, and manufacturing in Assam."
        canonicalPath="/industries"
      />

      {/* Hero Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="section-eyebrow">Sector-Specific Solutions</span>
          <h1 className="section-title">Commercial Sectors &amp; Facilities We Support</h1>
          <p className="section-desc">
            We adapt solar engineering feasibility models and bespoke digital platforms to the distinct operational, tariff, and customer profiles of organizations across Northeast India.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="section" style={{ paddingTop: '10px' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px'
            }}
          >
            {industriesData.map((item, index) => {
              const IconComponent = icons[index % icons.length];

              return (
                <div 
                  key={item.id} 
                  className="card"
                  id={item.id}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
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
                      <IconComponent size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {item.title}
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                    {item.desc}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--solar-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sun size={14} />
                        <span>Solar Power Application</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.solarImpact}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Code2 size={14} />
                        <span>Digital Platform Impact</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.digitalImpact}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section" style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            Discuss Your Facility's Energy &amp; Digital Blueprint
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Connect with our engineering desk for an industry-specific analysis based on your operating hours, roof space, and customer engagement objectives.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Schedule Industry Consultation</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
