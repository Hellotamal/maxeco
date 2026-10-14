/**
 * MaxEco Energy & Tech — Business Enquiry Form Handler
 * Validates inputs, filters spam via honeypot, and delivers via API or direct messaging
 */

export const SERVICE_OPTIONS = [
  'Commercial Rooftop Solar Consultation',
  'Electricity Bill Audit & Feasibility',
  'APDCL Net-Metering & Regulatory Advisory',
  'Corporate Website Design / Rebuild',
  'Business Landing Page & Lead Capture',
  'SEO & Local Guwahati Search Optimization',
  'IT Infrastructure & Network Advisory',
  'Solar Facility AMC & Preventive O&M',
  'General Commercial Enquiry'
];

/**
 * Validates form submission data
 * @param {Object} data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateEnquiryForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  // Contact validation: Either valid email or 10-digit Indian phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneClean = (data.phone || '').replace(/[^0-9]/g, '');
  const hasValidEmail = data.email && emailRegex.test(data.email.trim());
  const hasValidPhone = phoneClean.length >= 10;

  if (!hasValidEmail && !hasValidPhone) {
    errors.contact = 'Please provide either a valid email address or 10-digit phone number.';
  }

  if (!data.serviceInterest) {
    errors.serviceInterest = 'Please select a service interest.';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Please provide a brief description of your requirement (at least 10 characters).';
  }

  // Honeypot check for bots
  if (data._honeypot && data._honeypot.trim().length > 0) {
    errors._honeypot = 'Spam submission detected.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Submits enquiry to configured endpoint or generates fallback messaging link
 * @param {Object} formData
 * @returns {Promise<Object>} Result object with delivery status and message
 */
export async function submitEnquiry(formData) {
  const endpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT;

  // 1. If an active API endpoint is configured (Formspree, Web3Forms, or custom server)
  if (endpoint && endpoint.trim().length > 0) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: 'MaxEco Corporate Portal'
        })
      });

      if (response.ok) {
        return {
          success: true,
          delivered: true,
          message: 'Your enquiry has been successfully transmitted to our engineering desk. We will review your parameters and respond within 4 business hours.'
        };
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.warn('Form API delivery error, falling back to direct messaging options:', err);
      return {
        success: false,
        delivered: false,
        error: 'Unable to reach the automated dispatch server. Please contact us directly via phone or WhatsApp.',
        fallbackUrl: generateWhatsAppUrl(formData)
      };
    }
  }

  // 2. If endpoint is unconfigured in development/static environment, provide transparent direct routing
  return {
    success: true,
    delivered: false, // Transparently indicate that direct client dispatch is required
    requiresDirectAction: true,
    message: 'Your enquiry details have been verified. Click below to connect directly with our engineering team on WhatsApp or via Email.',
    whatsappUrl: generateWhatsAppUrl(formData),
    mailtoUrl: generateMailtoUrl(formData)
  };
}

/**
 * Generates pre-formatted WhatsApp enquiry URL
 */
export function generateWhatsAppUrl(formData) {
  const text = encodeURIComponent(
    `*New Business Enquiry — MaxEco Energy & Tech*\n\n` +
    `👤 *Name:* ${formData.name}\n` +
    `🏢 *Organization:* ${formData.organization || 'Not Specified'}\n` +
    `📍 *Location:* ${formData.location || 'Assam / Northeast India'}\n` +
    `📞 *Phone:* ${formData.phone || 'N/A'}\n` +
    `✉️ *Email:* ${formData.email || 'N/A'}\n` +
    `⚡ *Service:* ${formData.serviceInterest}\n` +
    `📝 *Brief:* ${formData.message}`
  );
  return `https://wa.me/919954493909?text=${text}`;
}

/**
 * Generates pre-formatted mailto URL
 */
export function generateMailtoUrl(formData) {
  const subject = encodeURIComponent(`Business Enquiry: ${formData.serviceInterest} - ${formData.organization || formData.name}`);
  const body = encodeURIComponent(
    `Name: ${formData.name}\n` +
    `Organization: ${formData.organization || 'N/A'}\n` +
    `Location: ${formData.location || 'Assam / Northeast'}\n` +
    `Phone: ${formData.phone || 'N/A'}\n` +
    `Email: ${formData.email || 'N/A'}\n` +
    `Service Interest: ${formData.serviceInterest}\n\n` +
    `Requirement Brief:\n${formData.message}\n`
  );
  return `mailto:maxecoenergyit@gmail.com?subject=${subject}&body=${body}`;
}
