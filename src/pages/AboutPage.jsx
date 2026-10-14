import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Target, HeartHandshake, MapPin, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { siteConfig } from '../data/siteContent';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About MaxEco Energy & Tech"
        description="Learn about MaxEco Energy & Tech, an independent clean energy advisory and digital engineering firm headquartered in Guwahati, Assam."
        canonicalPath="/about"
      />

      {/* Page Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="section-eyebrow">About MaxEco Energy &amp; Tech</span>
          <h1 className="section-title">Independent Engineering &amp; Modern Technology for Northeast India</h1>
          <p className="section-desc">
            Headquartered in Guwahati, Assam, MaxEco Energy &amp; Tech was founded to bring transparent, data-driven engineering advisory to clean energy adoption and corporate digital infrastructure.
          </p>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
              marginBottom: '64px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', letterSpacing: '0.05em' }}>
                Our Mission
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 16px 0' }}>
                Bridging Sustainable Energy &amp; Digital Infrastructure
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                In growing economic hubs like Guwahati, Jorhat, Dibrugarh, and Silchar, commercial enterprises face rising electricity tariffs and the need to compete digitally on a national scale.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '24px' }}>
                We believe enterprises should never have to deal with biased vendor pushiness or cookie-cutter website templates. We act as an independent technical advocate, evaluating solar feasibility purely on engineering physics and financial payback, while building bespoke corporate web architectures that command trust.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/clean-energy" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                  <span>Explore Solar Advisory</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/contact" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                  <span>Contact Our Team</span>
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: '36px', background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
                Core Operating Principles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <ShieldCheck size={22} color="var(--energy-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9375rem', marginBottom: '2px' }}>
                      Data-Backed &amp; Unbiased
                    </strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      We do not inflate solar generation figures or promise unrealistic paybacks. Every number is calibrated to real Northeast irradiation and APDCL tariff slabs.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <Target size={22} color="var(--soft-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9375rem', marginBottom: '2px' }}>
                      Bespoke Software Craftsmanship
                    </strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      We write semantic, accessible React codebases from the ground up, guaranteeing high performance, zero plugin bloat, and enterprise-grade security.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <HeartHandshake size={22} color="var(--solar-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9375rem', marginBottom: '2px' }}>
                      Regional Northeast Commitment
                    </strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Based right in Maligaon, Guwahati, we understand local grid conditions, monsoon weather patterns, and regional business requirements first-hand.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Reach */}
          <div className="card" style={{ padding: '36px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(158, 202, 214, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--soft-blue)',
                margin: '0 auto 16px auto'
              }}
            >
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '12px' }}>
              Service Footprint: Assam &amp; Northeast India
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 20px auto' }}>
              We consult for commercial facilities, educational institutions, clinics, and offices across Guwahati (Kamrup Metropolitan), Lower Assam, Upper Assam industrial districts, and neighboring states across Northeast India.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>• Kamrup Metro (Guwahati)</span>
              <span>• Dibrugarh &amp; Tinsukia</span>
              <span>• Jorhat &amp; Golaghat</span>
              <span>• Silchar &amp; Cachar</span>
              <span>• Shillong &amp; Meghalaya</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
