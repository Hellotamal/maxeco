import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare, Mail, Phone, MapPin, Clock, ArrowRight, Shield } from 'lucide-react';
import { siteConfig } from '../data/siteContent';
import { SERVICE_OPTIONS, validateEnquiryForm, submitEnquiry } from '../utils/formUtils';

export default function ContactSection({ id = "contact-form" }) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    phone: '',
    email: '',
    location: 'Guwahati, Assam',
    serviceInterest: SERVICE_OPTIONS[0],
    message: '',
    _honeypot: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validation
    const validation = validateEnquiryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const result = await submitEnquiry(formData);
      setSubmissionResult(result);
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
      setSubmissionResult({
        error: 'An unexpected transmission error occurred. Please use WhatsApp or email directly.'
      });
    }
  };

  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Direct Engineering Consultation</span>
          <h2 className="section-title">Initiate a Commercial Project Discussion</h2>
          <p className="section-desc">
            Submit your clean energy or digital requirements. Our Guwahati-based engineering team reviews every request and provides an initial technical evaluation within 4 business hours.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Direct Contact Info & Privacy Guarantee */}
          <div>
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                Corporate Contact Channels
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                Whether you need a commercial solar site survey in Kamrup Metro, an APDCL net-metering review, or a corporate web rebuild, contact our regional desk directly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(158, 202, 214, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft-blue)', flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)' }}>Registered Office</div>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '2px' }}>{siteConfig.location}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(158, 202, 214, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft-blue)', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)' }}>Direct Telephone</div>
                    <a href={`tel:${siteConfig.phoneClean}`} style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(158, 202, 214, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft-blue)', flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)' }}>Official Email</div>
                    <a href={`mailto:${siteConfig.email}`} style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                      {siteConfig.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(158, 202, 214, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft-blue)', flexShrink: 0 }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--soft-blue)' }}>Consultation Hours</div>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '2px' }}>{siteConfig.workingHours}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Anti-Spam Assurance Card */}
            <div 
              style={{
                display: 'flex',
                gap: '12px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}
            >
              <Shield size={20} color="var(--energy-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--energy-green)', display: 'block', marginBottom: '4px' }}>
                  Data Privacy &amp; Verification Protocol
                </strong>
                We only collect information required to evaluate your engineering requirements. Your details are never published, shared with third-party advertisers, or stored in insecure browser storage.
              </div>
            </div>
          </div>

          {/* Right Column: Verified Enquiry Form */}
          <div className="card" style={{ padding: '36px' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--energy-green)',
                    margin: '0 auto 20px auto'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                  Enquiry Registered Successfully
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
                  {submissionResult?.message}
                </p>

                {/* Direct Action Buttons for Transparent Static Delivery */}
                {submissionResult?.requiresDirectAction && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a
                      href={submissionResult.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <MessageSquare size={18} />
                      <span>Dispatch Directly to WhatsApp Desk</span>
                    </a>
                    <a
                      href={submissionResult.mailtoUrl}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      <Mail size={18} />
                      <span>Dispatch via Email Client</span>
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setSubmissionResult(null);
                  }}
                  className="btn btn-outline"
                  style={{ marginTop: '20px', fontSize: '0.8125rem' }}
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot field for bot detection */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="form-honeypot">Leave blank</label>
                  <input
                    id="form-honeypot"
                    type="text"
                    name="_honeypot"
                    value={formData._honeypot}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-row-2">
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Debabrata Barua"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: `1px solid ${errors.name ? '#EF4444' : 'var(--border-color)'}`,
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit'
                      }}
                      required
                    />
                    {errors.name && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</div>}
                  </div>

                  {/* Organization */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Organization / Business Name
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="e.g. Brahmaputra Logistics"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-row-2">
                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: `1px solid ${errors.contact ? '#EF4444' : 'var(--border-color)'}`,
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. contact@company.in"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: `1px solid ${errors.contact ? '#EF4444' : 'var(--border-color)'}`,
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                {errors.contact && (
                  <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '-12px', marginBottom: '16px' }}>
                    {errors.contact}
                  </div>
                )}

                {/* Service Interest */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Primary Area of Interest *
                  </label>
                  <select
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Brief Description of Requirement *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details such as approximate monthly electricity bill, roof area, current website URL, or project goals..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: `1px solid ${errors.message ? '#EF4444' : 'var(--border-color)'}`,
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    required
                  />
                  {errors.message && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.message}</div>}
                </div>

                {/* Error Banner */}
                {status === 'error' && (
                  <div 
                    style={{
                      display: 'flex',
                      gap: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      color: '#EF4444',
                      fontSize: '0.875rem',
                      marginBottom: '20px'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{submissionResult?.error || 'Submission error. Please connect directly via WhatsApp.'}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px 24px', opacity: status === 'submitting' ? 0.7 : 1 }}
                >
                  <Send size={18} />
                  <span>{status === 'submitting' ? 'Verifying & Submitting...' : 'Submit Commercial Consultation Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-row-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
