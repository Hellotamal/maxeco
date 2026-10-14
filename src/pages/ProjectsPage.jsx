import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Layers, Award } from 'lucide-react';
import SEO from '../components/SEO';
import { projectsData } from '../data/siteContent';

export default function ProjectsPage() {
  return (
    <>
      <SEO
        title="Projects & Engineering Scope Showcase"
        description="Review engineering feasibility blueprints, corporate web architecture case studies, and structured IT scopes delivered by MaxEco Energy & Tech."
        canonicalPath="/projects"
      />

      {/* Hero Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="section-eyebrow">Technical Execution Standards</span>
          <h1 className="section-title">Projects &amp; Engineering Scope Showcase</h1>
          <p className="section-desc">
            We hold ourselves to strict verification standards. Below are detailed blueprints, technical scopes, and architecture case studies illustrating our engineering methodology.
          </p>
        </div>
      </section>

      {/* Verification Notice */}
      <div className="container" style={{ marginBottom: '40px' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}
        >
          <ShieldCheck size={20} color="var(--energy-green)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Commitment to Transparency:</strong> We do not publish fabricated client testimonials, fake stock portraits, or unverified statistical claims. Each project showcased below represents verified technical engineering specifications developed for commercial deployment in Northeast India.
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="section" style={{ paddingTop: '10px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {projectsData.map((project) => (
              <div 
                key={project.id} 
                className="card"
                id={project.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '32px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="badge-soft-blue" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                      {project.category}
                    </span>
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(158, 202, 214, 0.1)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '10px' }}>
                    {project.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--soft-blue)', marginBottom: '16px' }}>
                    <MapPin size={15} />
                    <span>{project.location}</span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {project.summary}
                  </p>
                  <Link to="/contact" className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
                    <span>Request Similar Scope Evaluation</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)', marginBottom: '12px' }}>
                    Engineering Specifications &amp; Highlights:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                    {project.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <CheckCircle2 size={16} color="var(--energy-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="section" style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            Commission an Independent Technical Blueprint
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Have a commercial site or a corporate digital portal requirement? Contact our Guwahati engineering desk for an evidence-backed proposal.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Initiate Project Consultation</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
