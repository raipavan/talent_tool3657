import { useEffect, useState } from 'react';
import {
  getCookieConsent,
  OPEN_SETTINGS_EVENT,
  saveCookieConsent,
} from '../lib/cookieConsent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const onOpenSettings = () => {
      const current = getCookieConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowPrefs(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveCookieConsent('accepted', { analytics: true, marketing: true });
    setAnalytics(true);
    setMarketing(true);
    setShowPrefs(false);
    setVisible(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent('rejected', { analytics: false, marketing: false });
    setAnalytics(false);
    setMarketing(false);
    setShowPrefs(false);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const status =
      analytics && marketing ? 'accepted' : !analytics && !marketing ? 'rejected' : 'custom';
    saveCookieConsent(status, { analytics, marketing });
    setShowPrefs(false);
    setVisible(false);
  };

  return (
    <aside
      className="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__main">
          <div className="cookie-banner__copy">
            <p className="cookie-banner__title">We value your privacy</p>
            <p className="cookie-banner__text">
              We use necessary cookies to keep TalentPool365 secure and working properly, and optional
              cookies to understand site usage. Read our{' '}
              <a href="/legal">Privacy Policy</a> for details.
            </p>
          </div>

          <div className="cookie-banner__actions">
            <button
              type="button"
              className="cookie-btn cookie-btn--link"
              onClick={() => setShowPrefs((prev) => !prev)}
              aria-expanded={showPrefs}
            >
              {showPrefs ? 'Hide preferences' : 'Customize'}
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn--reject"
              onClick={handleRejectAll}
            >
              Reject All
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn--accept"
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
          </div>
        </div>

        {showPrefs ? (
          <div className="cookie-banner__prefs">
            <div className="cookie-pref">
              <div>
                <strong>Strictly Necessary</strong>
                <span>Required for core security, navigation, and session functionality.</span>
              </div>
              <span className="cookie-pref__badge">Always on</span>
            </div>

            <label className="cookie-pref">
              <div>
                <strong>Analytics</strong>
                <span>Helps us understand how visitors use the site so we can improve it.</span>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>

            <label className="cookie-pref">
              <div>
                <strong>Marketing</strong>
                <span>Used to measure campaign relevance and outreach effectiveness.</span>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
            </label>

            <div className="cookie-banner__prefs-footer">
              <button
                type="button"
                className="cookie-btn cookie-btn--accept"
                onClick={handleSaveCustom}
              >
                Save Preferences
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
