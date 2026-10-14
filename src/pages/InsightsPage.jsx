import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, X, Share2, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import { insightsData } from '../data/siteContent';

export default function InsightsPage() {
  const [activeArticle, setActiveArticle] = useState(null);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "MaxEco Energy & Tech Insights",
    "description": "Technical resources on commercial solar power in Assam, APDCL net-metering, and digital web engineering."
  };

  return (
    <>
      <SEO
        title="Insights & Engineering Resources"
        description="Technical guides on commercial solar power in Assam, APDCL net-metering regulations, and corporate web engineering for Northeast India."
        canonicalPath="/insights"
        schemaData={articleSchema}
      />

      {/* Hero Header */}
      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <span className="section-eyebrow">Technical Knowledge Base</span>
          <h1 className="section-title">Insights, Regulations &amp; Engineering Guides</h1>
          <p className="section-desc">
            Practical knowledge for business owners and facility managers in Assam: from navigating APDCL net-metering tariffs to engineering fast corporate web platforms.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section" style={{ paddingTop: '10px' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}
          >
            {insightsData.map((article) => (
              <article 
                key={article.id} 
                className="card"
                id={article.id}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge-soft-blue" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                    {article.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px' }}>
                  {article.title}
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
                  {article.excerpt}
                </p>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '16px',
                    marginTop: 'auto'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>{article.date}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                    aria-label={`Read full article: ${article.title}`}
                  >
                    <span>Read Guide</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 19, 43, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveArticle(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-article-title"
        >
          <div 
            className="card"
            style={{
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              position: 'relative',
              padding: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              aria-label="Close article modal"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span className="badge-soft-blue" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                {activeArticle.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeArticle.readTime} • Published {activeArticle.date}
              </span>
            </div>

            <h2 id="modal-article-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.3 }}>
              {activeArticle.title}
            </h2>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                MaxEco Energy &amp; Tech Engineering Desk • Guwahati, Assam
              </span>
              <Link 
                to="/contact" 
                className="btn btn-primary"
                style={{ fontSize: '0.8125rem' }}
                onClick={() => setActiveArticle(null)}
              >
                <span>Discuss Your Facility Requirement</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Box */}
      <section className="section" style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
            Have a Question Not Covered Here?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Our technical team is available to review your project parameters, APDCL tariff category, or digital requirements directly.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Connect with an Engineer</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
