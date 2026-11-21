import { switchRows as staticSwitchRows, type IconName, type SwitchRow, type SwitchVisualKind } from '../data/content';
import { accent } from '../lib/accent';
import { useHomeContent } from '../cms/CmsProvider';
import { Reveal } from './Reveal';
import { Icon } from './Icon';

const icons: Record<SwitchVisualKind, IconName> = {
  search: 'search',
  score: 'clipboard-check',
  interview: 'video',
};

export function WhySwitch() {
  const home = useHomeContent();
  const switchRows = (home?.switchRows?.length ? home.switchRows : staticSwitchRows) as SwitchRow[];
  const copy = home?.whySwitchSection || {};

  return (
    <section className="section why-band" id="why-switch">
      <div className="container">
        <div className="why-top">
          <span className="why-eyebrow">{copy.eyebrow || 'Why TalentPool365'}</span>
          <a className="why-link" href={copy.linkHref || '#about'}>
            {copy.linkLabel || 'Our approach'} <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <Reveal variant="left">
          <h2 className="why-title">
            {accent(copy.title || 'The tools are fine. The handoffs are *where hiring dies.*')}
          </h2>
        </Reveal>
        <Reveal variant="left" delay={1}>
          <p className="why-lede">
            {copy.lede ||
              'Every system in your stack is decent on its own. The cost shows up between them — resumes re-read, candidates re-contacted, decisions re-explained. TalentPool365 closes those gaps instead of adding another tab.'}
          </p>
        </Reveal>

        <div className="why-cards">
          {switchRows.map((row, index) => (
            <Reveal
              as="article"
              key={`${row.title}-${index}`}
              className="why-card"
              variant={index % 2 === 0 ? 'left' : 'right'}
              delay={index}
            >
              <span className="why-icon">
                <Icon name={icons[row.visual] || 'search'} strokeWidth={1.6} />
              </span>
              <h3>{row.title}</h3>
              <p>{row.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
