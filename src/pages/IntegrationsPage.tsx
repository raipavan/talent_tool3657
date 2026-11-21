import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/SectionHead';
import { SkCtaBanner, SkHero, SkLogoMarquee } from '../components/SeekOutUI';
import { useIntegrationsContent, usePageOverride } from '../cms/CmsProvider';

const categoryTabs = ['All Integrations', 'ATS', 'HRMS', 'Video', 'Communication'] as const;

export function IntegrationsPage() {
  const { items: integrationsList } = useIntegrationsContent();
  const [activeCategory, setActiveCategory] = useState<string>('All Integrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState<'candidates' | 'jobs' | 'assessments' | 'webhooks'>('candidates');

  const filteredIntegrations = integrationsList.filter((item) => {
    const matchCat = activeCategory === 'All Integrations' || item.category === activeCategory;
    const matchSearch =
      `${item.name} ${item.tagline} ${item.description} ${item.features.join(' ')}`
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  const override = usePageOverride('/integrations');
  const title = (override?.headline || override?.title || 'Recruiting Agentic AI that works inside your stack').replace(/\*/g, '');
  const subtitle = override?.lede || 'You should not have to replace your ATS or HRMS to hire smarter. TalentPool365 syncs candidate profiles, scores, and statuses directly inside the tools your team already uses.';
  const eyebrow = override?.eyebrow || 'ECOSYSTEM & API';
  const primaryCta = override?.primaryCtaText
    ? { label: override.primaryCtaText, href: override.primaryCtaHref || '/get-started#book-meeting' }
    : { label: 'Book a demo →', href: '/get-started#book-meeting' };
  const secondaryCta = override?.secondaryCtaText
    ? { label: override.secondaryCtaText, href: override.secondaryCtaHref || '#directory' }
    : { label: 'See all integrations ↓', href: '#directory' };

  return (
    <main className="sk-page">
      <SkHero
        eyebrow={eyebrow}
        eyebrowIcon="layers"
        title={title}
        subtitle={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        aside={
          <div className="sk-mosaic" aria-label="Ecosystem partner mosaic">
            <div className="sk-mosaic-tile">Workday</div>
            <div className="sk-mosaic-tile">Greenhouse</div>
            <div className="sk-mosaic-tile">SAP</div>
            <div className="sk-mosaic-tile">Lever</div>
            <div className="sk-mosaic-tile sk-mosaic-tile--center">TalentPool365</div>
            <div className="sk-mosaic-tile">Oracle HCM</div>
            <div className="sk-mosaic-tile">Zoom</div>
            <div className="sk-mosaic-tile">WhatsApp</div>
            <div className="sk-mosaic-tile">Slack</div>
          </div>
        }
      />

      <SkLogoMarquee />

      {/* Why Connect Section */}
      <section className="section section--light" id="why-connect">
        <div className="container">
          <SectionHead
            eyebrow="Zero Workflow Disruption"
            title="Why connect your *existing hiring tools?*"
            body="TalentPool365 doesn't demand you rip and replace your tech stack. It adds an intelligent Agentic AI layer to your current software."
          />

          <div className="grid grid--4">
            <Reveal as="div" className="card value-card" delay={0}>
              <div className="icon-tile"><Icon name="refresh" /></div>
              <h3>No Double Entry</h3>
              <p>Candidate profiles, assessments, and status updates flow between systems automatically with zero copy-pasting.</p>
            </Reveal>

            <Reveal as="div" className="card value-card" delay={1}>
              <div className="icon-tile"><Icon name="shield" /></div>
              <h3>Keep System of Record</h3>
              <p>Your ATS remains the single source of truth while TalentPool365 supercharges sourcing, screening, and evaluations.</p>
            </Reveal>

            <Reveal as="div" className="card value-card" delay={2}>
              <div className="icon-tile"><Icon name="rocket" /></div>
              <h3>Faster Rollout</h3>
              <p>Deploy in hours rather than months. Your recruiting team keeps working in familiar interfaces without retraining.</p>
            </Reveal>

            <Reveal as="div" className="card value-card" delay={3}>
              <div className="icon-tile"><Icon name="chart" /></div>
              <h3>Complete Visibility</h3>
              <p>Assessment scores, Agentic AI transcripts, and interview shortlists appear right where your recruiters already review candidates.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="section" id="directory">
        <div className="container">
          <SectionHead
            eyebrow="Integration Catalog"
            title="Browse supported *connectors & platforms*"
            body="Explore certified connectors for enterprise ATS, HRMS, video interviewing, and communication platforms."
          />

          <div className="catalog-toolbar">
            <div className="filter" role="group" aria-label="Integration categories">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-opt${activeCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="field search-field">
              <label htmlFor="integration-search" className="sr-only">Search integrations</label>
              <input
                id="integration-search"
                type="search"
                placeholder="Search Workday, Slack, Zoom, WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <p className="result-count" role="status">
            Showing {filteredIntegrations.length} verified connector{filteredIntegrations.length === 1 ? '' : 's'}
          </p>

          <div className="integration-cards-grid">
            {filteredIntegrations.map((item, idx) => (
              <Reveal as="article" key={item.name} className="integration-feature-card" delay={idx % 3}>
                <div className="integration-card-header">
                  <div className="integration-logo-badge">{item.mark}</div>
                  <div>
                    <span className="integration-cat-label">{item.category}</span>
                    <h3 className="integration-title">{item.name}</h3>
                  </div>
                </div>

                <p className="integration-tagline">{item.tagline}</p>
                <p className="integration-desc">{item.description}</p>

                <div className="integration-key-points">
                  <strong>Key capabilities:</strong>
                  <ul className="ticks">
                    {item.features.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                </div>

                <div className="integration-card-footer">
                  <a className="btn btn-outline btn-sm" href="/get-started#book-meeting">
                    Request Integration <Icon name="arrow-right" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {!filteredIntegrations.length && (
            <div className="empty-state">
              <h3>No integration matches your query</h3>
              <p>We are constantly expanding our integrations. Tell us which platform you use and we’ll build a connector.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All Integrations');
                }}
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* What Gets Synced Section */}
      <section className="section section--light" id="what-gets-synced">
        <div className="container">
          <SectionHead
            eyebrow="Data Synchronization"
            title="What gets synced between *systems?*"
            body="Your team chooses exactly which fields and events flow between TalentPool365 and your corporate HR stack."
          />

          <div className="sync-cards-container">
            <div className="sync-box">
              <span className="sync-icon"><Icon name="users" /></span>
              <h4>Candidate & Employee Profiles</h4>
              <p>Full names, contact details, work history, education, skills, and current employer information.</p>
            </div>

            <div className="sync-box">
              <span className="sync-icon"><Icon name="briefcase" /></span>
              <h4>Job Requisitions & Roles</h4>
              <p>Department, job code, hiring manager, seniority level, compensation band, and location.</p>
            </div>

            <div className="sync-box">
              <span className="sync-icon"><Icon name="clipboard-check" /></span>
              <h4>Scores & Assessments</h4>
              <p>Match scores, technical coding evaluation reports, cognitive percentiles, and interview scorecards.</p>
            </div>

            <div className="sync-box">
              <span className="sync-icon"><Icon name="file-check" /></span>
              <h4>Offer & Pre-Onboarding Data</h4>
              <p>Signed offer letters, digital signatures, collected ID documents, and verified joining dates.</p>
            </div>
          </div>

          <div className="how-sync-works-strip">
            <h3>How integration works in 3 simple steps</h3>
            <div className="how-sync-steps">
              <div className="sync-step">
                <span className="sync-step-num">1</span>
                <strong>Connect</strong>
                <p>Link your ATS or HRMS to TalentPool365 with secure OAuth or API keys.</p>
              </div>
              <div className="sync-step">
                <span className="sync-step-num">2</span>
                <strong>Map Fields</strong>
                <p>Choose which jobs, candidates, and custom fields flow automatically.</p>
              </div>
              <div className="sync-step">
                <span className="sync-step-num">3</span>
                <strong>Hire & Automate</strong>
                <p>Run sourcing and screening; results update your ATS in real time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Documentation Section */}
      <section className="section" id="api-documentation">
        <div className="container">
          <SectionHead
            eyebrow="For Technical & Engineering Teams"
            title="Build on TalentPool365 with our *developer-friendly API*"
            body="If your tool isn’t in our pre-built catalog, connect it in minutes. Move candidate, job, and assessment data programmatically."
          />

          <div className="api-playground-split">
            <div className="api-info-panel">
              <h3>REST API & Real-Time Webhooks</h3>
              <p>
                The TalentPool365 API provides secure, token-based authentication with granular permissions
                and encrypted endpoints. Automate your proprietary internal workflows effortlessly.
              </p>

              <div className="api-nav-tabs">
                <button
                  type="button"
                  className={`api-tab-btn${apiEndpoint === 'candidates' ? ' is-active' : ''}`}
                  onClick={() => setApiEndpoint('candidates')}
                >
                  Candidates API
                </button>
                <button
                  type="button"
                  className={`api-tab-btn${apiEndpoint === 'jobs' ? ' is-active' : ''}`}
                  onClick={() => setApiEndpoint('jobs')}
                >
                  Jobs Requisitions
                </button>
                <button
                  type="button"
                  className={`api-tab-btn${apiEndpoint === 'assessments' ? ' is-active' : ''}`}
                  onClick={() => setApiEndpoint('assessments')}
                >
                  Assessments
                </button>
                <button
                  type="button"
                  className={`api-tab-btn${apiEndpoint === 'webhooks' ? ' is-active' : ''}`}
                  onClick={() => setApiEndpoint('webhooks')}
                >
                  Webhooks
                </button>
              </div>

              <ul className="ticks" style={{ marginTop: 20 }}>
                <li>Secure Bearer token key-based authentication with instant rotation</li>
                <li>Webhook event triggers for candidate status changes & offer acceptance</li>
                <li>Comprehensive rate limiting (up to 1,000 req/min for Enterprise)</li>
                <li>Sandbox testing environment with pre-populated dummy candidate records</li>
              </ul>

              <div style={{ marginTop: 28 }}>
                <a className="btn btn-primary" href="/company/contact">
                  Request API Sandbox Access
                </a>
              </div>
            </div>

            <div className="api-code-terminal">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="terminal-title">TalentPool365 REST API v1</span>
              </div>

              <div className="terminal-body">
                {apiEndpoint === 'candidates' && (
                  <pre>
                    <code>
{`// 1. Fetch Shortlisted Candidates
GET /v1/candidates?job_id=req_89201&status=shortlisted
Host: api.talentpool365.com
Authorization: Bearer tp365_live_sec_99a8b1...
Content-Type: application/json

// Response 200 OK
{
  "total": 12,
  "candidates": [
    {
      "id": "cand_94821",
      "name": "Alex Taylor",
      "email": "alex.taylor@example.com",
      "match_score": 94,
      "skills_matched": ["React", "TypeScript", "Node.js"],
      "assessment_status": "passed",
      "assessment_percentile": 96.4,
      "interview_completed": true,
      "recommended_action": "extend_offer"
    }
  ]
}`}
                    </code>
                  </pre>
                )}

                {apiEndpoint === 'jobs' && (
                  <pre>
                    <code>
{`// 2. Publish New Job Requisition
POST /v1/jobs
Host: api.talentpool365.com
Authorization: Bearer tp365_live_sec_99a8b1...
Content-Type: application/json

{
  "title": "Lead DevOps Engineer",
  "department": "Infrastructure",
  "location": "Bengaluru, Hybrid",
  "must_have_skills": ["Kubernetes", "Terraform", "AWS"],
  "min_experience_years": 5,
  "multi_board_syndication": ["linkedin", "naukri", "indeed"],
  "enable_ai_sourcing": true
}`}
                    </code>
                  </pre>
                )}

                {apiEndpoint === 'assessments' && (
                  <pre>
                    <code>
{`// 3. Trigger Automated Assessment & Interview
POST /v1/assessments/schedule
Host: api.talentpool365.com
Authorization: Bearer tp365_live_sec_99a8b1...

{
  "candidate_id": "cand_94821",
  "test_battery": ["technical_coding", "cognitive_reasoning"],
  "delivery_channel": "whatsapp_and_email",
  "expiration_days": 3,
  "proctoring_level": "strict"
}`}
                    </code>
                  </pre>
                )}

                {apiEndpoint === 'webhooks' && (
                  <pre>
                    <code>
{`// 4. Real-time Webhook Event Payload
POST https://your-server.com/webhooks/talentpool365
Content-Type: application/json
X-TP365-Signature: sha256=d3b07384d113edec49eaa6...

{
  "event": "offer.accepted",
  "timestamp": "2026-11-17T12:00:00Z",
  "data": {
    "candidate_id": "cand_94821",
    "job_id": "req_89201",
    "joining_date": "2026-12-01",
    "salary_ctc": "Approved",
    "e_signature_verified": true
  }
}`}
                    </code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkCtaBanner />
    </main>
  );
}