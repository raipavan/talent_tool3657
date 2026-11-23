import { useEffect } from 'react';
import { hasCookieConsent, CONSENT_EVENT } from './cookieConsent';
import { useCms } from '../cms/CmsProvider';

function injectCustomScript(content: string, target: HTMLElement, containerId: string) {
  if (!content || !content.trim() || document.getElementById(containerId)) return;
  const trimmed = content.trim();
  if (
    trimmed.includes('<script') ||
    trimmed.includes('<noscript') ||
    trimmed.includes('<meta') ||
    trimmed.includes('<link') ||
    trimmed.includes('<div')
  ) {
    const wrapper = document.createElement('div');
    wrapper.id = containerId;
    wrapper.style.display = 'none';
    wrapper.innerHTML = trimmed;
    const scripts = Array.from(wrapper.getElementsByTagName('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
    target.appendChild(wrapper);
  } else {
    // Pure inline JS snippet
    const script = document.createElement('script');
    script.id = containerId;
    script.text = trimmed;
    target.appendChild(script);
  }
}

export function AnalyticsTracker() {
  const cms = useCms();
  const siteSettings = (cms.site as any)?.siteSettings || {};

  const ga4Id = siteSettings.ga4MeasurementId || import.meta.env.VITE_GA4_ID;
  const gtmId = siteSettings.gtmContainerId || import.meta.env.VITE_GTM_ID;
  const metaPixelId = siteSettings.metaPixelId || import.meta.env.VITE_META_PIXEL_ID;
  const linkedInId = siteSettings.linkedInPartnerId || import.meta.env.VITE_LINKEDIN_PARTNER_ID;
  const hotjarId = siteSettings.hotjarId || import.meta.env.VITE_HOTJAR_ID;
  const chatWidgetCode = siteSettings.chatWidgetCode;
  const customHeaderScript = siteSettings.customHeaderScript;
  const customFooterScript = siteSettings.customFooterScript;

  const initTracking = () => {
    // 1. Analytics Category Consent (GA4 / GTM / Hotjar)
    if (hasCookieConsent('analytics')) {
      // Google Analytics 4
      if (ga4Id && !document.getElementById('ga4-script')) {
        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
        document.head.appendChild(script);

        const inline = document.createElement('script');
        inline.id = 'ga4-inline';
        inline.text = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', { anonymize_ip: true });
        `;
        document.head.appendChild(inline);
      }

      // Google Tag Manager
      if (gtmId && !document.getElementById('gtm-script')) {
        const script = document.createElement('script');
        script.id = 'gtm-script';
        script.text = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.appendChild(script);
      }

      // Hotjar
      if (hotjarId && !document.getElementById('hotjar-script')) {
        const script = document.createElement('script');
        script.id = 'hotjar-script';
        script.text = `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${JSON.stringify(hotjarId)},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `;
        document.head.appendChild(script);
      }
    }

    // 2. Marketing Category Consent (Meta Pixel / LinkedIn)
    if (hasCookieConsent('marketing')) {
      // Meta Pixel
      if (metaPixelId && !document.getElementById('meta-pixel-script')) {
        const script = document.createElement('script');
        script.id = 'meta-pixel-script';
        script.text = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }

      // LinkedIn Insight Tag
      if (linkedInId && !document.getElementById('linkedin-insight-script')) {
        const script = document.createElement('script');
        script.id = 'linkedin-insight-script';
        script.text = `
          _linkedin_partner_id = "${linkedInId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);})(window.lintrk);
        `;
        document.head.appendChild(script);
      }
    }

    // 3. External Plugins & Custom Scripts
    if (chatWidgetCode) {
      injectCustomScript(chatWidgetCode, document.body, 'cms-chat-widget-wrapper');
    }
    if (customHeaderScript) {
      injectCustomScript(customHeaderScript, document.head, 'cms-custom-header-wrapper');
    }
    if (customFooterScript) {
      injectCustomScript(customFooterScript, document.body, 'cms-custom-footer-wrapper');
    }
  };

  useEffect(() => {
    initTracking();

    const onConsentChanged = () => {
      initTracking();
    };

    window.addEventListener(CONSENT_EVENT, onConsentChanged);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChanged);
  }, [ga4Id, gtmId, metaPixelId, linkedInId, hotjarId, chatWidgetCode, customHeaderScript, customFooterScript]);

  return null;
}
