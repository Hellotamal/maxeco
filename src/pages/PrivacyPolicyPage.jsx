import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, Mail } from 'lucide-react';
import SEO from '../components/SEO';
import { siteConfig } from '../data/siteContent';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy & Data Protection"
        description="Privacy policy and data governance practices of MaxEco Energy & Tech compliant with the Digital Personal Data Protection Act (DPDP), 2023."
        canonicalPath="/privacy"
      />

      <section className="section" style={{ paddingBottom: '40px', background: 'radial-gradient(ellipse at 50% 0%, rgba(158, 202, 214, 0.12) 0%, rgba(11, 19, 43, 0) 70%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="section-eyebrow">Governance &amp; Trust</span>
          <h1 className="section-title">Privacy Policy &amp; Data Protection Notice</h1>
          <p className="section-desc">
            Effective Date: October 15, 2026 • Compliant with the Digital Personal Data Protection (DPDP) Act, 2023 (India)
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '10px' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div className="card" style={{ padding: '40px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              1. Our Data Protection Commitment
            </h2>
            <p style={{ marginBottom: '24px' }}>
              MaxEco Energy &amp; Tech ("MaxEco", "we", "us", or "our"), operating from Maligaon, Guwahati, Assam, is committed to safeguarding the privacy and confidentiality of our commercial clients, website visitors, and partners. This policy outlines how we handle information submitted across our public corporate website (<code>https://hellotamal.github.io/maxeco</code>).
            </p>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              2. Minimal Data Collection Principle
            </h2>
            <p style={{ marginBottom: '12px' }}>
              We adhere strictly to data minimization principles. We only collect information that you voluntarily provide when initiating a commercial consultation or project discussion, including:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Contact Information:</strong> Full name, business email address, and mobile/telephone number.</li>
              <li><strong>Commercial Profile:</strong> Organization name, premise location (e.g. Guwahati, Kamrup Metro), and approximate monthly electricity consumption or website requirements.</li>
              <li><strong>Technical Notes:</strong> Project scope descriptions, roof area parameters, or existing URL links shared during your inquiry.</li>
            </ul>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              3. Purpose of Processing &amp; Use of Information
            </h2>
            <p style={{ marginBottom: '12px' }}>
              Your data is processed exclusively for legitimate B2B business purposes:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Evaluating technical feasibility, shadow modeling, and APDCL tariff parameters for solar inquiries.</li>
              <li>Preparing customized engineering proposals, single-line diagrams, or website development quotations.</li>
              <li>Directly responding to your communication via phone, email, or verified WhatsApp messaging.</li>
            </ul>
            <p style={{ marginBottom: '24px', color: 'var(--energy-green)', fontWeight: 600 }}>
              We NEVER sell, lease, rent, or trade your personal or business information to third-party marketing brokers or data brokers.
            </p>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              4. Cookies &amp; Local Storage Usage
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Our website uses minimal, non-invasive client storage solely to preserve your visual theme preference (<code>light</code> or <code>dark</code> mode) in your local browser. We do NOT use invasive third-party tracking pixels, cross-site profiling beacons, or behavioral advertising cookies.
            </p>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              5. Security Separation &amp; Storage Architecture
            </h2>
            <p style={{ marginBottom: '24px' }}>
              We maintain a rigorous security boundary separating our public corporate portal from internal systems. Public inquiries are verified through client-side validation and anti-spam honeypot mechanisms. Confidential business records, banking details, and internal work orders are never exposed on or linked from this public web portal.
            </p>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              6. Your Rights Under DPDP Act 2023
            </h2>
            <p style={{ marginBottom: '12px' }}>
              As a data principal under Indian law, you possess the right to:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Request a summary of personal information held by MaxEco.</li>
              <li>Request correction or updating of inaccurate or outdated contact information.</li>
              <li>Request erasure of your consultation history from our internal communication logs.</li>
            </ul>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              7. Grievance Redressal &amp; Privacy Contact
            </h2>
            <p style={{ marginBottom: '16px' }}>
              For questions regarding this privacy notice or to exercise your statutory rights, contact our designated privacy officer:
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <div><strong>MaxEco Energy &amp; Tech — Privacy Desk</strong></div>
              <div>Maligaon, Guwahati, Assam, Pin - 781011</div>
              <div>Email: <a href={`mailto:${siteConfig.email}`} style={{ color: 'var(--soft-blue)' }}>{siteConfig.email}</a></div>
              <div>Telephone: {siteConfig.phone}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
