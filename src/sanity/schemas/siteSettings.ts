export const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'Site Settings & Analytics',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'TalentPool365',
    },
    {
      name: 'defaultSeo',
      title: 'Default SEO Fallbacks',
      type: 'seo',
    },
    {
      name: 'googleSearchConsole',
      title: 'Google Search Console Verification Code',
      type: 'string',
      description: 'The meta tag verification content (e.g. google-site-verification code).',
    },
    {
      name: 'ga4MeasurementId',
      title: 'Google Analytics 4 (GA4) ID',
      type: 'string',
      description: 'e.g. G-XXXXXXXXXX (Cookie-consent gated: only activates when Analytics is accepted).',
    },
    {
      name: 'gtmContainerId',
      title: 'Google Tag Manager (GTM) Container ID',
      type: 'string',
      description: 'e.g. GTM-XXXXXXX (Cookie-consent gated).',
    },
    {
      name: 'metaPixelId',
      title: 'Meta / Facebook Pixel ID',
      type: 'string',
      description: 'e.g. 123456789012345 (Cookie-consent gated: only activates when Marketing is accepted).',
    },
    {
      name: 'linkedInPartnerId',
      title: 'LinkedIn Insight Tag Partner ID',
      type: 'string',
      description: 'e.g. 1234567 (Cookie-consent gated).',
    },
  ],
};
