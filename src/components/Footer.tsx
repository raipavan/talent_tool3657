import { footerColumns as staticFooterColumns, footerLegalLinks as staticFooterLegalLinks, type FooterColumn, type NavLink } from '../data/content';
import { openCookieSettings } from '../lib/cookieConsent';
import { navigate } from '../lib/router';
import { useNavigationContent } from '../sanity/SanityProvider';

export function Footer() {
  const year = new Date().getFullYear();
  const navigation = useNavigationContent();
  const footerColumns = (navigation?.footerColumns ?? staticFooterColumns) as FooterColumn[];
  const footerLegalLinks = (navigation?.footerLegalLinks ?? staticFooterLegalLinks) as NavLink[];
  const footerMeta = navigation?.footer || {};
  const officeCountry = footerMeta.officeCountry || 'USA';
  const officeAddress =
    footerMeta.officeAddress || '11549 Nuckols Road, Suite B, Glen Allen, VA 23059 United States';
  const phone = footerMeta.phone || '+1 302-231-1816';
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`;
  const copyrightText = footerMeta.copyright || 'TalentPool365 B.V. All rights reserved.';

  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-row">
            <div className="footer-brand">
              <a className="brand" href="/" aria-label="TalentPool365 home">
                <img
                  className="brand-logo"
                  src="/assets/talentpool365-logo-light.png"
                  alt=""
                  width="462"
                  height="76"
                />
              </a>
              <p>The Agentic AI recruitment platform for teams that measure hiring in days.</p>
              <div className="footer-reading">
                <p>A little perspective for your next hiring day.</p>
                <a href="/blog">Read our hiring notes <span aria-hidden="true">&nbsp;→</span></a>
              </div>
            </div>

            <div className="footer-address-card">
              <div className="footer-address-card__body">
                <div className="footer-address-card__header">
                  <svg className="footer-address-card__flag" viewBox="0 0 36 24" width="36" height="24" aria-hidden="true">
                    <defs>
                      <clipPath id="usa-flag-clip">
                        <rect width="36" height="24" rx="3" />
                      </clipPath>
                    </defs>
                    <g clipPath="url(#usa-flag-clip)">
                      <rect width="36" height="24" fill="#B22234" />
                      <rect y="1.85" width="36" height="1.85" fill="#FFFFFF" />
                      <rect y="5.54" width="36" height="1.85" fill="#FFFFFF" />
                      <rect y="9.23" width="36" height="1.85" fill="#FFFFFF" />
                      <rect y="12.92" width="36" height="1.85" fill="#FFFFFF" />
                      <rect y="16.62" width="36" height="1.85" fill="#FFFFFF" />
                      <rect y="20.31" width="36" height="1.85" fill="#FFFFFF" />
                      <rect width="14.4" height="12.92" fill="#3C3B6E" />
                      <circle cx="3" cy="2.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="6" cy="2.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="9" cy="2.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="12" cy="2.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="4.5" cy="4.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="7.5" cy="4.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="10.5" cy="4.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="3" cy="6.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="6" cy="6.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="9" cy="6.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="12" cy="6.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="4.5" cy="8.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="7.5" cy="8.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="10.5" cy="8.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="3" cy="10.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="6" cy="10.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="9" cy="10.5" r="0.75" fill="#FFFFFF" />
                      <circle cx="12" cy="10.5" r="0.75" fill="#FFFFFF" />
                    </g>
                  </svg>
                  <span className="footer-address-card__country">{officeCountry}</span>
                </div>
                <p className="footer-address-card__text">
                  {officeAddress}
                </p>
              </div>
              <div className="footer-address-card__footer">
                <svg className="footer-address-card__phone-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>Phone: <a href={phoneHref}>{phone}</a></span>
              </div>
            </div>
          </div>

          <div className="footer-cols">
            {footerColumns.map((column, colIdx) => (
              <div className="footer-col" key={`${column.title}-${colIdx}`}>
                <h4>{column.title}</h4>
                <ul>
                  {(column.links || []).map((link, linkIdx) => (
                    <li key={`${link.label}-${linkIdx}`}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            <span
              onClick={() => navigate('/studio')}
              style={{ cursor: 'default' }}
            >
              © {year} {copyrightText}
            </span>
          </p>
          <ul>
            {footerLegalLinks.map((link, idx) => (
              <li key={`${link.label}-${idx}`}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="footer-cookie-btn"
                onClick={openCookieSettings}
              >
                Cookie Settings
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
