import { useState, useEffect, type CSSProperties } from 'react';
import {
  useCms,
  type PricingContentModel,
  type PlanModel,
  type PricingComparisonFeature,
  type PricingFAQ,
} from '../../cms/CmsProvider';

interface PricingEditorPanelProps {
  onNotify?: (msg: string) => void;
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
  boxShadow: 'var(--shadow-sm)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  fontSize: '0.86rem',
  background: '#ffffff',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.76rem',
  fontWeight: 700,
  color: '#475569',
  marginBottom: 4,
};

export function PricingEditorPanel({ onNotify }: PricingEditorPanelProps) {
  const { draftSite, updatePricing } = useCms();
  const pricing = draftSite.pricing;
  const [pricingDraft, setPricingDraft] = useState<PricingContentModel>(pricing);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setPricingDraft(pricing);
  }, [pricing]);

  const commit = (next: PricingContentModel) => {
    setPricingDraft(next);
    updatePricing(next);
  };

  const handleSave = () => {
    updatePricing(pricingDraft);
    setSavedSuccess(true);
    if (onNotify) onNotify('Pricing changes staged in draft!');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updatePlan = <K extends keyof PlanModel>(idx: number, field: K, val: PlanModel[K]) => {
    const plans = [...pricingDraft.plans];
    plans[idx] = { ...plans[idx], [field]: val };
    commit({ ...pricingDraft, plans });
  };

  const updateFeatureBullet = (planIdx: number, featIdx: number, val: string) => {
    const plans = [...pricingDraft.plans];
    const features = [...plans[planIdx].features];
    features[featIdx] = val;
    plans[planIdx] = { ...plans[planIdx], features };
    commit({ ...pricingDraft, plans });
  };

  const addFeatureBullet = (planIdx: number) => {
    const plans = [...pricingDraft.plans];
    plans[planIdx] = {
      ...plans[planIdx],
      features: [...plans[planIdx].features, 'New included capability'],
    };
    commit({ ...pricingDraft, plans });
  };

  const removeFeatureBullet = (planIdx: number, featIdx: number) => {
    const plans = [...pricingDraft.plans];
    plans[planIdx] = {
      ...plans[planIdx],
      features: plans[planIdx].features.filter((_, i) => i !== featIdx),
    };
    commit({ ...pricingDraft, plans });
  };

  const updateComparisonRow = (idx: number, field: keyof PricingComparisonFeature, val: string) => {
    const comparisonFeatures = [...pricingDraft.comparisonFeatures];
    comparisonFeatures[idx] = { ...comparisonFeatures[idx], [field]: val };
    commit({ ...pricingDraft, comparisonFeatures });
  };

  const addComparisonRow = () => {
    commit({
      ...pricingDraft,
      comparisonFeatures: [
        ...pricingDraft.comparisonFeatures,
        { feature: 'New Capability', starter: '—', pro: 'Included', ent: 'Unlimited' },
      ],
    });
  };

  const removeComparisonRow = (idx: number) => {
    commit({
      ...pricingDraft,
      comparisonFeatures: pricingDraft.comparisonFeatures.filter((_, i) => i !== idx),
    });
  };

  const updateFaq = (idx: number, field: keyof PricingFAQ, val: string) => {
    const faqs = [...pricingDraft.faqs];
    faqs[idx] = { ...faqs[idx], [field]: val };
    commit({ ...pricingDraft, faqs });
  };

  const addFaq = () => {
    commit({
      ...pricingDraft,
      faqs: [
        ...pricingDraft.faqs,
        {
          q: 'What is your billing policy?',
          a: 'We offer flexible monthly and annual billing with volume discounts on Enterprise.',
        },
      ],
    });
  };

  const removeFaq = (idx: number) => {
    commit({
      ...pricingDraft,
      faqs: pricingDraft.faqs.filter((_, i) => i !== idx),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
            💰 Pricing Plans, Comparison Matrix &amp; FAQs
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Every field updates your draft immediately. Click &quot;Publish Live&quot; in the top bar when ready to deploy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: savedSuccess ? '#059669' : 'var(--color-primary)',
            color: '#fff',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {savedSuccess ? '✓ Draft Synced' : '💾 Sync Draft Now'}
        </button>
      </div>

      {/* Hero Header Copy */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Pricing Page Hero Header
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          <div>
            <label style={labelStyle}>Hero Title</label>
            <input
              type="text"
              value={pricingDraft.heroTitle || ''}
              onChange={(e) => commit({ ...pricingDraft, heroTitle: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hero Subtitle</label>
            <input
              type="text"
              value={pricingDraft.heroSubtitle || ''}
              onChange={(e) => commit({ ...pricingDraft, heroSubtitle: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
        {pricingDraft.plans.map((plan, idx) => (
          <div
            key={plan.name + idx}
            style={{
              ...cardStyle,
              border: plan.isPopular ? '2px solid var(--color-secondary)' : '1px solid #e2e8f0',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {plan.isPopular && (
              <span
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  background: 'var(--color-secondary)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                Most Popular
              </span>
            )}

            <div>
              <label style={labelStyle}>Plan Name</label>
              <input
                type="text"
                value={plan.name}
                onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                style={{ ...inputStyle, fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Badge</label>
              <input
                type="text"
                value={plan.badge}
                onChange={(e) => updatePlan(idx, 'badge', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={labelStyle}>Monthly Price</label>
                <input
                  type="text"
                  value={plan.priceMonthly}
                  onChange={(e) => updatePlan(idx, 'priceMonthly', e.target.value)}
                  style={{ ...inputStyle, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Annual Price</label>
                <input
                  type="text"
                  value={plan.priceAnnual}
                  onChange={(e) => updatePlan(idx, 'priceAnnual', e.target.value)}
                  style={{ ...inputStyle, fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Target Audience</label>
              <textarea
                rows={2}
                value={plan.target}
                onChange={(e) => updatePlan(idx, 'target', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Trial Note</label>
              <input
                type="text"
                value={plan.trialNote}
                onChange={(e) => updatePlan(idx, 'trialNote', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={labelStyle}>CTA Text</label>
                <input
                  type="text"
                  value={plan.ctaText}
                  onChange={(e) => updatePlan(idx, 'ctaText', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CTA Link</label>
                <input
                  type="text"
                  value={plan.ctaHref}
                  onChange={(e) => updatePlan(idx, 'ctaHref', e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Feature Checklist Heading</label>
              <input
                type="text"
                value={plan.featureTitle || ''}
                onChange={(e) => updatePlan(idx, 'featureTitle', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>Included Features</span>
                <button
                  type="button"
                  onClick={() => addFeatureBullet(idx)}
                  style={{
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    color: '#3730a3',
                    borderRadius: 5,
                    padding: '2px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Add
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => updateFeatureBullet(idx, fIdx, e.target.value)}
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeatureBullet(idx, fIdx)}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 5, padding: '0 8px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600, color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(plan.isPopular)}
                onChange={(e) => updatePlan(idx, 'isPopular', e.target.checked)}
              />
              Highlight as &quot;Most Popular&quot;
            </label>
          </div>
        ))}
      </div>

      {/* Comparison Matrix */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Feature Comparison Matrix
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Side-by-side plan comparison rows shown on `/pricing`.
            </p>
          </div>
          <button
            type="button"
            onClick={addComparisonRow}
            style={{
              padding: '7px 14px',
              background: 'var(--color-secondary)',
              color: '#fff',
              borderRadius: 7,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add Row
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '9px 10px' }}>Capability / Feature</th>
                <th style={{ padding: '9px 10px', width: 150 }}>Starter</th>
                <th style={{ padding: '9px 10px', width: 150 }}>Professional</th>
                <th style={{ padding: '9px 10px', width: 150 }}>Enterprise</th>
                <th style={{ padding: '9px 10px', width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {pricingDraft.comparisonFeatures.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <input
                      type="text"
                      value={row.feature}
                      onChange={(e) => updateComparisonRow(idx, 'feature', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input
                      type="text"
                      value={row.starter}
                      onChange={(e) => updateComparisonRow(idx, 'starter', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input
                      type="text"
                      value={row.pro}
                      onChange={(e) => updateComparisonRow(idx, 'pro', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <input
                      type="text"
                      value={row.ent}
                      onChange={(e) => updateComparisonRow(idx, 'ent', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeComparisonRow(idx)}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 5, padding: '5px 8px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing FAQs */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Pricing FAQs
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Common billing and subscription questions displayed on `/pricing`.
            </p>
          </div>
          <button
            type="button"
            onClick={addFaq}
            style={{
              padding: '7px 14px',
              background: 'var(--color-secondary)',
              color: '#fff',
              borderRadius: 7,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add FAQ
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pricingDraft.faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Question #{idx + 1}</label>
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 5, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={faq.q}
                onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                style={{ ...inputStyle, fontWeight: 600 }}
              />
              <div>
                <label style={labelStyle}>Answer</label>
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
