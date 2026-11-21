# Sanity CMS Integration Guide for TalentPool365

The website is now connected to **Sanity.io**!

It features an intelligent dual-mode architecture:
- When a **Sanity Project ID** is provided in `.env`, the website fetches and renders live content directly from Sanity Cloud.
- If Sanity credentials are not yet configured or offline, it automatically and seamlessly falls back to the existing local JSON data in `/content`, ensuring zero downtime.

---

## Quick Setup (3 Steps)

### Step 1: Create a Sanity Project
1. Go to [https://www.sanity.io/](https://www.sanity.io/) and sign up or log in.
2. Create a new project (e.g. named `talentpool365`).
3. Under **Project Settings**, copy your **Project ID**.

### Step 2: Add Your Credentials to `.env`
Open `.env` in the project root and paste your Project ID:
```env
VITE_SANITY_PROJECT_ID=your_project_id_here
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-03-01
```

### Step 3: Enable CORS in Sanity Dashboard
1. In your Sanity management dashboard at [https://www.sanity.io/manage](https://www.sanity.io/manage), select your project.
2. Go to **API** → **CORS Origins**.
3. Click **Add CORS Origin**:
   - For local development: `http://localhost:5173` and `http://localhost:5174` (check **Allow credentials**).
   - For production: add your production domain (e.g. `https://your-domain.com`).

---

## Sanity Studio & Content Management

All content schemas matching the website are located in:
`src/sanity/schemas/`
- `home.ts`: Hero, Rotating roles, Inside Interviews, Industries, FAQs
- `product.ts`: All 9 Product Pages (slug, headlines, capabilities, outcomes)
- `post.ts`: Recruitment blog posts & guides

To run Sanity Studio standalone or deploy it to sanity.studio:
```bash
npm create sanity@latest
```
When prompted, select your existing project and choose the schemas from `src/sanity/schemas`.
