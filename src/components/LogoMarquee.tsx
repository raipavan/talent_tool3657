import { companyLogos as staticCompanyLogos, type CompanyLogo } from '../data/content';
import { useHomeContent } from '../cms/CmsProvider';
import { Reveal } from './Reveal';

function LogoRow({ logos, hidden = false }: { logos: CompanyLogo[]; hidden?: boolean }) {
  return (
    <ul className="logo-row" aria-hidden={hidden || undefined}>
      {logos.map((logo, idx) => (
        <li key={`${logo.name}-${idx}`} className={logo.style || 'logo--sans'}>
          {logo.name}
        </li>
      ))}
    </ul>
  );
}

export function LogoMarquee() {
  const home = useHomeContent();
  const logos = (home?.companyLogos?.length ? home.companyLogos : staticCompanyLogos) as CompanyLogo[];
  const label = home?.logosLabel || 'Trusted by talent teams at';

  return (
    <section className="logos" aria-label="Customers">
      <Reveal className="container">
        <p>{label}</p>
        <div className="logo-marquee">
          <div className="logo-track">
            <LogoRow logos={logos} />
            <LogoRow logos={logos} hidden />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
