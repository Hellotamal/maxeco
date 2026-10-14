import React from 'react';
import SEO from '../components/SEO';
import ContactSection from '../sections/ContactSection';
import { siteConfig } from '../data/siteContent';

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact MaxEco Energy & Tech",
    "description": "Commercial clean energy and digital technology consultation desk in Guwahati, Assam.",
    "url": `${siteConfig.canonicalUrl}/contact`
  };

  return (
    <>
      <SEO
        title="Contact & Business Enquiry"
        description="Connect with MaxEco Energy & Tech in Guwahati, Assam. Request a commercial solar site survey or digital technology consultation."
        canonicalPath="/contact"
        schemaData={contactSchema}
      />

      <div style={{ paddingTop: '20px' }}>
        <ContactSection id="contact-main" />
      </div>
    </>
  );
}
