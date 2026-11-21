import { useState } from 'react';
import { useSanityContent, type PlanModel, type PricingComparisonFeature } from '../sanity/SanityProvider';

export function SanityStudioPage() {
  const {
    pricing,
    home,
    navigation,
    isSanityLive,
    sanityConfig,
    updatePricing,
    updateHome,
    updateNavigation,
    updateSanityConfig,
    resetDefaults,
    pushToSanity,
  } = useSanityContent();

  const [activeTab, setActiveTab] = useState<'pricing' | 'home' | 'navigation' | 'sanity'>('pricing');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; msg: string; success?: boolean } | null>(null);

  // Local draft state for Pricing
  const [pricingDraft, setPricingDraft] = useState(pricing);
  // Local draft state for Sanity settings
  const [configDraft, setConfigDraft] = useState(sanityConfig);
  // Local draft state for Home
  const [homeDraft, setHomeDraft] = useState(home);

  const notify = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 4000);
  };

  const handleSavePricing = () => {
    updatePricing(pricingDraft);
    notify('✅ Pricing changes saved! The whole website is updated immediately.');
  };

  const handleSaveHome = () => {
    updateHome(homeDraft);
    notify('✅ Homepage changes saved! Visit the home page to see them live.');
  };

  const handleSaveConfig = () => {
    updateSanityConfig(configDraft);
    notify('✅ Sanity settings saved.');
  };

  const handlePushToCloud = async () => {
    setSyncStatus({ loading: true, msg: 'Pushing content to Sanity Cloud dataset...' });
    updateSanityConfig(configDraft);
    updatePricing(pricingDraft);
    const res = await pushToSanity();
    setSyncStatus({ loading: false, msg: res.message, success: res.success });
  };

  // Plan editing helper
  const updatePlan = (index: number, field: keyof PlanModel, value: unknown) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      nextPlans[index] = { ...nextPlans[index], [field]: value };
      return { ...prev, plans: nextPlans };
    });
  };

  const updateFeatureBullet = (planIdx: number, featureIdx: number, val: string) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      const nextFeatures = [...nextPlans[planIdx].features];
      nextFeatures[featureIdx] = val;
      nextPlans[planIdx] = { ...nextPlans[planIdx], features: nextFeatures };
      return { ...prev, plans: nextPlans };
    });
  };

  const addFeatureBullet = (planIdx: number) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      nextPlans[planIdx] = {
        ...nextPlans[planIdx],
        features: [...nextPlans[planIdx].features, 'New capability feature...'],
      };
      return { ...prev, plans: nextPlans };
    });
  };

  const removeFeatureBullet = (planIdx: number, featureIdx: number) => {
    setPricingDraft((prev) => {
      const nextPlans = [...prev.plans];
      const nextFeatures = nextPlans[planIdx].features.filter((_, idx) => idx !== featureIdx);
      nextPlans[planIdx] = { ...nextPlans[planIdx], features: nextFeatures };
      return { ...prev, plans: nextPlans };
    });
  };

  // Comparison Matrix helper
  const updateComparisonRow = (idx: number, field: keyof PricingComparisonFeature, val: string) => {
    setPricingDraft((prev) => {
      const nextRows = [...prev.comparisonFeatures];
      nextRows[idx] = { ...nextRows[idx], [field]: val };
      return { ...prev, comparisonFeatures: nextRows };
    });
  };

  const addComparisonRow = () => {
    setPricingDraft((prev) => ({
      ...prev,
      comparisonFeatures: [
        ...prev.comparisonFeatures,
        { feature: 'New Comparison Feature', starter: '–', pro: '✓', ent: '✓' },
      ],
    }));
  };

  const removeComparisonRow = (idx: number) => {
    setPricingDraft((prev) => ({
      ...prev,
      comparisonFeatures: prev.comparisonFeatures.filter((_, i) => i !== idx),
    }));
  };

  // FAQ helper
  const updateFaq = (idx: number, field: 'q' | 'a', val: string) => {
    setPricingDraft((prev) => {
      const nextFaqs = [...prev.faqs];
      nextFaqs[idx] = { ...nextFaqs[idx], [field]: val };
      return { ...prev, faqs: nextFaqs };
    });
  };

  const addFaq = () => {
    setPricingDraft((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: 'New question here?', a: 'Answer explaining details here.' }],
    }));
  };

  const removeFaq = (idx: number) => {
    setPricingDraft((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', fontFamily: 'var(--font-body)' }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              TalentPool365 Studio & CMS
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 999,
                background: isSanityLive ? '#DCFCE7' : '#FEF3C7',
                color: isSanityLive ? '#166534' : '#92400E',
                border: `1px solid ${isSanityLive ? '#86EFAC' : '#FCD34D'}`,
              }}
            >
              {isSanityLive ? '● Sanity Cloud Connected' : '● Live Local Dual-Sync (Ready)'}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Visual Content Management Studio — edit pricing, plans, headlines, and content with instant real-time sync.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href="/pricing"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            👁️ Preview Pricing
          </a>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            👁️ Preview Home
          </a>
          <button
            onClick={() => {
              if (confirm('Reset all content back to factory defaults?')) {
                resetDefaults();
                setPricingDraft(pricing);
                setHomeDraft(home);
                notify('Content reset to defaults.');
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {saveNotification && (
        <div
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius)',
            marginBottom: 20,
            boxShadow: 'var(--shadow-md)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{saveNotification}</span>
          <button
            onClick={() => setSaveNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--color-border)', marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'pricing' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          💰 Pricing & Plans
        </button>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'home' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'home' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          🏠 Homepage & Hero
        </button>
        <button
          onClick={() => setActiveTab('navigation')}
          style={{
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'navigation' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'navigation' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          🧭 Navigation & Footer
        </button>
        <button
          onClick={() => setActiveTab('sanity')}
          style={{
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'sanity' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'sanity' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          ☁️ Sanity Cloud & 404 Fix
        </button>
      </div>

      {/* TAB 1: PRICING */}
      {activeTab === 'pricing' && (
        <div>
          {/* Header & Save Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Pricing Plans, Comparison & FAQs
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Changes here immediately change the Pricing Page (`/pricing`) and Homepage Pricing section.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              style={{
                padding: '12px 28px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              💾 Save & Publish Pricing
            </button>
          </div>

          {/* Page Hero Titles */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Pricing Hero Headers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Headline</label>
                <input
                  type="text"
                  value={pricingDraft.heroTitle || ''}
                  onChange={(e) => setPricingDraft({ ...pricingDraft, heroTitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Subtitle</label>
                <input
                  type="text"
                  value={pricingDraft.heroSubtitle || ''}
                  onChange={(e) => setPricingDraft({ ...pricingDraft, heroSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          </div>

          {/* 3 Plan Cards */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Subscription Plans</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
            {pricingDraft.plans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  border: plan.isPopular ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  boxShadow: plan.isPopular ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                {plan.isPopular && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--color-secondary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      textTransform: 'uppercase',
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Badge</label>
                  <input
                    type="text"
                    value={plan.badge}
                    onChange={(e) => updatePlan(idx, 'badge', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Monthly Price</label>
                    <input
                      type="text"
                      value={plan.priceMonthly}
                      onChange={(e) => updatePlan(idx, 'priceMonthly', e.target.value)}
                      placeholder="$99 or Custom"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Annual Price</label>
                    <input
                      type="text"
                      value={plan.priceAnnual}
                      onChange={(e) => updatePlan(idx, 'priceAnnual', e.target.value)}
                      placeholder="$79 or Custom"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Target Audience / Description</label>
                  <textarea
                    rows={2}
                    value={plan.target}
                    onChange={(e) => updatePlan(idx, 'target', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Trial Note</label>
                  <input
                    type="text"
                    value={plan.trialNote}
                    onChange={(e) => updatePlan(idx, 'trialNote', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Button Text</label>
                    <input
                      type="text"
                      value={plan.ctaText}
                      onChange={(e) => updatePlan(idx, 'ctaText', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CTA Link URL</label>
                    <input
                      type="text"
                      value={plan.ctaHref}
                      onChange={(e) => updatePlan(idx, 'ctaHref', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Features list */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Included Features</span>
                    <button
                      onClick={() => addFeatureBullet(idx)}
                      style={{ background: 'var(--color-outline-fill)', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Feature
                    </button>
                  </div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeatureBullet(idx, fIdx, e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                      />
                      <button
                        onClick={() => removeFeatureBullet(idx, fIdx)}
                        style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '0 8px', cursor: 'pointer', fontSize: '0.85rem' }}
                        title="Remove feature"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Matrix */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Comparison Matrix Rows</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Feature breakdown across Starter, Professional, and Enterprise.</p>
              </div>
              <button
                onClick={addComparisonRow}
                style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                + Add Comparison Row
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-light)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)' }}>Capability / Feature</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 140 }}>Starter</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 140 }}>Professional</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 160 }}>Enterprise</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid var(--color-border)', width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pricingDraft.comparisonFeatures.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.feature}
                          onChange={(e) => updateComparisonRow(idx, 'feature', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.starter}
                          onChange={(e) => updateComparisonRow(idx, 'starter', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.pro}
                          onChange={(e) => updateComparisonRow(idx, 'pro', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.ent}
                          onChange={(e) => updateComparisonRow(idx, 'ent', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeComparisonRow(idx)}
                          style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing FAQs */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pricing FAQs</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Frequently asked questions on the pricing page.</p>
              </div>
              <button
                onClick={addFaq}
                style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                + Add FAQ
              </button>
            </div>

            {pricingDraft.faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'var(--color-bg-light)', padding: 16, borderRadius: 8, marginBottom: 12, position: 'relative' }}>
                <button
                  onClick={() => removeFaq(idx)}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                >
                  × Remove
                </button>
                <div style={{ marginBottom: 8, paddingRight: 80 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Question</label>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Answer</label>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleSavePricing}
              style={{
                padding: '14px 36px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              💾 Save & Publish All Pricing Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE & HERO */}
      {activeTab === 'home' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>Homepage Content & Hero</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Edit the main headline, subtitle, stats, and CTAs.</p>
            </div>
            <button
              onClick={handleSaveHome}
              style={{ padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius)', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              💾 Save Homepage Content
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Headline</label>
              <input
                type="text"
                value={homeDraft.hero?.heading || 'Hire top talent 3x faster with autonomous AI agents'}
                onChange={(e) =>
                  setHomeDraft({
                    ...homeDraft,
                    hero: { ...homeDraft.hero, heading: e.target.value },
                  })
                }
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Hero Description Subtext</label>
              <textarea
                rows={3}
                value={homeDraft.hero?.subheading || 'TalentPool365 automates sourcing, resume parsing, multi-stage assessments, and video interviews — end-to-end on one intelligent recruitment platform.'}
                onChange={(e) =>
                  setHomeDraft({
                    ...homeDraft,
                    hero: { ...homeDraft.hero, subheading: e.target.value },
                  })
                }
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Primary CTA Button Text</label>
                <input
                  type="text"
                  value={homeDraft.hero?.primaryCta?.text || 'Start Free Trial'}
                  onChange={(e) =>
                    setHomeDraft({
                      ...homeDraft,
                      hero: { ...homeDraft.hero, primaryCta: { ...homeDraft.hero?.primaryCta, text: e.target.value } },
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Secondary CTA Button Text</label>
                <input
                  type="text"
                  value={homeDraft.hero?.secondaryCta?.text || 'Book a Demo'}
                  onChange={(e) =>
                    setHomeDraft({
                      ...homeDraft,
                      hero: { ...homeDraft.hero, secondaryCta: { ...homeDraft.hero?.secondaryCta, text: e.target.value } },
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NAVIGATION & FOOTER */}
      {activeTab === 'navigation' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>Navigation & Global Links</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Configure header and footer links.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'var(--color-bg-light)', padding: 18, borderRadius: 8 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Header Primary CTA</h3>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Button Text</label>
                <input
                  type="text"
                  defaultValue={navigation?.header?.cta?.label || 'Get Started'}
                  onChange={(e) => {
                    const next = { ...navigation, header: { ...navigation.header, cta: { ...navigation?.header?.cta, label: e.target.value } } };
                    updateNavigation(next);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Button Link</label>
                <input
                  type="text"
                  defaultValue={navigation?.header?.cta?.href || '/get-started'}
                  onChange={(e) => {
                    const next = { ...navigation, header: { ...navigation.header, cta: { ...navigation?.header?.cta, href: e.target.value } } };
                    updateNavigation(next);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-light)', padding: 18, borderRadius: 8 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Footer Note & Slogan</h3>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Slogan / Mission</label>
                <textarea
                  rows={3}
                  defaultValue={navigation?.footer?.slogan || 'Empowering recruitment teams with Agentic AI to source, screen, and hire candidates with unprecedented speed and precision.'}
                  onChange={(e) => {
                    const next = { ...navigation, footer: { ...navigation.footer, slogan: e.target.value } };
                    updateNavigation(next);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SANITY CLOUD & 404 EXPLANATION */}
      {activeTab === 'sanity' && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
            Sanity Cloud Integration & 404 Resolution
          </h2>

          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 24,
              color: '#1E40AF',
              fontSize: '0.92rem',
              lineHeight: 1.6,
            }}
          >
            <strong>Why did you see <code>{`{"statusCode":404,"error":"Not Found","message":"Studio not found"}`}</code>?</strong>
            <p style={{ marginTop: 6 }}>
              When a project is created on Sanity Cloud (<code>sanity.io/manage</code>), Sanity provides your cloud dataset and REST/GROQ API endpoints instantly. However, the custom web studio URL (e.g. <code>https://&lt;project&gt;.sanity.studio</code>) only activates after running <code>npx sanity deploy</code> with a chosen hostname.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Good news:</strong> You do NOT need to wait or deploy to Sanity Cloud! This integrated Studio right here is fully wired to your application. It lets you edit all pricing and content immediately with real-time browser preview, and syncs directly to your Sanity Cloud dataset whenever you paste your Project ID and API Token below.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Sanity Project ID</label>
              <input
                type="text"
                value={configDraft.projectId}
                onChange={(e) => setConfigDraft({ ...configDraft, projectId: e.target.value })}
                placeholder="e.g. v6qf71nm (from sanity.io/manage)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Dataset</label>
              <input
                type="text"
                value={configDraft.dataset}
                onChange={(e) => setConfigDraft({ ...configDraft, dataset: e.target.value })}
                placeholder="production"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Sanity Write API Token (Optional — required only for pushing mutations to Sanity Cloud)
            </label>
            <input
              type="password"
              value={configDraft.token || ''}
              onChange={(e) => setConfigDraft({ ...configDraft, token: e.target.value })}
              placeholder="sk..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
              Create a token with Editor permissions at <code>sanity.io/manage &gt; [Your Project] &gt; API &gt; Tokens</code>.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={handleSaveConfig}
              style={{ padding: '10px 20px', background: 'var(--color-secondary)', color: '#fff', borderRadius: 'var(--radius)', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Save Cloud Settings
            </button>
            <button
              onClick={handlePushToCloud}
              disabled={syncStatus?.loading}
              style={{
                padding: '10px 24px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: syncStatus?.loading ? 0.7 : 1,
              }}
            >
              {syncStatus?.loading ? 'Pushing to Sanity Cloud...' : '⚡ Push All Changes to Sanity Cloud Dataset'}
            </button>
          </div>

          {syncStatus && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: syncStatus.success ? '#DCFCE7' : '#FEF3C7',
                border: `1px solid ${syncStatus.success ? '#86EFAC' : '#FCD34D'}`,
                color: syncStatus.success ? '#166534' : '#92400E',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {syncStatus.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
