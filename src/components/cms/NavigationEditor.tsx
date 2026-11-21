import { useCms } from '../../cms/CmsProvider';
import {
  CmsAccordion,
  CmsListEditor,
  CmsTextArea,
  CmsTextInput,
} from './CmsFieldEditors';

export function NavigationEditor() {
  const { navigation, updateNavigation } = useCms();

  const header = navigation?.header || {};
  const footer = navigation?.footer || {};
  const navItems = navigation?.navItems || [];
  const footerColumns = navigation?.footerColumns || [];
  const footerLegalLinks = navigation?.footerLegalLinks || [];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Header &amp; Footer Global Editor
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
          Control the Header Sign In button URL, top navigation menus, office address card, phone number, footer columns, and legal links.
        </p>
      </div>

      {/* 1. HEADER SIGN IN BUTTON */}
      <CmsAccordion title="Header Sign In Button" badge="Primary Header Action" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <CmsTextInput
            label="Button Label"
            value={header?.signIn?.label ?? 'Sign In'}
            onChange={(v) =>
              updateNavigation({
                ...navigation,
                header: { ...header, signIn: { ...(header.signIn || {}), label: v } },
              })
            }
            placeholder="Sign In"
          />
          <CmsTextInput
            label="Sign In Button URL"
            type="url"
            value={header?.signIn?.href ?? '/get-started'}
            onChange={(v) =>
              updateNavigation({
                ...navigation,
                header: { ...header, signIn: { ...(header.signIn || {}), href: v } },
              })
            }
            placeholder="https://app.talentpool365.com/login"
            help="Enter any external URL (opens in new tab) or internal route like /get-started."
          />
        </div>
      </CmsAccordion>

      {/* 2. TOP NAVIGATION LINKS */}
      <CmsAccordion title="Top Navigation Bar Items" badge={`${navItems.length} items`}>
        <CmsListEditor
          title="Navigation Entries"
          items={navItems}
          onChange={(next) => updateNavigation({ ...navigation, navItems: next })}
          createNew={() => ({ id: `nav-${Date.now()}`, label: 'New Link', href: '/', links: undefined as { label: string; href: string; desc?: string }[] | undefined })}
          addLabel="+ Add Nav Link"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem={(item: any, _, update) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <CmsTextInput label="Label" value={item.label || ''} onChange={(v) => update({ label: v })} />
                <CmsTextInput label="Link URL" value={item.href || ''} onChange={(v) => update({ href: v })} />
              </div>
              {Array.isArray(item.links) && (
                <CmsListEditor
                  title="Dropdown Sub-Links"
                  items={item.links}
                  onChange={(links) => update({ links })}
                  createNew={() => ({ label: 'Sub Link', href: '/', desc: '' })}
                  addLabel="+ Add Sub-Link"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  renderItem={(sub: any, __, updateSub) => (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8 }}>
                      <CmsTextInput label="Label" value={sub.label || ''} onChange={(v) => updateSub({ label: v })} />
                      <CmsTextInput label="URL" value={sub.href || ''} onChange={(v) => updateSub({ href: v })} />
                      <CmsTextInput label="Short Description" value={sub.desc || ''} onChange={(v) => updateSub({ desc: v })} />
                    </div>
                  )}
                />
              )}
            </>
          )}
        />
      </CmsAccordion>

      {/* 3. FOOTER BRAND, ADDRESS & PHONE */}
      <CmsAccordion title="Footer Office Address, Phone & Copyright" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CmsTextInput
            label="Office Country Badge"
            value={footer.officeCountry ?? 'USA'}
            onChange={(v) => updateNavigation({ ...navigation, footer: { ...footer, officeCountry: v } })}
          />
          <CmsTextInput
            label="Phone Number"
            value={footer.phone ?? '+1 302-231-1816'}
            onChange={(v) => updateNavigation({ ...navigation, footer: { ...footer, phone: v } })}
          />
        </div>
        <CmsTextArea
          label="Office Street Address"
          value={footer.officeAddress ?? ''}
          onChange={(v) => updateNavigation({ ...navigation, footer: { ...footer, officeAddress: v } })}
          rows={2}
        />
        <CmsTextInput
          label="Bottom Copyright Text (year is added automatically)"
          value={footer.copyright ?? 'TalentPool365 B.V. All rights reserved.'}
          onChange={(v) => updateNavigation({ ...navigation, footer: { ...footer, copyright: v } })}
        />
        <CmsTextArea
          label="Footer Mission / Slogan"
          value={footer.slogan ?? ''}
          onChange={(v) => updateNavigation({ ...navigation, footer: { ...footer, slogan: v } })}
          rows={2}
        />
      </CmsAccordion>

      {/* 4. FOOTER LINK COLUMNS */}
      <CmsAccordion title="Footer Link Columns" badge={`${footerColumns.length} columns`}>
        <CmsListEditor
          title="Footer Columns"
          items={footerColumns}
          onChange={(next) => updateNavigation({ ...navigation, footerColumns: next })}
          createNew={() => ({ title: 'New Column', links: [{ label: 'Link', href: '/' }] })}
          addLabel="+ Add Column"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem={(col: any, _, update) => (
            <>
              <CmsTextInput label="Column Heading" value={col.title || ''} onChange={(v) => update({ title: v })} />
              <CmsListEditor
                title="Links"
                items={col.links || []}
                onChange={(links) => update({ links })}
                createNew={() => ({ label: 'New Link', href: '/' })}
                addLabel="+ Add Link"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                renderItem={(lnk: any, __, updateLnk) => (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <CmsTextInput label="Label" value={lnk.label || ''} onChange={(v) => updateLnk({ label: v })} />
                    <CmsTextInput label="URL" value={lnk.href || ''} onChange={(v) => updateLnk({ href: v })} />
                  </div>
                )}
              />
            </>
          )}
        />
      </CmsAccordion>

      {/* 5. FOOTER LEGAL LINKS */}
      <CmsAccordion title="Footer Bottom Legal Bar Links" badge={`${footerLegalLinks.length} links`}>
        <CmsListEditor
          title="Bottom Bar Links"
          items={footerLegalLinks}
          onChange={(next) => updateNavigation({ ...navigation, footerLegalLinks: next })}
          createNew={() => ({ label: 'Policy', href: '/legal' })}
          addLabel="+ Add Link"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem={(lnk: any, _, update) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <CmsTextInput label="Label" value={lnk.label || ''} onChange={(v) => update({ label: v })} />
              <CmsTextInput label="URL" value={lnk.href || ''} onChange={(v) => update({ href: v })} />
            </div>
          )}
        />
      </CmsAccordion>
    </div>
  );
}
