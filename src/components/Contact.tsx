import { accent } from '../lib/accent';
import { useHomeContent } from '../cms/CmsProvider';
import { LeadForm } from './LeadForm';
import { Reveal } from './Reveal';

export function Contact() {
  const home = useHomeContent();
  const copy = home?.contactSection || {};
  const points: string[] = copy.points?.length
    ? copy.points
    : [
        'A conversation built around your hiring workflow',
        'A walkthrough of the products you actually need',
        'Clear next steps for evaluating the platform',
      ];
  const email = copy.email || 'sales@talentpool365.com';

  return (
    <section className="section" id="contact">
      <div className="container split" style={{ alignItems: 'start' }}>
        <Reveal className="split-copy" variant="left">
          <h2>{accent(copy.title || 'Talk to a human *who knows hiring.*')}</h2>
          <p>
            {copy.body ||
              'Tell us about the roles you are filling, the tools you use and what is slowing your team down. We will help you explore a more connected way to hire.'}
          </p>
          <ul className="ticks">
            {points.map((pt, i) => (
              <li key={`${pt}-${i}`}>{pt}</li>
            ))}
          </ul>
          <p>
            <strong>{copy.emailPrompt || 'Prefer email?'}</strong>
            <br />
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </Reveal>
        <Reveal variant="right" delay={1}>
          <LeadForm
            recipient={email}
            subject="Sales enquiry"
            fields={[
              { name: 'name', label: 'Full name', required: true, autoComplete: 'name' },
              { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
              { name: 'company', label: 'Company', required: true, autoComplete: 'organization' },
              {
                name: 'volume',
                label: 'Hiring volume',
                type: 'select',
                options: ['Under 10 hires / year', '10–100 hires / year', '100–1,000 hires / year', '1,000+ hires / year'],
              },
              {
                name: 'message',
                label: 'What are you hiring for?',
                type: 'textarea',
                placeholder: 'Roles, current tools and what is slowing you down',
                wide: true,
              },
            ]}
            submitLabel={copy.submitLabel || 'Prepare sales enquiry'}
            hint={copy.hint || 'Creates an email draft. Nothing is sent until you send it from your email app.'}
          />
        </Reveal>
      </div>
    </section>
  );
}
