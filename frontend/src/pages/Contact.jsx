import { useState } from 'react'
import { submitContact } from '../api/contacts'
import { useUserAuth } from '../context/UserAuthContext'

const CONTACT_INFO = [
  {
    icon: '📍',
    label: 'Address',
    value: '123 Health Avenue, Medical District\nNew York, NY 10001',
  },
  {
    icon: '📞',
    label: 'Phone',
    value: '+1 (555) 012-3456',
  },
  {
    icon: '📧',
    label: 'Email',
    value: 'contact@blooddonorregistry.org',
  },
]

export default function Contact() {
  const { user } = useUserAuth()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required.'
    if (!form.email.trim())   e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.subject.trim()) e.subject = 'Subject is required.'
    if (!form.message.trim()) e.message = 'Message is required.'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((err) => ({ ...err, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSubmitting(true)
    try {
      await submitContact(form)
      setSubmitted(true)
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = {}
        Object.entries(err.response.data.errors ?? {}).forEach(([k, v]) => {
          apiErrors[k] = v[0]
        })
        setErrors(apiErrors)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm({ name: user?.name ?? '', email: user?.email ?? '', subject: '', message: '' })
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <h1 className="page-title">Contact Us</h1>
        <p className="contact-subtitle">
          Have a question or need help? Reach out and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="contact-layout">
        {/* Info panel */}
        <aside className="contact-info-panel">
          <h2 className="info-panel-title">Get in Touch</h2>
          <p className="info-panel-desc">
            We're here to support donors, recipients, and anyone interested in
            learning more about blood donation.
          </p>

          <div className="contact-info-list">
            {CONTACT_INFO.map((item) => (
              <div key={item.label} className="contact-info-item">
                <div className="ci-icon">{item.icon}</div>
                <div>
                  <div className="ci-label">{item.label}</div>
                  <div className="ci-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="emergency-banner">
            <div className="emergency-icon">🚨</div>
            <div>
              <div className="emergency-title">Blood Emergency?</div>
              <div className="emergency-number">1-800-RED-CROSS</div>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <div className="contact-form-panel">
          {submitted ? (
            <div className="contact-success">
              <div className="success-icon">✓</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll respond within 1–2 business days.</p>
              <button className="btn btn-primary" onClick={handleReset}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'input-error' : ''}
                >
                  <option value="">Select a subject…</option>
                  <option value="Donor Registration Help">Donor Registration Help</option>
                  <option value="Find a Donor">Find a Donor</option>
                  <option value="Blood Drive Enquiry">Blood Drive Enquiry</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="General Enquiry">General Enquiry</option>
                </select>
                {errors.subject && <span className="error-msg">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label>Message <span className="required">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write your message here…"
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="error-msg">{errors.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary contact-submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
