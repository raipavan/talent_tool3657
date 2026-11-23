import { useId, useState, type FormEvent } from 'react';
import { submitLead } from '../cms/api';

export interface LeadField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  autoComplete?: string;
  placeholder?: string;
  /** Span both columns of the form grid. */
  wide?: boolean;
}

interface LeadFormProps {
  fields: LeadField[];
  submitLabel: string;
  hint: string;
  recipient?: string;
  subject?: string;
}

export function LeadForm({
  fields,
  submitLabel,
  hint,
  recipient = 'sales@talentpool365.com',
  subject = 'Website enquiry',
}: LeadFormProps) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const baseId = useId();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Anti-spam check
    if (data.get('_gotcha')) return;

    setSubmitting(true);

    const payload: Record<string, string> = {};
    fields.forEach((field) => {
      payload[field.name] = String(data.get(field.name) ?? '').trim();
    });

    const leadData = {
      formType: 'lead_form',
      sourcePath: typeof window !== 'undefined' ? window.location.pathname : '/',
      subject,
      name: payload.name || payload.fullName || '',
      email: payload.email || payload.workEmail || '',
      company: payload.company || payload.organization || '',
      phone: payload.phone || payload.tel || '',
      message: payload.message || payload.comments || '',
      ...payload,
    };

    const res = await submitLead(leadData);
    setSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      // Fallback: prepare mailto draft if backend is offline
      const body = fields
        .map((field) => `${field.label}: ${payload[field.name] || ''}`)
        .join('\n\n');
      setDraft(
        `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      );
    }
  };

  if (submitted) {
    return (
      <div
        className="form-panel"
        style={{
          textAlign: 'center',
          padding: '36px 24px',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--radius)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontSize: '1.3rem', color: '#065F46', margin: '0 0 8px', fontWeight: 800 }}>
          Thank you! Your request has been received.
        </h3>
        <p style={{ color: '#047857', fontSize: '0.92rem', margin: '0 0 16px', lineHeight: 1.5 }}>
          Our recruitment team will review your enquiry and get back to you within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="form-panel" onSubmit={onSubmit} onInput={() => setDraft('')}>
      {/* Honeypot field for bot protection */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />

      <div className="form-grid">
        {fields.map((field) => {
          const id = `${baseId}-${field.name}`;
          const shared = { id, name: field.name, required: field.required };

          return (
            <div className={`field${field.wide ? ' field--wide' : ''}`} key={field.name}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? (
                  <span className="req" aria-hidden="true">
                    {' '}
                    *
                  </span>
                ) : field.type !== 'select' ? (
                  <span className="opt"> (optional)</span>
                ) : null}
              </label>
              {field.type === 'select' ? (
                <select {...shared} defaultValue={field.options?.[0]}>
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea {...shared} placeholder={field.placeholder} />
              ) : (
                <input
                  {...shared}
                  type={field.type ?? 'text'}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting...' : submitLabel}
      </button>
      <p className="hint caption" style={{ marginTop: 14 }} role="status">
        {draft
          ? 'Your draft is ready. Open your email app to review and send it. Your request has not been sent yet.'
          : hint}
      </p>
      {draft ? (
        <a className="btn btn-outline draft-link" href={draft}>
          Open email draft
        </a>
      ) : null}
      <p className="form-privacy">
        Please do not include sensitive candidate data.{' '}
        <a href="/legal#privacy-policy">Privacy information</a>
      </p>
    </form>
  );
}
