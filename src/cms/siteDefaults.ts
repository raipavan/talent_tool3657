/* Complete unified website content defaults for TalentPool365 Self-Hosted CMS.
   Every section on every page reads from CmsProvider (which deep-merges backend + local edits over these defaults). */

import homeJson from '../../content/home.json';
import navigationJson from '../../content/navigation.json';
import solutionsJson from '../../content/solutions.json';
import careersJson from '../../content/company/careers.json';
import contactJson from '../../content/company/contact.json';
import leadershipJson from '../../content/company/leadership.json';
import newsJson from '../../content/company/news.json';
import partnersJson from '../../content/company/partners.json';
import technologyJson from '../../content/company/technology.json';
import { productPages, type ProductPage } from '../data/products';
import { stories as defaultStories, type Story } from '../data/content';
import { resources as defaultResources } from '../data/resources';

export interface PlanModel {
  name: string;
  badge: string;
  target: string;
  priceMonthly: string;
  priceAnnual: string;
  trialNote: string;
  isPopular?: boolean;
  featureTitle: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export interface PricingComparisonFeature {
  feature: string;
  starter: string;
  pro: string;
  ent: string;
}

export interface PricingFAQ {
  q: string;
  a: string;
}

export interface PricingContentModel {
  heroTitle?: string;
  heroSubtitle?: string;
  plans: PlanModel[];
  comparisonFeatures: PricingComparisonFeature[];
  faqs: PricingFAQ[];
}

export interface PageContentOverride {
  title?: string;
  eyebrow?: string;
  headline?: string;
  lede?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  sectionTitle?: string;
  sectionBody?: string;
  features?: string[];
}

export interface CaseStudyStory {
  id: string;
  company: string;
  industry: string;
  size: string;
  useCase: string;
  title: string;
  challenge: string;
  solution: string[];
  featuresUsed: string[];
  results: { stat: string; label: string }[];
  bulletResults: string[];
  quote: { text: string; author: string; role: string };
  whatsNext: string;
}

export interface IntegrationItem {
  name: string;
  category: 'ATS' | 'HRMS' | 'Video' | 'Communication';
  mark: string;
  tagline: string;
  description: string;
  features: string[];
}

export interface BlogPost {
  id: string;
  category: string;
  title: string;
  tagline: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  paragraphs: string[];
}

export interface ResourceItem {
  id: string;
  type: string;
  title: string;
  intro: string;
  paragraphs: string[];
}

export interface WorkflowStepItem {
  title: string;
  owner: string;
  body: string;
  output: string;
  href: string;
}

export interface SupportDeskCard {
  id: string;
  tag: string;
  num: string;
  title: string;
  body: string;
  links: { label: string; href: string }[];
}

export interface LegalClause {
  num: string;
  title: string;
  content: string;
}

export interface GetStartedIntent {
  id: string;
  label: string;
  title: string;
  body: string;
}

export interface SiteContentModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  home: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  pricing: PricingContentModel;
  products: ProductPage[];
  productsOverview: {
    stats: { value: string; label: string }[];
    stagesTag: string;
    stagesTitle: string;
    stagesSubtitle: string;
    layersTag: string;
    layersTitle: string;
    layersSubtitle: string;
  };
  solutions: {
    industryHeading: string;
    industryBody: string;
    sizeHeading: string;
    sizeBody: string;
    useCaseHeading: string;
    useCaseBody: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    industrySolutions: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sizeSolutions: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useCaseSolutions: any[];
  };
  howItWorksPage: {
    workflow: WorkflowStepItem[];
  };
  caseStudiesPage: {
    heroStats: { value: string; label: string }[];
    stories: CaseStudyStory[];
  };
  customersPage: {
    notice: string;
    stories: Story[];
    roiTitle: string;
    roiBody: string;
    videoTag: string;
    videoTitle: string;
    videoBody: string;
    videoLinkLabel: string;
    videoLinkHref: string;
  };
  integrationsPage: {
    items: IntegrationItem[];
  };
  resourcesPage: {
    resources: ResourceItem[];
    blogPosts: BlogPost[];
    glossary: { term: string; definition: string }[];
  };
  company: {
    aboutQuickLinks: { href: string; icon: string; title: string; body: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leaders: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadershipPrinciples: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workPrinciples: any[];
    benefits: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vacancies: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hiringSteps: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    partnerPrograms: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    partnerSteps: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scoreSteps: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    guardrails: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    platformFacts: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildingBlocks: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    researchTracks: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pressItems: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mediaAssets: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offices: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contactChannels: any[];
  };
  getStartedPage: {
    intents: GetStartedIntent[];
    previewName: string;
    previewBadge: string;
    previewDesc: string;
    checklist: string[];
    stats: { value: string; label: string }[];
    tourBannerTitle: string;
    tourBannerSub: string;
    tourSectionTag: string;
    tourSectionTitle: string;
    tourSectionBody: string;
  };
  supportPage: {
    helpCenterTag: string;
    helpCenterTitle: string;
    deskCards: SupportDeskCard[];
    faqs: { question: string; answer: string }[];
    ticketTag: string;
    ticketTitle: string;
    ticketBody: string;
    supportEmail: string;
    statusTag: string;
    statusTitle: string;
    statusBody: string;
  };
  legalPage: {
    dpoTitle: string;
    dpoBody: string;
    dpoEmail: string;
    privacyTitle: string;
    privacyEffectiveDate: string;
    privacySections: LegalClause[];
    termsTitle: string;
    termsEffectiveDate: string;
    termsSections: LegalClause[];
    gdprTitle: string;
    gdprSubtitle: string;
    gdprCards: { title: string; body: string }[];
    dpaCtaLabel: string;
    dpaCtaHref: string;
  };
  globalBanners: {
    marqueeLabel: string;
    marqueeLogos: string[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  pageOverrides: Record<string, PageContentOverride>;
}

export const defaultPricingData: PricingContentModel = {
  heroTitle: 'Try TalentPool365 free for 14 days',
  heroSubtitle: 'Run Agentic AI sourcing, semantic resume screening, and automated interviews on a live role. No credit card required.',
  plans: [
    {
      name: 'Starter',
      badge: 'Starter Plan',
      target: 'Best for startups and small teams making their first hires.',
      priceMonthly: '$99',
      priceAnnual: '$79',
      trialNote: 'Free for 14 days, no card required',
      isPopular: false,
      featureTitle: 'Everything you need to move from spreadsheets to smarter hiring:',
      features: [
        'Agentic AI candidate discovery and resume database search',
        'Resume parsing and Agentic AI candidate matching',
        'Basic assessments and automated interviews',
        'Candidate pipeline and email automation',
        'Interview scheduling calendar sync',
        'Up to 5 active jobs and 500 candidates/month',
        'Standard email support',
      ],
      ctaText: 'Start Free Trial',
      ctaHref: '/get-started#start-free-trial',
    },
    {
      name: 'Professional',
      badge: 'Professional Plan',
      target: 'Best for growing and mid-sized companies hiring across teams.',
      priceMonthly: '$249',
      priceAnnual: '$199',
      trialNote: 'Billed annually or monthly',
      isPopular: true,
      featureTitle: 'Everything in Starter, plus more automation & insight:',
      features: [
        'Advanced Agentic AI screening, ranking and smart shortlisting',
        'Full Agentic AI assessments: technical, aptitude, cognitive and behavioral',
        'Agentic AI video, voice and coding interviews with proctoring',
        'WhatsApp integration and automated follow-ups',
        'Team collaboration, feedback scorecards and approval workflows',
        'Analytics and reporting KPI dashboards',
        'ATS, HRMS and video platform integrations',
        'Higher active job and candidate capacity',
        'Priority technical support',
      ],
      ctaText: 'Book a Demo & Trial →',
      ctaHref: '/get-started#book-meeting',
    },
    {
      name: 'Enterprise',
      badge: 'Enterprise Plan',
      target: 'Best for large and global organizations with complex hiring needs.',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      trialNote: 'Volume discounts & custom contracts',
      isPopular: false,
      featureTitle: 'Everything in Professional, plus scale & control:',
      features: [
        'Unlimited high-volume candidate hiring pipeline',
        'Advanced role-based access and custom approval chains',
        'Full immutable audit trails and compliance security controls',
        'Developer REST API access & custom webhooks',
        'Diversity analytics and recruiter productivity leaderboard',
        'Single sign-on (SAML / SSO) and custom data residency',
        'Dedicated account manager & guided rollout',
        'Guaranteed 99.9% uptime SLA',
      ],
      ctaText: 'Contact Enterprise Sales',
      ctaHref: '/company/contact',
    },
  ],
  comparisonFeatures: [
    { feature: 'Agentic AI Candidate Discovery', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Resume Database Search', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Resume Parsing & Matching', starter: '✓', pro: '✓', ent: '✓' },
    { feature: 'Candidate Ranking & Shortlisting', starter: 'Basic', pro: 'Advanced', ent: 'Advanced' },
    { feature: 'Agentic AI Assessments (Tech, Aptitude, Cognitive)', starter: 'Basic', pro: 'Full suite', ent: 'Full suite' },
    { feature: 'Agentic AI Interviews (Video, Voice, Coding)', starter: 'Limited', pro: '✓ (Unlimited)', ent: '✓ (Unlimited)' },
    { feature: 'Proctoring & Anti-Cheat Monitoring', starter: '–', pro: '✓', ent: '✓' },
    { feature: 'Recruiter Workspace & Collaboration', starter: 'Basic', pro: '✓', ent: '✓' },
    { feature: 'Approval Workflows & Audit Chains', starter: '–', pro: '✓', ent: 'Custom multi-tier' },
    { feature: 'WhatsApp & Email Automation', starter: 'Email only', pro: '✓ (WhatsApp & Email)', ent: '✓ (WhatsApp & Email)' },
    { feature: 'Analytics & Reporting Dashboards', starter: 'Basic KPIs', pro: '✓ (Full Funnel)', ent: 'Advanced + BI Sync' },
    { feature: 'ATS & HRMS Integrations', starter: '–', pro: '✓ (Certified)', ent: '✓ + Custom Webhooks' },
    { feature: 'Developer REST API Access', starter: '–', pro: '–', ent: '✓ (Full Access)' },
  ],
  faqs: [
    {
      q: 'How does per-job pricing work compared to per-seat pricing?',
      a: 'Unlike traditional recruiting software that charges $150+ for every recruiter or hiring manager seat, TalentPool365 gives you unlimited user seats on all plans. You only pay for active job openings being worked in a given billing cycle.',
    },
    {
      q: 'What is considered an "active job"?',
      a: 'An active job is any open requisition currently accepting candidates, running screening assessments, or conducting automated interviews. Once an offer is signed and the requisition closes, that slot becomes free for your next opening.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! You can explore TalentPool365 on a 14-day free trial without a credit card. Test Agentic AI candidate discovery, resume parsing, and automated interviews on your own roles.',
    },
    {
      q: 'Do you offer discounts for annual billing?',
      a: 'Yes. Organizations choosing annual billing receive a 20% discount across Starter and Professional plans, as well as included onboarding assistance.',
    },
    {
      q: 'Is my candidate data secure and GDPR compliant?',
      a: 'Absolutely. All candidate resumes, test scores, and interview recordings are protected with AES-256 encryption at rest and TLS in transit. We support full GDPR data erasure and right-to-access requests.',
    },
  ],
};

export const defaultCaseStudiesData: CaseStudyStory[] = [
  {
    id: 'apex-bpo',
    company: 'Apex Global BPO',
    industry: 'BPO & Contact Centers',
    size: 'Enterprise',
    useCase: 'High Volume Hiring',
    title: 'How Apex Global BPO filled 200 customer support agent roles in 3 weeks with automated voice screening',
    challenge: 'Apex received over 8,500 applications for multi-lingual contact center agent positions across two cities. The 4-person recruiting team was overwhelmed by manual resume screening and telephone screening rounds, leading to a 38-day average hiring cycle and severe candidate drop-off before day one.',
    solution: [
      'Deployed bulk Agentic AI resume parsing and keyword-agnostic skill extraction to process all 8,500+ resumes within 24 hours.',
      'Configured asynchronous voice-based Agentic AI interviews to assess spoken fluency, active listening, and tone 24/7 without recruiter calls.',
      'Automated WhatsApp follow-up sequences and instant slot self-scheduling for final manager panel interviews.',
    ],
    featuresUsed: ['Agentic AI Candidate Screening', 'Voice-Based Interviews', 'WhatsApp Integration', 'Smart Shortlisting'],
    results: [
      { stat: '72%', label: 'Reduction in time-to-hire' },
      { stat: '8,500+', label: 'Candidates screened automatically' },
      { stat: '3 wks', label: 'To fill 200 open seats' },
      { stat: '91%', label: 'Offer acceptance rate' },
    ],
    bulletResults: [
      'Time-to-hire plummeted from 38 days to 11 days',
      'Over 600 recruiter hours saved during a single ramp-up quarter',
      'First-round screening completion rate rose to 94% on mobile devices',
      'Zero candidate leakage through automated WhatsApp engagement nudges',
    ],
    quote: {
      text: 'TalentPool365 turned our highest-stress quarterly hiring drive into a smooth, predictable system. Voice interviews let us evaluate spoken language at scale without our recruiters having to spend all day on repetitive screening calls.',
      author: 'Priya Sundaram',
      role: 'Head of Talent Acquisition, Apex Global BPO',
    },
    whatsNext: 'Apex is rolling out TalentPool365 across 4 additional international delivery hubs and integrating conversational language tests for Portuguese and German hiring.',
  },
  {
    id: 'novatech-solutions',
    company: 'NovaTech Cloud Solutions',
    industry: 'IT & Technology',
    size: 'Mid-Market',
    useCase: 'Contract Staffing',
    title: 'How NovaTech slashed engineering hiring cycles from 42 days to 12 days using live Agentic AI coding evaluations',
    challenge: 'NovaTech was scaling its cloud architecture and DevOps practice for multi-cloud enterprise clients. Senior engineers were spending 15+ hours weekly evaluating technical tests and conducting preliminary technical phone screens, creating bottlenecks in delivery roadmap.',
    solution: [
      'Implemented semantic Agentic AI candidate discovery across dormant resume archives and developer networks.',
      'Replaced take-home assignments with automated live coding interviews featuring real-time test cases and proctoring.',
      'Established transparent scorecards comparing code cleanliness, algorithmic efficiency, and problem-solving reasoning side by side.',
    ],
    featuresUsed: ['Agentic AI Candidate Discovery', 'Coding Interviews', 'Technical Assessments', 'Recruiter Workspace'],
    results: [
      { stat: '68%', label: 'Faster tech offer releases' },
      { stat: '15 hrs', label: 'Saved per senior engineer/week' },
      { stat: '4.4×', label: 'Outreach response rate' },
      { stat: '96%', label: 'Candidate interview satisfaction' },
    ],
    bulletResults: [
      'Technical screening completed within 48 hours of application submission',
      'Engineering interview hours reduced by 74% across 32 engineering managers',
      'Candidate drop-off dropped to under 6% due to instant code feedback and flex scheduling',
    ],
    quote: {
      text: 'Instead of our engineering leaders arguing over take-home zip files, TalentPool365 provides an objective, code-playback scorecard. We hire top-tier developers before competitors even schedule their first round.',
      author: 'Marcus Vance',
      role: 'VP of Engineering, NovaTech Cloud',
    },
    whatsNext: 'NovaTech is integrating TalentPool365 with Jira and GitHub to automatically calibrate assessment difficulty against upcoming sprint requirements.',
  },
  {
    id: 'crestview-health',
    company: 'Crestview Healthcare Network',
    industry: 'Healthcare',
    size: 'Large Enterprises',
    useCase: 'High Volume Hiring',
    title: 'How Crestview eliminated credential verification delays and staffed 450 nurses and allied health specialists',
    challenge: 'Staffing ICU nurses and certified technicians across 14 hospital campuses was hampered by multi-week credential verification, state licensing checks, and complex shift requirements, causing costly agency nurse spend.',
    solution: [
      'Automated extraction and verification of clinical licenses, nursing council certifications, and BLS/ACLS compliance upon application.',
      'Created specialized shift-matched talent pools matching staff availability with campus weekend and night rosters.',
      'Introduced self-service video interviews allowing medical directors to review clinical situational judgement at convenient times.',
    ],
    featuresUsed: ['Resume Parsing & Skill Extraction', 'Talent Pool Management', 'Automated Video Interviews', 'Pre-Onboarding'],
    results: [
      { stat: '24 days', label: 'Saved per clinical hire' },
      { stat: '450+', label: 'Nurses & technicians onboarded' },
      { stat: '100%', label: 'Credential audit compliance' },
      { stat: '42%', label: 'Reduction in agency contractor spend' },
    ],
    bulletResults: [
      'Credential verification time reduced from 16 days to under 3 hours',
      'Zero compliance deficiencies during state healthcare accreditation audit',
      'Day-one readiness improved to 98% with automated document pre-onboarding checklists',
    ],
    quote: {
      text: 'In healthcare, an unfilled position directly impacts patient care. TalentPool365 took the clerical nightmare out of clinical licensing and credentialing so our nursing supervisors could focus on patient-facing interviews.',
      author: 'Dr. Elena Rostova',
      role: 'Chief Medical & Talent Officer, Crestview Health',
    },
    whatsNext: 'Crestview is deploying TalentPool365 across rural emergency clinics and introducing automated annual credential renewal tracking.',
  },
  {
    id: 'vanguard-financial',
    company: 'Vanguard Capital Partners',
    industry: 'BFSI',
    size: 'Enterprise',
    useCase: 'Campus Hiring',
    title: 'How Vanguard screened 12,000 university applicants for wealth management with zero human bias',
    challenge: 'Vanguard’s nationwide campus recruitment drive for quantitative analysts and wealth advisors attracted over 12,000 resumes. Reviewers were biased toward familiar university brand names, missing extraordinary talent from non-target institutions.',
    solution: [
      'Implemented blind Agentic AI screening that stripped university names, photos, and demographic proxies, focusing strictly on competencies.',
      'Conducted randomized cognitive reasoning and financial aptitude assessments with Agentic AI-proctored verification.',
      'Automated multi-evaluator approval chains and structured scorecards for final executive panel rounds.',
    ],
    featuresUsed: ['Cognitive Tests', 'Fair Hiring Agentic AI', 'Candidate Ranking', 'Audit Trails'],
    results: [
      { stat: '12,000+', label: 'Campus applicants assessed' },
      { stat: '3.2×', label: 'Increase in diversity representation' },
      { stat: '100%', label: 'Auditable decision trails' },
      { stat: '14 days', label: 'From campus test to final offers' },
    ],
    bulletResults: [
      'Target university bias eliminated; hired graduates from 48 non-traditional colleges',
      'Full compliance audit trail produced for banking regulatory inspections',
      'Offer-to-joining ratio reached a historic high of 93%',
    ],
    quote: {
      text: 'The explainable Agentic AI scorecards gave our executive committee complete confidence. Every candidate was ranked on genuine mathematical and behavioral aptitude, creating our most diverse and high-performing cohort to date.',
      author: 'Alistair Finch',
      role: 'Global Head of Early Careers, Vanguard Capital',
    },
    whatsNext: 'Vanguard is rolling out TalentPool365 for lateral wealth advisory recruitment and internal mobility transitions.',
  },
  {
    id: 'nordic-retail',
    company: 'Nordic Living Retail Group',
    industry: 'Retail',
    size: 'Large Enterprises',
    useCase: 'High Volume Hiring',
    title: 'How Nordic Living staffed 65 stores for holiday peak season in 14 days using WhatsApp automation',
    challenge: 'Nordic Living needed 1,200 seasonal sales associates across Scandinavian and UK store locations. Store managers were inundated with paper applications and missed follow-ups while trying to run busy retail floors.',
    solution: [
      'Placed QR codes in stores and social ads linking directly to an automated WhatsApp career chatbot.',
      'Chatbot collected basic availability, customer service situational choices, and language preferences in 4 minutes.',
      'Approved candidates picked available 15-minute in-store interview slots directly from store manager Google Calendars.',
    ],
    featuresUsed: ['Agentic AI Chatbot', 'WhatsApp Integration', 'Interview Scheduling', 'Talent Pool Management'],
    results: [
      { stat: '1,200', label: 'Seasonal hires completed' },
      { stat: '4 mins', label: 'Average candidate application time' },
      { stat: '88%', label: 'WhatsApp response rate within 1 hr' },
      { stat: '0 hrs', label: 'Store manager phone scheduling time' },
    ],
    bulletResults: [
      'Peak seasonal staffing target completed 10 days ahead of schedule',
      'Talent pool of silver-medalist seasonal associates automatically banked for summer season',
      'Store manager satisfaction rating rose to 96% compared to prior year manual process',
    ],
    quote: {
      text: 'Our store managers are retailers, not recruitment administrators. Giving candidates a WhatsApp bot to apply and book their own interviews freed our store leads to focus on customer service and holiday merchandise.',
      author: 'Karin Lindqvist',
      role: 'Director of People Operations, Nordic Living Group',
    },
    whatsNext: 'Nordic Living is expanding TalentPool365 to permanent assistant store manager hiring and internal department cross-training.',
  },
  {
    id: 'titan-manufacturing',
    company: 'Titan Precision Manufacturing',
    industry: 'Manufacturing',
    size: 'Enterprise',
    useCase: 'Contract Staffing',
    title: 'How Titan filled 350 skilled CNC machinist & floor supervisor roles across 6 plants',
    challenge: 'Titan struggled with multi-plant talent shortages for specialized precision machinists, welding inspectors, and plant safety leads. Local print ads and regional staffing agencies caused fragmented data, high fees, and unfilled assembly lines.',
    solution: [
      'Centralized all plant hiring into one Recruiter Workspace with role-based plant supervisor permissions.',
      'Parsed technical ITI diplomas, welding certifications, and shift preferences automatically into clean records.',
      'Sent automated offer letters with digital e-signatures to candidate phones for immediate acceptance.',
    ],
    featuresUsed: ['Recruiter Workspace', 'Skill Extraction', 'Offer Letter Generation', 'E-Signature Integration'],
    results: [
      { stat: '350', label: 'Certified technicians hired' },
      { stat: '58%', label: 'Reduction in agency commission fees' },
      { stat: '2.4 days', label: 'Average offer-to-signed speed' },
      { stat: '99%', label: 'Plant shift coverage rate' },
    ],
    bulletResults: [
      'Plant downtime reduced to zero across all 6 manufacturing facilities',
      'Centralized visibility allowed plant managers to share vetted candidates across neighboring regions',
      'Full compliance verification before candidate set foot on factory floor',
    ],
    quote: {
      text: 'Having a single dashboard that tells us the hiring status across all six plants with automated digital offer signing transformed our operations. We haven’t had an idle assembly shift in six months.',
      author: 'Rajesh Mehra',
      role: 'VP Operations & HR, Titan Precision Manufacturing',
    },
    whatsNext: 'Titan is integrating TalentPool365 with its ERP system for automated factory gate pass and biometric security onboarding.',
  },
];

export const defaultIntegrationsList: IntegrationItem[] = [
  { name: 'Workday', category: 'ATS', mark: 'W', tagline: 'Bring Agentic AI-powered hiring into your Workday environment.', description: 'Add intelligent sourcing, screening and interviews to Workday Recruiting without disrupting enterprise HR processes.', features: ['Sync candidate profiles and application status', 'Push assessment and interview results to the candidate record', 'Keep requisitions and job details aligned', 'Support enterprise-scale hiring workflows'] },
  { name: 'SAP SuccessFactors', category: 'ATS', mark: 'SAP', tagline: 'Extend SuccessFactors with Agentic AI screening and engagement.', description: 'Enhance SAP SuccessFactors Recruiting with automated candidate evaluation, while your HR data stays in one place.', features: ['Sync jobs, candidates and hiring stages', 'Add Agentic AI match scores and ranked shortlists to profiles', 'Move shortlisted candidates into your existing workflow', 'Maintain consistent records across HR systems'] },
  { name: 'Oracle HCM', category: 'ATS', mark: 'O', tagline: 'Add faster, smarter recruitment to Oracle HCM.', description: 'Use TalentPool365 to speed up screening and interviews while Oracle HCM remains your core HR platform.', features: ['Two-way sync of candidate and requisition data', 'Assessment and interview outcomes attached to candidate records', 'Smooth hand-off from shortlisting to offer and onboarding', 'Designed for large, multi-location organizations'] },
  { name: 'Greenhouse', category: 'ATS', mark: 'GH', tagline: 'Supercharge Greenhouse with Agentic AI-driven candidate insights.', description: 'Keep your structured Greenhouse hiring process and add automated sourcing, screening and assessments.', features: ['Import jobs and candidates from Greenhouse', 'Send Agentic AI scores, interview summaries and scorecards back', 'Automate scheduling and candidate follow-ups', 'Maintain your existing pipeline stages'] },
  { name: 'Lever', category: 'ATS', mark: 'L', tagline: 'Bring automation and Agentic AI evaluation to Lever.', description: 'Combine Lever’s relationship-focused recruiting with TalentPool365’s Agentic AI sourcing and screening.', features: ['Sync candidate profiles, stages and notes', 'Surface ranked shortlists inside your Lever pipeline', 'Reduce manual resume review and data entry', 'Keep recruiters and hiring managers aligned in one view'] },
  { name: 'Zoho People', category: 'HRMS', mark: 'ZP', tagline: 'Send new hires to Zoho People in one step.', description: 'Transfer accepted candidates as new employee records, syncing role, department, location and joining date.', features: ['Transfer accepted candidates as new employee records', 'Sync role, department, location and joining date', 'Reduce manual work for HR operations teams'] },
  { name: 'Keka', category: 'HRMS', mark: 'K', tagline: 'Connect hiring to onboarding in Keka.', description: 'Push hired candidate details into Keka automatically to kickstart payroll and onboarding without typing details twice.', features: ['Push hired candidate details into Keka automatically', 'Pass offer information to start onboarding workflows', 'Keep recruitment and HR teams on the same data'] },
  { name: 'Darwinbox', category: 'HRMS', mark: 'DB', tagline: 'Align recruitment with your Darwinbox workforce data.', description: 'Sync approved offers and candidate profiles into enterprise Darwinbox structures across global locations.', features: ['Sync approved offers and candidate profiles', 'Support multi-location and enterprise HR structures', 'Maintain a consistent record from application to employee'] },
  { name: 'greytHR', category: 'HRMS', mark: 'GH', tagline: 'Simplify handover from recruitment to HR operations.', description: 'Transfer joining details and employee information effortlessly, eliminating duplicate data entry for HR and payroll.', features: ['Transfer joining details and employee information', 'Reduce duplicate data entry for HR and payroll teams', 'Keep records accurate from offer to day one'] },
  { name: 'BambooHR', category: 'HRMS', mark: 'B', tagline: 'Turn accepted offers into BambooHR employee profiles.', description: 'Create employee records from hired candidates and sync key job and personal details for fast-growing companies.', features: ['Create employee records from hired candidates', 'Sync key job and personal details', 'Make onboarding smoother for small and growing teams'] },
  { name: 'Microsoft Teams', category: 'Video', mark: 'T', tagline: 'Schedule and host interviews in Microsoft Teams.', description: 'Ideal for organizations already working in the Microsoft ecosystem, creating links and calendar events automatically.', features: ['Create Teams meeting links automatically when interviews are scheduled', 'Send invites to candidates and panel members', 'Keep interview details on the candidate profile', 'Fit smoothly into Outlook and Microsoft 365 calendars'] },
  { name: 'Zoom', category: 'Video', mark: 'Z', tagline: 'Connect Zoom for simple, reliable interviews.', description: 'A familiar choice for candidates worldwide. Generate meeting links automatically for 1-on-1 and panel interviews.', features: ['Generate Zoom meeting links automatically', 'Schedule one-on-one and panel interviews', 'Send reminders and rescheduling options to candidates', 'Track interview status in your hiring pipeline'] },
  { name: 'Google Meet', category: 'Video', mark: 'M', tagline: 'Bring Google Meet into your hiring workflow.', description: 'Perfect for teams on Google Workspace, syncing Meet links with Google Calendar events and candidate scorecards.', features: ['Create Google Meet links with Google Calendar events', 'Invite interviewers and candidates in a single step', 'Sync availability to avoid double bookings', 'Access interview schedules from the candidate profile'] },
  { name: 'WhatsApp', category: 'Communication', mark: 'WA', tagline: 'Reach candidates where they reply fastest.', description: 'Send updates, reminders, test links and interview details directly to WhatsApp with 89% response rates.', features: ['Send job alerts, updates and reminders over WhatsApp', 'Manage two-way conversations from the recruiter workspace', 'Use ready-made templates for common messages', 'Respect candidate consent for every message'] },
  { name: 'Outlook', category: 'Communication', mark: 'O', tagline: 'Connect your Outlook inbox and calendar to your hiring workflow.', description: 'Send and receive candidate emails from your own Outlook address while keeping calendar invites synchronized.', features: ['Send and receive candidate emails from your own Outlook address', 'Sync interview schedules with your Outlook calendar', 'Keep email conversations attached to candidate profiles', 'Track opens and replies on outreach'] },
  { name: 'Gmail', category: 'Communication', mark: 'G', tagline: 'Run candidate communication straight from Gmail.', description: 'Send personalized emails from your Gmail account, sync replies back to the candidate record, and use smart templates.', features: ['Send personalized emails from your Gmail account', 'Sync replies back to the candidate record', 'Use templates and automated follow-up sequences', 'Work alongside Google Calendar for scheduling'] },
  { name: 'Slack', category: 'Communication', mark: 'S', tagline: 'Keep your hiring team in the loop, instantly.', description: 'Get real-time notifications for new applicants, completed assessments and interview results directly in Slack channels.', features: ['Notifications for new applicants, completed tests & interview scores', 'Alert hiring managers when feedback or approvals are needed', 'Share candidate updates in dedicated role channels', 'Cut down on status-check emails and status meetings'] },
];

export const defaultBlogPosts: BlogPost[] = [
  {
    id: 'ai-changing-recruitment',
    category: 'Agentic AI in Recruitment',
    title: 'How Agentic AI is changing recruitment, and what recruiters should do about it',
    tagline: 'A practical look at where Agentic AI helps in hiring, where human judgment still matters, and how to start without disrupting your process.',
    readTime: '6 min read',
    date: 'November 2026',
    author: 'Editorial Team · TalentPool365',
    summary: 'A balanced assessment of modern Agentic AI in talent acquisition: why semantic understanding outperforms keyword filtering, how to maintain human judgment at critical decision moments, and where automation provides immediate return on investment.',
    paragraphs: [
      'The modern recruiting desk has reached an unsustainable breaking point. With one-click job applications and remote job boards, an average engineering or corporate requisition attracts hundreds of applications, over 70% of which do not meet foundational job criteria. Recruiters spend an estimated 18 to 22 hours per week simply sifting through PDFs and copying candidate contact details into spreadsheets.',
      'Artificial intelligence in recruitment is often misunderstood as an automated decision-maker. In reality, responsible Agentic AI acts as an executive intelligence assistant. It performs semantic extraction—understanding that a candidate who led a React-to-Next.js migration possesses senior frontend engineering capabilities even if the words "State Management Architecture" were not explicitly copy-pasted into their resume skills section.',
      'Crucially, ethical hiring systems must enforce human-in-the-loop oversight. Agentic AI should calculate match scores, surface evidence, flag missing prerequisites, and conduct preliminary structured screening interviews. However, the decision of whether to advance, offer, or disqualify a human candidate must always rest with human recruiters and hiring managers who possess organizational empathy.',
      'To implement Agentic AI safely without disrupting current operations, talent leaders should start with repeatable administrative burdens: resume parsing, initial proctored technical evaluations, and automated WhatsApp follow-ups. Measuring time-in-stage reductions against candidate satisfaction surveys creates a clear baseline for further automation.',
    ],
  },
  {
    id: 'build-talent-pool',
    category: 'Talent Sourcing',
    title: 'How to build a talent pool that fills roles before they open',
    tagline: 'Turn past applicants and silver medalists into a ready pipeline.',
    readTime: '5 min read',
    date: 'November 2026',
    author: 'Sourcing Practice · TalentPool365',
    summary: 'Why your dormant applicant tracking archive is your most valuable sourcing asset, and how semantic tagging turns silver medalists into hires within hours.',
    paragraphs: [
      'Every hiring manager remembers the runner-up: the exceptional finalist who was narrowly passed over for an open requisition simply because the business could only extend one offer. In traditional recruitment workflows, that candidate’s resume falls into a digital black hole in the ATS, never to be opened again.',
      'Building an active talent pool requires treating candidate relationships as continuous connections rather than transactional encounters. By organizing candidates into dynamic pools based on competencies, seniorities, and geographic availability, talent acquisition teams ensure that when a new requisition opens, they start with a pre-vetted shortlist rather than starting from zero on expensive job boards.',
      'Automated re-engagement campaigns play a decisive role. Sending contextual updates—such as engineering open-source milestones, team growth announcements, and polite check-ins regarding notice periods—keeps passive candidates warm and engaged. When a matching role opens, reaching out takes seconds, producing response rates up to 4 times higher than cold outreach on LinkedIn.',
    ],
  },
  {
    id: 'resume-screening-scale',
    category: 'Candidate Screening',
    title: 'Resume screening at scale: how to review 500 applications without burning out',
    tagline: 'Simple steps to cut manual screening without missing good candidates.',
    readTime: '4 min read',
    date: 'October 2026',
    author: 'Recruitment Ops · TalentPool365',
    summary: 'Techniques for high-volume screening that eliminate recruiter fatigue while preventing false rejections of non-traditional talent.',
    paragraphs: [
      'Recruiter fatigue is the single greatest cause of poor hiring decisions in high-volume hiring. When an HR professional evaluates their 150th resume of the afternoon, cognitive bias spikes, and candidates are rejected for superficial reasons like font choice, resume layout, or non-traditional job titles.',
      'The solution lies in automated parsing and multi-criteria weighting. By separating requirements into strict must-haves (e.g. required clinical certifications or right-to-work status) and flexible nice-to-haves (e.g. familiarity with a specific internal tool), recruiters can configure algorithms that rank candidates by actual merit.',
      'Transparent scoring transforms the screening pipeline. When a recruiter opens an applicant record and sees an itemized breakdown—94% Match: 6 years relevant experience, strong project portfolio, lacks GraphQL (nice-to-have)—they can make an evidence-based shortlisting determination in 15 seconds rather than 10 minutes.',
    ],
  },
  {
    id: 'skills-based-hiring',
    category: 'Hiring Strategy',
    title: 'Skills-based hiring: why job titles don’t tell the whole story',
    tagline: 'How to look past titles and find people who can do the work.',
    readTime: '5 min read',
    date: 'October 2026',
    author: 'People Strategy · TalentPool365',
    summary: 'Moving beyond legacy credentials and company brands to evaluate real-world problem solving, code quality, and practical domain execution.',
    paragraphs: [
      'In fast-moving industries like software engineering, data science, and product design, formal job titles are notoriously inconsistent. One company’s "Associate Engineer" might be designing distributed microservices, while another enterprise’s "Lead Architect" spends their days in administrative governance meetings.',
      'Skills-based hiring de-emphasizes pedigree and prestigious company brand names in favor of verifiable capability. By extracting skills directly from project descriptions, code repositories, open-source contributions, and practical assessments, hiring teams uncover hidden gems whom legacy ATS keyword filters routinely reject.',
      'Organizations that transition to skills-based hiring report greater employee retention and up to 3.2 times greater diversity in their candidate pipeline. When you test what candidates can actually do rather than where they went to school, meritocracy wins.',
    ],
  },
  {
    id: 'ai-interviews-experience',
    category: 'Interviews & Assessments',
    title: 'Agentic AI interviews: what candidates experience and how to make it fair',
    tagline: 'Tips for designing automated interviews that candidates respect.',
    readTime: '6 min read',
    date: 'September 2026',
    author: 'Candidate Experience Lab · TalentPool365',
    summary: 'How to design asynchronous video, voice, and coding interviews that respect candidate schedules, reduce test anxiety, and ensure fair scoring.',
    paragraphs: [
      'Asynchronous and Agentic AI-assisted interviews have exploded in adoption, but candidate perception varies dramatically based on implementation. When an interview feels like an interrogation by an opaque black box, completion rates plummet. When it is designed with transparency and flexibility, candidates love the freedom to interview on their own schedule.',
      'Fairness begins with transparent expectations. Before candidates begin recording, they should receive a clear walkthrough of the competencies being tested, the duration of each answer, whether retakes are permitted, and how their responses will be evaluated. Explaining upfront that human recruiters review all recordings eliminates distrust.',
      'Accessibility is paramount. Providing voice-first alternatives for low-bandwidth environments, accommodating sensory requirements, and conducting ongoing audits for linguistic or dialect bias ensures that automated interview systems expand access rather than erecting new barriers.',
    ],
  },
  {
    id: 'recruitment-metrics-track',
    category: 'Recruitment Analytics',
    title: 'The hiring metrics every recruiter should track',
    tagline: 'Time-to-hire, source quality, funnel drop-off and what each one tells you.',
    readTime: '5 min read',
    date: 'September 2026',
    author: 'Analytics Team · TalentPool365',
    summary: 'Move past vanity metrics to measure recruiting velocity, funnel dwell time, source ROI, and long-term candidate retention.',
    paragraphs: [
      'Many recruitment teams track superficial numbers such as "Total Resumes Received" or "Interviews Scheduled." While easy to report, these vanity metrics say very little about the health, speed, or quality of the talent acquisition pipeline.',
      'A mature talent team focuses on conversion velocity: measuring median days spent in each stage (Sourcing to Screened, Screened to Assessed, Assessed to Offer). Identifying which specific handoff creates delays—frequently the gap between shortlist delivery and hiring manager interview scheduling—pinpoints where process improvements yield exponential returns.',
      'Equally vital is Source Effectiveness. By measuring quality-of-hire and offer acceptance rates grouped by acquisition channel, organizations frequently discover that expensive job boards produce high volume but low retention, whereas referral pools and direct Agentic AI candidate discovery deliver superior longevity.',
    ],
  },
  {
    id: 'candidate-engagement-updates',
    category: 'Candidate Experience',
    title: 'How to keep candidates engaged between application and offer',
    tagline: 'Timely updates, WhatsApp follow-ups and why silence loses great hires.',
    readTime: '4 min read',
    date: 'August 2026',
    author: 'Engagement Practice · TalentPool365',
    summary: 'Why candidate ghosting destroys your employer brand, and how omnichannel WhatsApp and email notifications keep top finalists excited.',
    paragraphs: [
      'The modern candidate experience has a silent killer: the multi-week communication void. When top candidates submit an application or complete an interview, they expect timely updates. When met with silence, top talent assumes rejection and accepts competing offers.',
      'Omnichannel communication bridges this gap. Meeting candidates on WhatsApp—where response rates exceed 88% within the first hour—dramatically outperforms email in driving test completion and interview attendance. Simple automated nudges, such as "Your technical assessment is ready for review" or "Your interview feedback is being finalized," maintain momentum.',
      'The pre-onboarding gap between signed offer and day one is equally critical. Providing new hires with a digital pre-boarding checklist, welcome messages from their team, and transparent equipment setup schedules eliminates day-one no-shows and starts employee tenure with confidence.',
    ],
  },
];

export const defaultSiteContent: SiteContentModel = {
  home: {
    ...homeJson,
    hero: {
      headlinePrefix: 'Agentic AI Recruitment Tool',
      headlineSecondLine: 'The Intelligent Platform for Hiring',
      subheadline: 'Connect talent, automate workflows, and make informed decisions faster with TalentPool365.',
      ctaPrimary: 'Start Free Trial',
      ctaPrimaryHref: '/get-started',
      ctaSecondary: 'Book a Demo',
      ctaSecondaryHref: '#contact',
      bgImage: '/assets/hero-aurevia-bg.png',
    },
    logosLabel: 'Trusted by talent teams at',
    agentsSection: {
      title: 'Five *Agentic AI Agents* in Our AI Recruitment Tools Work Every Requisition',
      subtitle: 'Each one finishes its part and hands the candidates on. Your recruiters step in where judgment matters.',
      poolLabel: 'Talent pool: every other profile stays warm for the next role',
      scrollHint: 'Scroll to run the requisition',
    },
    productsSection: {
      title: 'Everything between requisition and *offer letter*',
      body: 'Most teams stitch together five tools to move a candidate from "applied" to "signed." TalentPool365 runs the whole workflow — with the evidence trail to back every decision.',
    },
    solutionsSection: {
      eyebrow: 'Solutions by industry',
      title: 'Built for the way *your sector* hires',
      body: 'Compliance rules, licensing checks, seasonal spikes — every industry hires differently. These playbooks ship with the platform, not as a services upsell.',
    },
    howItWorksSection: {
      title: 'From requisition to signed offer in *six moves*',
      body: 'The same disciplined flow every time — with a human decision at every step that matters.',
      ctaLabel: 'Walk through it live',
      ctaHref: '#contact',
    },
    metricsSection: {
      eyebrow: 'Proven impact',
      title: 'What changes in the *first quarter*',
    },
    whySwitchSection: {
      eyebrow: 'Why TalentPool365',
      linkLabel: 'Our approach',
      linkHref: '#about',
      title: 'The tools are fine. The handoffs are *where hiring dies.*',
      lede: 'Every system in your stack is decent on its own. The cost shows up between them — resumes re-read, candidates re-contacted, decisions re-explained. TalentPool365 closes those gaps instead of adding another tab.',
    },
    integrationsSection: {
      eyebrow: 'Integrations',
      title: 'Plugs into the stack *you already run*',
      body: 'Two-way sync with your ATS and HRMS from day one. No migration project, no duplicate entry.',
      footerNote: 'Running something else? The REST API and webhooks cover custom ATS setups — most integrations go live in under two weeks.',
    },
    caseStudiesSection: {
      eyebrow: 'Case studies',
      title: 'Teams that *stopped chasing* candidates',
      body: 'Three hiring teams, the problem each one started with, and what changed.',
      linkLabel: 'Request the full case study',
      linkHref: '/company/contact#contact',
    },
    aboutSection: {
      eyebrow: 'About TalentPool365',
      title: 'Built by recruiters who were *tired of recruiting software*',
      paragraph1: 'TalentPool365 started in 2019 inside a 40-person agency that was drowning in resumes. The first version was an internal matching tool; it cut their screening workload by half in a month. It became a company when their clients refused to give it back.',
      paragraph2: 'Today the platform processes over two million interviews a year across 40 countries. The rule from day one still stands: Agentic AI does the busywork, recruiters make the decisions, and every score can be explained to a candidate, a client or a regulator.',
      ctaLabel: "Work with us — we're hiring",
      ctaHref: '/company/careers',
      valuesEyebrow: 'What we optimize for',
      valuesTitle: 'Four commitments we *hire and ship by*',
      hiresEyebrow: 'People hired',
      hiresTitle: 'The people *hired* through TalentPool365',
    },
    faqSection: {
      eyebrow: 'Questions, answered',
      title: 'What hiring teams ask *before the trial*',
      body: "No discovery call required to get an answer. If yours isn't here, send it over — a product specialist replies within one business day.",
      linkLabel: 'Ask us something else',
      linkHref: '#contact',
    },
    ctaBand: {
      title: 'See it on *your own requisitions*',
      body: "Bring one live role to the demo. We'll run it through sourcing, screening and interview scoring — live, in 30 minutes.",
      primaryLabel: 'Book a live demo',
      primaryHref: '/get-started#request-demo',
      secondaryLabel: 'Start free trial',
      secondaryHref: '/get-started#start-free-trial',
    },
    contactSection: {
      title: 'Talk to a human *who knows hiring.*',
      body: 'Tell us about the roles you are filling, the tools you use and what is slowing your team down. We will help you explore a more connected way to hire.',
      points: [
        'A conversation built around your hiring workflow',
        'A walkthrough of the products you actually need',
        'Clear next steps for evaluating the platform',
      ],
      emailPrompt: 'Prefer email?',
      email: 'sales@talentpool365.com',
      submitLabel: 'Prepare sales enquiry',
      hint: 'Creates an email draft. Nothing is sent until you send it from your email app.',
    },
  },
  navigation: {
    ...navigationJson,
    header: {
      signIn: {
        label: 'Sign In',
        href: '/get-started',
      },
    },
    footer: {
      slogan: 'Empowering recruitment teams with Agentic AI to source, screen, and hire candidates with unprecedented speed and precision.',
      officeCountry: 'USA',
      officeAddress: '11549 Nuckols Road, Suite B, Glen Allen, VA 23059 United States',
      phone: '+1 302-231-1816',
      copyright: 'TalentPool365 B.V. All rights reserved.',
    },
  },
  pricing: defaultPricingData,
  products: productPages,
  productsOverview: {
    stats: [
      { value: '1B+', label: 'Profiles & ATS archives' },
      { value: '9 products', label: 'One candidate record' },
      { value: '68%', label: 'Faster time-to-hire' },
    ],
    stagesTag: 'SEVEN HIRING STAGES',
    stagesTitle: 'Seven products, one unified requisition',
    stagesSubtitle: 'Each product runs its stage in the pipeline and passes structured evidence cleanly to the next. Inspect each live workspace preview below.',
    layersTag: 'PLATFORM FOUNDATION',
    layersTitle: 'Two command layers under every stage',
    layersSubtitle: 'Analytics and compliance are built directly into the foundation — monitoring funnel velocity, scoring fairness, and immutable audit logs across every requisition.',
  },
  solutions: {
    industryHeading: 'By *industry*',
    industryBody: 'Compliance rules, licensing checks and seasonal spikes differ by sector. These playbooks ship with the platform rather than as a services project.',
    sizeHeading: 'By *company size*',
    sizeBody: 'The same platform at every size. What changes is how much of it you switch on, and how much control you need around it.',
    useCaseHeading: 'By *use case*',
    useCaseBody: 'Different kinds of hiring lean on different parts of the platform. Each one below lists the products that do most of the work.',
    industrySolutions: solutionsJson.industrySolutions,
    sizeSolutions: solutionsJson.sizeSolutions,
    useCaseSolutions: solutionsJson.useCaseSolutions,
  },
  howItWorksPage: {
    workflow: [
      { title: 'Create job requisition', owner: 'Your hiring team', body: 'Agree on the role, the must-have skills and what good looks like before applications arrive. Set the scorecard and approval owners together.', output: 'An approved role and a shared evaluation rubric', href: '/products/recruiter-workspace' },
      { title: 'Agentic AI talent sourcing', owner: 'Agentic AI-assisted', body: 'Search your existing talent pool and connected sources. Build a relevant longlist instead of starting from an empty search every time.', output: 'A candidate longlist with its source recorded', href: '/products/talent-sourcing' },
      { title: 'Candidate screening', owner: 'Agentic AI-assisted, recruiter checked', body: 'Parse experience and skills against the agreed requirements. Review the evidence behind matches before moving a shortlist forward.', output: 'A reviewed shortlist, not a black-box ranking', href: '/products/candidate-screening' },
      { title: 'Agentic AI assessment', owner: 'Consistent evaluation', body: 'Use job-relevant exercises to see what people can do. Offer appropriate accommodations and check any flags before reaching a conclusion.', output: 'Skills evidence against the same assessment criteria', href: '/products/ai-assessments' },
      { title: 'Agentic AI interview', owner: 'Structured conversation', body: 'Run a structured video, voice or coding interview. Give candidates clear instructions and use an agreed rubric to keep evaluation focused.', output: 'Interview evidence for the recruiter to review', href: '/products/ai-interviews' },
      { title: 'Recruiter review', owner: 'Human decision', body: 'Bring the application, assessment and interview into one view. Check missing context, discuss exceptions and decide who should meet the team.', output: 'A documented recommendation for the panel', href: '/products/recruiter-workspace' },
      { title: 'Final panel interview', owner: 'Your hiring team', body: 'Meet the person behind the evidence. Collect independent feedback before the panel discussion, then resolve differences against the role requirements.', output: 'A considered hiring decision and recorded feedback', href: '/products/hiring-offer-management' },
      { title: 'Offer release', owner: 'Approved by your team', body: 'Align compensation, obtain approvals and prepare the offer. Keep the candidate informed while signatures and final checks are completed.', output: 'An approved, accepted offer', href: '/products/hiring-offer-management' },
      { title: 'Onboarding', owner: 'A warm handover', body: 'Pass the agreed details to your HR team. Coordinate pre-joining tasks, keep communication open and make the first day feel like a beginning, not another form.', output: 'A prepared new hire and a clear HR handover', href: '/products/hiring-offer-management#pre-onboarding' },
    ],
  },
  caseStudiesPage: {
    heroStats: [
      { value: '68%', label: 'Faster time-to-hire' },
      { value: '14 days', label: 'Saved per hire' },
      { value: '4.4×', label: 'Higher response rate' },
    ],
    stories: defaultCaseStudiesData,
  },
  customersPage: {
    notice: 'The stories and testimonials below are illustrative examples, not verified customer endorsements. Ask our team for approved customer references.',
    stories: defaultStories,
    roiTitle: 'What could your team *get back?*',
    roiBody: 'Set your own assumptions. This estimates the value of recruiter time saved, not guaranteed cash savings or a net return on investment.',
    videoTag: 'PLATFORM WALKTHROUGH',
    videoTitle: 'See the workflow in motion.',
    videoBody: 'Watch our product walkthrough. Customer interview recordings are not published here yet; our team can help with approved references.',
    videoLinkLabel: 'Ask for customer references →',
    videoLinkHref: '/company/contact',
  },
  integrationsPage: {
    items: defaultIntegrationsList,
  },
  resourcesPage: {
    resources: defaultResources,
    blogPosts: defaultBlogPosts,
    glossary: [
      { term: 'ATS', definition: 'Applicant tracking system: the core software used by HR to post jobs, store candidate resumes, and manage recruitment pipeline stages.' },
      { term: 'Structured interview', definition: 'An interview format using standardized, job-relevant questions scored against a consistent pre-defined evaluation rubric.' },
      { term: 'Talent pool', definition: 'A curated, categorized database of pre-qualified active and passive candidates available for current and future hiring needs.' },
      { term: 'Semantic matching', definition: 'Agentic AI-driven candidate matching that understands the contextual relationships between skills, accomplishments, and requirements rather than relying on exact keyword matching.' },
      { term: 'Time-to-hire', definition: 'The elapsed duration between a job requisition opening or initial applicant submission and the accepted offer letter.' },
      { term: 'Fair Hiring Agentic AI', definition: 'Explainable Agentic AI scoring algorithms designed with strict anti-bias guardrails, excluding protected demographic attributes and requiring human oversight.' },
      { term: 'Cognitive assessment', definition: 'Objective evaluation measuring analytical reasoning, problem-solving speed, attention to detail, and pattern recognition.' },
      { term: 'Proctoring', definition: 'Automated integrity monitoring during online tests and interviews, tracking tab switches, secondary screens, and identity verification.' },
    ],
  },
  company: {
    aboutQuickLinks: [
      { href: '/company/leadership', icon: 'users', title: 'Leadership team', body: 'Who is accountable for the product, the models and your data.' },
      { href: '/company/technology', icon: 'cpu', title: 'Technology & innovation', body: 'How a score gets made, and the guardrails around it.' },
      { href: '/company/careers', icon: 'briefcase', title: 'Careers', body: 'Open roles in Amsterdam, Bengaluru and Austin.' },
    ],
    leaders: leadershipJson.leaders,
    leadershipPrinciples: leadershipJson.leadershipPrinciples,
    workPrinciples: careersJson.workPrinciples,
    benefits: careersJson.benefits,
    vacancies: careersJson.vacancies,
    hiringSteps: careersJson.hiringSteps,
    partnerPrograms: partnersJson.partnerPrograms,
    partnerSteps: partnersJson.partnerSteps,
    scoreSteps: technologyJson.scoreSteps,
    guardrails: technologyJson.guardrails,
    platformFacts: technologyJson.platformFacts,
    buildingBlocks: technologyJson.buildingBlocks,
    researchTracks: technologyJson.researchTracks,
    pressItems: newsJson.pressItems,
    mediaAssets: newsJson.mediaAssets,
    offices: contactJson.offices,
    contactChannels: contactJson.contactChannels,
  },
  getStartedPage: {
    intents: [
      { id: 'request-demo', label: 'Request demo', title: 'See it with your own role.', body: 'Bring a job description and the questions your team wants answered. We will prepare a focused product walkthrough.' },
      { id: 'book-meeting', label: 'Book meeting', title: 'Make time for a useful conversation.', body: 'Tell us your timezone and a few preferred times. This is a meeting request, not an instant calendar booking.' },
      { id: 'start-free-trial', label: 'Start free trial', title: 'Explore a pilot for your team.', body: 'Tell us what you want to evaluate. Our team will confirm trial availability, scope, and access.' },
      { id: 'contact-sales', label: 'Contact sales', title: 'Talk through the practical details.', body: 'Hiring volume, integrations, procurement, or rollout. Give us the context and we will route your email.' },
    ],
    previewName: 'Priya Sundaram · Top Match',
    previewBadge: '96% Match',
    previewDesc: 'Senior Frontend Architect · React, TypeScript, Distributed UI · Rediscovered Silver Medalist',
    checklist: [
      'Your role and hiring goals set the agenda',
      'Live walkthrough of AI scoring & ATS sync',
      'No credit card or commitment required',
    ],
    stats: [
      { value: '1B+', label: 'Profiles & archives' },
      { value: '750+', label: 'Hiring teams' },
      { value: '4.8 ★', label: 'Recruiter rating' },
    ],
    tourBannerTitle: 'Not ready to talk to anyone?',
    tourBannerSub: 'Watch the 30-sec guided workflow tour first.',
    tourSectionTag: 'GUIDED TOUR',
    tourSectionTitle: 'A first look. On your time.',
    tourSectionBody: 'Follow the product from candidate pipeline to hiring insights in this short walkthrough.',
  },
  supportPage: {
    helpCenterTag: 'HELP CENTER',
    helpCenterTitle: "Let's find your next step",
    deskCards: [
      {
        id: 'documentation',
        tag: 'Documentation',
        num: '01',
        title: 'Understand the workflow',
        body: 'Explore the nine hiring steps and the tools behind them. For workspace-specific setup and API documentation, ask our team.',
        links: [
          { label: 'Read the workflow guide →', href: '/how-it-works' },
          { label: 'Request API documentation →', href: '/integrations#api-documentation' },
        ],
      },
      {
        id: 'training-academy',
        tag: 'Training academy',
        num: '02',
        title: "Build your team's confidence",
        body: 'Start with our interview checklist and scorecard workshop. Facilitated team training can be discussed with your account team.',
        links: [
          { label: 'Open the workshop outline →', href: '/resources#webinars' },
          { label: 'Watch the product video →', href: '/resources#product-videos' },
        ],
      },
      {
        id: 'support-plans',
        tag: 'SLA & support plans',
        num: '03',
        title: 'Know your coverage',
        body: 'Support hours, escalation paths and response targets depend on your agreement. Request the support schedule for your plan.',
        links: [
          { label: 'Compare available plans →', href: '/pricing' },
          { label: 'Request your support schedule →', href: 'mailto:support@talentpool365.com?subject=Support%20coverage%20request' },
        ],
      },
    ],
    faqs: [
      { question: 'I cannot access my workspace. What should I check?', answer: 'Confirm that you are using your organization’s workspace address and the email your administrator invited. If your organization uses single sign-on, try that sign-in option. Contact your workspace administrator or support if access is still blocked; never send your password.' },
      { question: 'A candidate is having trouble with an interview.', answer: 'Ask for the stage, approximate time and the error message, without sharing interview answers or unnecessary personal data. Check browser permissions and connection quality. If the issue affects accessibility or time limits, offer an alternative through your hiring team.' },
      { question: 'How should I report a data or permissions issue?', answer: 'Contact support with your organization, the affected workflow and a description of the unexpected access. Do not include candidate records, credentials or access tokens in email. Ask for a secure channel before sharing sensitive evidence.' },
      { question: 'Where do I find my support response times?', answer: 'Your signed agreement defines coverage, severity levels and response targets. Ask your account team for the applicable support schedule rather than relying on a general website promise.' },
    ],
    ticketTag: 'RAISE A TICKET',
    ticketTitle: 'Tell us what happened.',
    ticketBody: 'Prepare a support email with the context our team needs. Your email application will open; review and send it there. Do not include passwords, access tokens, or candidate records.',
    supportEmail: 'support@talentpool365.com',
    statusTag: 'System status',
    statusTitle: 'Live status is not connected',
    statusBody: 'This page does not monitor the platform. For current service availability or an incident update, contact support.',
  },
  legalPage: {
    dpoTitle: 'Data Protection Officer',
    dpoBody: 'Have questions about candidate data or compliance?',
    dpoEmail: 'privacy@talentpool365.com',
    privacyTitle: 'TalentPool365 Privacy Policy',
    privacyEffectiveDate: 'Effective Date: November 2026 · Compliant with GDPR & DPDP Act 2023',
    privacySections: [
      { num: '1', title: 'Introduction', content: 'TalentPool365 (“we”, “us”, “our”) provides an Agentic AI-powered recruitment platform designed to help organizations source, screen, assess, and hire candidates effectively. This Privacy Policy explains what personal data we collect, how we use it, who we share it with, and the choices you have.\n\nThis policy applies to:\n• Visitors to our website\n• Customers and their authorised users (recruiters, hiring managers, administrators)\n• Candidates whose data is processed through our platform on behalf of our customers\n\nBy using our website or services, you acknowledge this policy. If you do not agree, please do not use our services.' },
      { num: '2', title: 'Our Role: Controller and Processor', content: 'When you visit our website or sign up as a customer, we act as the data controller for that information.\nWhen our customers upload or collect candidate data (resumes, assessments, interviews), the customer is the data controller and TalentPool365 acts as the data processor, handling data strictly on their lawful instructions.\n\nIf you are a candidate and have questions about how an employer uses your data, please contact that hiring organization directly. We assist employers in responding promptly to candidate data requests.' },
      { num: '3', title: 'Information We Collect', content: 'We collect information necessary to provide recruitment intelligence and platform services:\n\nInformation you provide:\n• Name, work email, phone number, company name, and job title\n• Account and billing details\n• Support requests, messages, and demo quote submissions\n\nCandidate data processed on behalf of customers:\n• Resumes and profile details: contact information, work history, education, skills, certifications\n• Assessment responses and scores across technical, aptitude, cognitive, and behavioral evaluations\n• Interview responses, which may include video, audio, text, or code submissions and transcripts\n• Communication history, such as emails and WhatsApp messages sent through the platform\n• Hiring outcomes and recruiter feedback scorecards\n\nInformation collected automatically:\n• IP address, device type, browser characteristics, referring URLs, and usage analytics.' },
      { num: '4', title: 'How We Use Information', content: 'We use personal data to:\n• Provide, operate, and continuously improve our recruitment platform\n• Parse resumes, semantically match and rank candidates, run assessments, and conduct interviews\n• Send operational service messages, security alerts, and customer support responses\n• Process payments and manage commercial accounts\n• Prevent, investigate, and detect security incidents or fraudulent use\n• Comply with statutory and legal obligations' },
      { num: '5', title: 'Legal Basis for Processing (GDPR)', content: 'Where the European General Data Protection Regulation (GDPR) applies, we process data based on:\n• Contract Performance: To provide our software services under subscription agreements\n• Legitimate Interests: To secure, debug, and optimize our services, balanced against individual rights\n• Consent: For opt-in candidate communications (e.g., WhatsApp job alerts) and optional cookies\n• Legal Obligation: To meet regulatory, taxation, and statutory requirements\n\nFor candidate data, employers are responsible for establishing their own lawful basis prior to data processing.' },
      { num: '6', title: 'Agentic AI and Automated Processing', content: 'TalentPool365 uses Agentic AI models to assist human recruiters in screening, matching, ranking, and evaluating candidates. Crucially:\n• Our features are built to support human decision-making, not replace it.\n• Final hiring, rejection, and offer decisions are made exclusively by human recruiters and hiring managers.\n• Candidate scores and rankings are fully explainable, detailing specific skill and experience matches.\n• Where regulations confer rights regarding automated processing, candidates may request human review and an explanation through the hiring employer.' },
      { num: '7', title: 'How We Share Information', content: 'We never sell candidate or customer personal data. We share information only with:\n• Customers: Candidate data is accessible only by the employer or staffing agency that collected it.\n• Service Providers: Trusted cloud hosting, database, email, and security partners bound by strict confidentiality and Data Processing Agreements.\n• Integrated Platforms: Third-party ATS, HRMS, calendar, or video platforms you explicitly authorize.\n• Legal Authorities: When required by subpoena, court order, or applicable law to protect life and safety.' },
      { num: '8', title: 'International Data Transfers', content: 'Data may be processed in secure data centers in the European Union, India, or the United States. Where cross-border transfers occur, we implement European Commission Standard Contractual Clauses (SCCs) and robust technical safeguards to ensure adequate data protection standards globally.' },
      { num: '9', title: 'Cookies and Tracking', content: 'We use necessary session cookies to maintain secure authentication and preferences. You can manage or disable optional tracking cookies via your browser settings or our website privacy preferences panel.' },
      { num: '10', title: 'Data Retention', content: 'We retain personal data only as long as needed for legitimate recruitment purposes or as specified by employer contracts:\n• Customer Account Data: Maintained for the duration of the active agreement plus standard statutory periods.\n• Candidate Data: Retained strictly in accordance with retention rules configured by the employer data controller, after which it is deleted or returned.' },
      { num: '11', title: 'Data Security', content: 'We employ enterprise-grade technical and organizational security controls:\n• AES-256 encryption at rest and TLS 1.3 encryption in transit\n• Multi-factor authentication (MFA) and strict role-based access control (RBAC)\n• Immutable audit logs tracking all candidate data access, modifications, and exports\n• Continuous vulnerability scanning and regular independent security audits.' },
      { num: '12', title: 'Your Privacy Rights', content: 'Depending on your jurisdiction (including GDPR in Europe and the Digital Personal Data Protection Act, 2023 in India), you have rights to:\n• Access the personal data held about you\n• Rectify inaccurate or incomplete records\n• Request erasure (the “Right to be Forgotten”)\n• Restrict or object to specific processing activities\n• Receive your data in a portable, structured format\n• Nominate a representative or seek grievance redressal\n\nCandidates should contact the prospective employer directly, and we will assist them in honoring your request.' },
      { num: '13', title: 'Children’s Privacy', content: 'Our services are designed exclusively for employment and recruitment among working adults. We do not knowingly collect information from minors under 18 years of age.' },
      { num: '14', title: 'Changes to This Policy', content: 'We may update this Privacy Policy periodically to reflect technological or legal changes. Material revisions will be highlighted on this website with an updated effective date.' },
      { num: '15', title: 'Contact Us', content: 'For privacy inquiries, Data Protection Officer (DPO) contact, or data subject requests, email privacy@talentpool365.com or contact our compliance office at TalentPool365 headquarters.' },
    ],
    termsTitle: 'TalentPool365 Terms of Service',
    termsEffectiveDate: 'Effective Date: November 2026 · Commercial SaaS Terms',
    termsSections: [
      { num: '1', title: 'Acceptance of Terms', content: 'These Terms of Service (“Terms”) govern your access to and use of the TalentPool365 platform and associated software services. By registering an account, executing an order form, or accessing the platform, you agree to be bound by these Terms on behalf of your organization (“Customer”).' },
      { num: '2', title: 'The Services', content: 'TalentPool365 grants Customer a non-exclusive, non-transferable subscription right to access our Agentic AI-powered recruitment platform, including sourcing, screening, assessments, video/voice interviews, recruiter workspaces, and integrations.' },
      { num: '3', title: 'Accounts and Access', content: 'Customer administrators are responsible for managing authorized user credentials, assigning appropriate role permissions, and maintaining account security. Customer must notify TalentPool365 immediately upon suspecting any unauthorized account access.' },
      { num: '4', title: 'Customer Responsibilities', content: 'Customer agrees to:\n• Use the platform exclusively for lawful recruitment and human resources purposes\n• Ensure a valid legal basis, and provide all necessary candidate notices and obtain consents prior to uploading resumes, recording interviews, or sending WhatsApp communications\n• Adhere to all applicable labor, anti-discrimination, and privacy statutes\n• Ensure all final hiring and rejection decisions are made by human recruiters following review of Agentic AI outputs.' },
      { num: '5', title: 'Acceptable Use', content: 'Customer shall not reverse engineer, decompile, scrape, or probe platform security. Customer may not resell access, send unsolicited spam communications, or use platform outputs to construct a competing recruitment Agentic AI system.' },
      { num: '6', title: 'Agentic AI Features and Limitations', content: 'Agentic AI matching scores, candidate rankings, skill assessments, and interview summaries are assistive evaluation tools. Customer acknowledges that Agentic AI outputs are recommendations that must be verified by qualified human professionals before making hiring determinations.' },
      { num: '7', title: 'Candidate Data and Intellectual Property', content: 'Customer retains all ownership and intellectual property rights in candidate data and company materials uploaded to the platform. TalentPool365 retains all rights, title, and interest in and to the platform software, algorithms, UI designs, and documentation.' },
      { num: '8', title: 'Third-Party Services and Integrations', content: 'Customer’s connection and use of third-party platforms (e.g. Workday, Slack, WhatsApp, Zoom) are governed by the respective terms of those third-party providers. TalentPool365 is not liable for third-party platform availability or policy changes.' },
      { num: '9', title: 'Fees, Billing and Payment', content: 'Subscription fees are billed in advance on an annual or monthly schedule as specified in Customer’s order form. Fees are non-refundable except where explicitly required by law.' },
      { num: '10', title: 'Free Trials', content: 'Free trials are provided for evaluation purposes for up to 14 days. At the conclusion of the trial period, access terminates unless Customer subscribes to an active paid plan.' },
      { num: '11', title: 'Confidentiality and Security', content: 'Both parties agree to treat non-public business, technical, and candidate data as confidential, applying no less than reasonable care. TalentPool365 implements robust SOC2 and ISO-aligned technical security safeguards.' },
      { num: '12', title: 'Disclaimers and Limitation of Liability', content: 'To the maximum extent permitted by law, TalentPool365 disclaims all warranties regarding candidate fitness for a specific role. Total liability under any claim arising from these Terms is limited to the aggregate subscription fees paid by Customer during the twelve (12) months preceding the incident.' },
      { num: '13', title: 'Governing Law and Dispute Resolution', content: 'These Terms are governed by applicable commercial laws without regard to conflict of law principles. Any dispute shall first be addressed through good-faith executive negotiation prior to formal arbitration.' },
    ],
    gdprTitle: 'GDPR, DPDP & Responsible Agentic AI Framework',
    gdprSubtitle: 'Technical & Organizational Measures (TOMs) Documentation',
    gdprCards: [
      { title: 'Candidate Consent Tracking', body: 'Automated opt-in consent capture for SMS, WhatsApp, and candidate profile storage with time-stamped records.' },
      { title: 'Automated Data Retention & Erasure', body: 'Configurable retention rules per country with automated 1-click candidate profile anonymization and deletion.' },
      { title: 'Subject Access Requests (SAR)', body: 'Instant PDF export containing all candidate records, test answers, scores, and recruiter feedback notes.' },
      { title: 'Explainable Fair Hiring Agentic AI', body: 'Anti-bias algorithms that remove demographic proxies and provide transparent score breakdowns with mandatory human oversight.' },
    ],
    dpaCtaLabel: 'Request Executable Data Processing Agreement (DPA)',
    dpaCtaHref: '/company/contact',
  },
  globalBanners: {
    marqueeLabel: 'TRUSTED BY TALENT ACQUISITION TEAMS AT GROWING ENTERPRISES',
    marqueeLogos: ['FINTECH LABS', 'CLOUDSCALE', 'APEX HEALTH', 'METRO SYSTEMS', 'VERIDIAN TECH', 'GLOBAL RETAIL'],
    ctaTitle: 'Bring a role you are hiring for.',
    ctaSubtitle: 'See TalentPool365 source, screen, and shortlist live candidates for your toughest open requisition in 15 minutes.',
    ctaPrimaryLabel: 'Book a demo →',
    ctaPrimaryHref: '/get-started#book-meeting',
    ctaSecondaryLabel: 'Start free trial',
    ctaSecondaryHref: '/get-started#start-free-trial',
  },
  pageOverrides: {},
};
