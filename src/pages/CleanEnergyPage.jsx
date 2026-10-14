import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, CheckCircle, ArrowRight, ShieldAlert, Cpu, BarChart3, Wrench, FileCheck, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import SolarCalculatorSection from '../sections/SolarCalculatorSection';
import { divisionA } from '../data/siteContent';

export default function CleanEnergyPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Commercial Clean Energy Advisory & Rooftop Solar Consultation",
    "provider": {
      "@type": "LocalBusiness",
      "name": "MaxEco Energy & Tech"
    },
    "areaServed": "Assam, Northeast India",
    "description": "Engineering feasibility, shadow analysis, APDCL net-metering coordination, and commercial solar advisory in Guwahati."
  };

  return (
    <>
      <SEO
        title="Clean Energy Advisory & Commercial Rooftop Solar"
        description="Independent commercial rooftop solar advisory, APDCL net-metering coordination, and electricity cost optimization across Guwahati and Assam."
        canonicalPath="/clean-energy"
        schemaData={serviceSchema}
      />

      {/* Hero Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="section-eyebrow">Division A • Sustainable Power Engineering</span>
          <h1 className="section-title">Commercial Rooftop Solar &amp; Clean Energy Advisory</h1>
          <p className="section-desc">
            Helping commercial enterprises, hospitals, institutions, and industrial plants across Guwahati and Assam transition to reliable, grid-interactive rooftop solar with transparent engineering data.
          </p>
        </div>
      </section>

      {/* Clear Scope Disclaimer Alert */}
      <div className="container" style={{ marginBottom: '40px' }}>
        <div 
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}
        >
          <ShieldAlert size={20} color="var(--solar-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--solar-amber)', display: 'block', marginBottom: '2px' }}>
              Important Advisory Boundary &amp; Regulatory Clarification
            </strong>
            MaxEco Energy &amp; Tech provides independent engineering feasibility assessments, single-line diagrams, technical vendor evaluations, and APDCL documentation coordination. We do not manufacture panels or act as an electricity distribution utility. All net-metering approvals and subsidy disbursements are governed strictly by APDCL, CEIG, and MNRE statutory authorities following on-site utility inspections.
          </div>
        </div>
      </div>

      {/* Detailed Service Subsections */}
      <section className="section" style={{ paddingTop: '10px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {divisionA.services.map((service, index) => {
              const icons = [Sun, BarChart3, Layers, FileCheck, Wrench];
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
                        background: 'rgba(245, 158, 11, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--solar-amber)',
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
                      <span>Enquire About This Scope</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', marginBottom: '12px' }}>
                      Engineering Deliverables Included:
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

      {/* Embedded Solar ROI Calculator */}
      <SolarCalculatorSection id="calculator" />

      {/* CTA Box */}
      <section className="section" style={{ textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready for a Verified Commercial Site Audit?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Send us your latest APDCL electricity bill and building address. We will prepare an initial capacity and shadow-gradient model for your review.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Book Solar Feasibility Assessment</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
