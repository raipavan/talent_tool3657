import { useId, useState } from 'react';
import { faqs as staticFaqs, type FaqItem } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { useHomeContent } from '../sanity/SanityProvider';

interface FaqProps {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  body?: string;
  contactHref?: string;
}

export function Faq({
  items,
  eyebrow,
  title,
  body,
  contactHref,
}: FaqProps) {
  const homeContent = useHomeContent();
  const sectionCopy = homeContent?.faqSection || {};
  const faqList = items ?? (homeContent?.faqs as FaqItem[]) ?? staticFaqs;
  const displayEyebrow = eyebrow ?? sectionCopy.eyebrow ?? 'Questions, answered';
  const displayTitle = title ?? sectionCopy.title ?? 'What hiring teams ask *before the trial*';
  const displayBody =
    body ??
    sectionCopy.body ??
    "No discovery call required to get an answer. If yours isn't here, send it over — a product specialist replies within one business day.";
  const displayHref = contactHref ?? sectionCopy.linkHref ?? '#contact';
  const displayLinkLabel = sectionCopy.linkLabel ?? 'Ask us something else';
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <div className="faq-intro">
          <SectionHead
            variant="left"
            eyebrow={displayEyebrow}
            title={displayTitle}
            body={displayBody}
          />
          <Reveal variant="left" delay={1}>
            <a className="faq-link" href={displayHref}>
              {displayLinkLabel}
              <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>

        <div className="faq-list">
          {faqList.map((item, index) => {
            const isOpen = openIndex === index;
            const questionId = `${baseId}-q-${index}`;
            const answerId = `${baseId}-a-${index}`;

            return (
              <Reveal
                key={item.question}
                className={`faq-item${isOpen ? ' is-open' : ''}`}
                variant={index % 2 === 0 ? 'left' : 'right'}
                delay={Math.min(index, 3)}
              >
                <h3 className="faq-q">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="faq-a"
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
