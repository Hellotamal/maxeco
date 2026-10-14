import React from 'react';
import { Link } from 'react-router-dom';
import { Code, CheckCircle, ArrowRight, Gauge, Search, ShieldCheck, Server, Smartphone, Laptop } from 'lucide-react';
import SEO from '../components/SEO';
import { divisionB } from '../data/siteContent';

export default function DigitalGrowthPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Corporate Website Development & Digital Technology Solutions",
    "provider": {
      "@type": "LocalBusiness",
      "name": "MaxEco Energy & Tech"
    },
    "areaServed": "Guwahati, Assam, Northeast India",
    "description": "Custom modern React corporate websites, Core Web Vitals optimization, and Northeast India local search SEO foundations."
  };

  return (
    <>
      <SEO
        title="Digital Growth & Technology Solutions"
        description="Custom corporate web design, Northeast local SEO, and IT infrastructure advisory for growing enterprises in Guwahati, Assam."
        canonicalPath="/digital-growth"
        schemaData={serviceSchema}
      />

      {/* Hero Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="section-eyebrow">Division B • Modern Digital Engineering</span>
          <h1 className="section-title">Corporate Web Platforms &amp; IT Solutions</h1>
          <p className="section-desc">
            We build blazing-fast, accessible corporate websites and reliable digital infrastructure that help businesses across Assam and Northeast India establish unshakeable commercial credibility.
          </p>
        </div>
      </section>

      {/* Why Custom Web Engineering Matters */}
      <section className="section" style={{ paddingTop: '10px', paddingBottom: '40px' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}
          >
            <div className="card" style={{ padding: '28px' }}>
              <Gauge size={28} color="var(--soft-blue)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '8px' }}>
                Sub-Second Core Web Vitals
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                We eliminate sluggish page builders and bloated scripts. Our React architectures load near-instantly on regional mobile 4G/5G networks.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <Search size={28} color="var(--energy-green)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '8px' }}>
                Guwahati Local Search Authority
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Every page is built with semantic HTML5, verified Schema.org JSON-LD tags, and canonical links tailored to regional commercial search intent.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <ShieldCheck size={28} color="var(--solar-amber)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '8px' }}>
                Zero Plugin Vulnerabilities
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                By avoiding vulnerable third-party CMS plugins, your corporate web presence remains rock-solid, secure, and impervious to automated bot attacks.
              </p>
            </div>
          </div>

          {/* Detailed Service Subsections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {divisionB.services.map((service, index) => {
              const icons = [Laptop, Smartphone, Search, Gauge, Server];
              const IconComponent = icons[index % icons.length];

              return (
                <div 
                  key={service.id} 
                  className="card"
                  id={service.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '32px',
                    alignItems: 'center'
                  }}
                >
                  <div>
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
                        marginBottom: '16px'
                      }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '12px' }}>
                      {service.title}
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                      {service.desc}
                    </p>
                    <Link to="/contact" className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
                      <span>Enquire About This Service</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', marginBottom: '12px' }}>
                      Technical Standards Guaranteed:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                      {service.features.map((feature, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle size={16} color="var(--energy-green)" style={{ flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-primary)' }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Web Development Delivery Roadmap */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">From Concept to Deployment</span>
            <h2 className="section-title">Our Web Engineering Methodology</h2>
            <p className="section-desc">
              How we take your business from legacy or non-existent web presence to an enterprise-grade digital flagship.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soft-blue)', marginBottom: '8px' }}>01</div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '8px' }}>Architecture &amp; Copy Audit</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                We structure your service offerings, craft clear business copy for regional decision-makers, and map high-intent keyword targets.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soft-blue)', marginBottom: '8px' }}>02</div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '8px' }}>Design System &amp; Tokens</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                We define accessible color palettes, typography, interactive states, and responsive breakpoints tailored to your corporate brand identity.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soft-blue)', marginBottom: '8px' }}>03</div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '8px' }}>React Component Assembly</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Clean code execution with reusable components, client-side routing, anti-spam honeypot forms, and dynamic SEO meta tags.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soft-blue)', marginBottom: '8px' }}>04</div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '8px' }}>Production Hardening</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Pre-release testing across 360px to 1920px viewports, WCAG 2.2 AA contrast checks, XML sitemaps, and secure hosting deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="section" style={{ textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            Elevate Your Corporate Digital Authority
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Let us evaluate your existing web presence or outline a brand new custom React platform tailored to your commercial growth goals.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Request Web Engineering Consultation</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
