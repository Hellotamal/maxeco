import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqsData } from '../data/siteContent';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Clarity &amp; Common Questions</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">
            Direct answers regarding commercial solar feasibility, APDCL net-metering in Assam, web development technologies, and project engagement.
          </p>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqsData.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const buttonId = `faq-btn-${index}`;

            return (
              <div 
                key={index} 
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderColor: isOpen ? 'var(--soft-blue)' : 'var(--border-color)',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <div 
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)',
                      color: isOpen ? 'var(--soft-blue)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {isOpen && (
                  <div 
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    style={{
                      padding: '0 24px 20px 24px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(158, 202, 214, 0.1)'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
