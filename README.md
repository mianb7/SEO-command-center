# SEO Command Center Pro v2.0 — REAL DATA ENGINE

A full-stack SEO audit platform that analyzes **real websites** using **free tools** and **optional cheap APIs**.
Every number comes from actual crawling, parsing, and API calls. No mock data.

## What Makes This REAL

| Data Source | How We Get It | Cost |
|-------------|---------------|------|
| **Core Web Vitals** (LCP, CLS, FID, TBT) | Google PageSpeed Insights API v5 | **FREE** |
| **Mobile/Desktop performance** | Google Lighthouse (via PSI) | **FREE** |
| **On-page SEO** (titles, meta, headings, images, links) | Direct HTML scraping + parsing | **FREE** |
| **SSL Certificate** | TLS handshake inspection | **FREE** |
| **DNS Records** | SPF, DKIM, DMARC, Google/Bing verification | **FREE** |
| **Security Headers** | HSTS, CSP, X-Frame, X-Content-Type | **FREE** |
| **Sitemap** | Fetch & parse XML | **FREE** |
| **Robots.txt** | Fetch & parse | **FREE** |
| **Server speed** | TTFB measurement | **FREE** |
| **Schema markup** | Extract JSON-LD from HTML | **FREE** |
| **Content analysis** | Word count, readability, structure | **FREE** |
| **Competitor on-page** | Scrape their HTML directly | **FREE** |
| **Domain Authority** | Moz API | **FREE** (50 rows/month) |
| **Backlink count** | Moz API or DataForSEO | **FREE** or **~£0.80** |
| **Traffic estimates** | DataForSEO | **~£0.80** ($1 trial) |
| **Keyword rankings** | Zenserp or ValueSERP | **FREE** (50-100 searches/month) |

## Quick Start (2 minutes)

```bash
# 1. Download and enter the folder
cd seo-command-center

# 2. Install dependencies (only 4 packages — no bloat)
npm install

# 3. Start the server
npm start

# 4. Open browser
http://localhost:3000
```

The app will automatically create `data/seo.db` on first run. All reports, earnings, and clients persist locally.

## How to Get REAL Backlink, Traffic & Ranking Data

The app works **immediately** with real on-page and technical data. To also get **real backlink counts, traffic estimates, and keyword rankings**, add these **free or cheap** API keys to your `.env` file:

### Option 1: Moz API — COMPLETELY FREE (Recommended first)
- **Cost:** £0 — 50 rows/month, no credit card required
- **What you get:** Real Domain Authority, Page Authority, Spam Score, backlink count, referring domains
- **Sign up:** https://moz.com/products/api/keys
- **Add to .env:**
  ```
  MOZ_ACCESS_ID=your_access_id
  MOZ_SECRET_KEY=your_secret_key
  ```

### Option 2: Zenserp — COMPLETELY FREE
- **Cost:** £0 — 50 Google searches/month, no credit card
- **What you get:** Real Google SERP positions for your keywords
- **Sign up:** https://app.zenserp.com
- **Add to .env:**
  ```
  ZENSERP_API_KEY=your_api_key
  ```

### Option 3: ValueSERP — COMPLETELY FREE (Backup)
- **Cost:** £0 — 100 Google searches/month, no credit card
- **What you get:** Real Google SERP positions (backup if Zenserp runs out)
- **Sign up:** https://valueserp.com
- **Add to .env:**
  ```
  VALUESERP_API_KEY=your_api_key
  ```

### Option 4: DataForSEO — ~£0.80 ($1 trial)
- **Cost:** $1 trial credit (~£0.80), then pay-as-you-go from $0.0006 per API call
- **What you get:** Real backlink counts, real traffic estimates, real keyword rankings
- **Sign up:** https://dataforseo.com
- **Add to .env:**
  ```
  DATAFORSEO_LOGIN=your_login
  DATAFORSEO_PASSWORD=your_password
  ```

### Total Cost for Full Real Data
If you add **all four** above: **£0.80 total** (just the DataForSEO $1 trial). Moz, Zenserp, and ValueSERP are completely free.

## How to Use

1. **Enter your website URL** (e.g. `https://yourbusiness.com`)
2. **Add your business name, location, and niche**
3. **(Optional) Add up to 3 competitor URLs** for real on-page comparison
4. **Click "Run real analysis"**
5. The bot will:
   - Fetch your homepage HTML and extract every real element
   - Call Google PageSpeed Insights for real Core Web Vitals
   - Inspect your SSL certificate
   - Query your DNS records (SPF, DKIM, DMARC, verification)
   - Check security headers
   - Parse sitemap.xml and robots.txt
   - Measure server response time
   - **If Moz key is set:** Fetch real Domain Authority and backlink count
   - **If DataForSEO key is set:** Fetch real traffic estimates
   - **If Zenserp/ValueSERP key is set:** Fetch real Google keyword rankings
   - If competitors provided, scrape their pages and compare
   - Generate a **real report** with actual findings
6. **Download the report** as a professional HTML file

## Deploy to Production (Free Hosting)

### Render.com (Recommended — Free 24/7)
1. Push this folder to a GitHub repository
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables from `.env`
7. Click Deploy — you get a live URL in 2 minutes

### Railway.app
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add environment variables
4. Deploy

### VPS / Dedicated Server
```bash
git clone <your-repo>
cd seo-command-center
npm install
npm start
# For production daemon: npm install -g pm2 && pm2 start server.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Run REAL SEO analysis on a URL |
| GET | `/api/reports` | List all saved reports |
| GET | `/api/reports/:id` | Get single report with raw data |
| DELETE | `/api/reports/:id` | Delete report |
| GET | `/api/report/download/:id` | Download professional HTML report |
| GET | `/api/earnings` | List earnings entries |
| POST | `/api/earnings` | Add earning entry |
| PUT | `/api/earnings/:id` | Update earning |
| DELETE | `/api/earnings/:id` | Delete earning |
| GET | `/api/clients` | List clients |
| POST | `/api/clients` | Add client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |
| GET | `/api/settings` | Get app settings |
| PUT | `/api/settings` | Update settings (white-label) |

## How You Make Money With £0-£0.80 Investment

1. **Run the analysis on any business website** (takes 10-30 seconds)
2. **Download the HTML report** — it has real data, real fixes, real competitor gaps
3. **Email it to the business owner** or walk them through it on a call
4. **Charge $500–$2,000 for the audit** (one-time)
5. **Upsell to monthly retainer** — use the Pricing tab: Starter $800/mo, Growth $2,500/mo, Premium $5,000/mo
6. **Track everything** in the Earnings tab — see your effective hourly rate climb

## Tech Stack

- **Backend:** Node.js 18+, Express 4, better-sqlite3
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (zero build step)
- **Database:** SQLite (file-based, zero config)
- **Analysis Engine:** Custom HTML parser, Google PSI API, TLS/DNS modules, optional Moz/Zenserp/DataForSEO APIs
- **Deployment:** Any Node.js host (Render, Railway, VPS, etc.)

## License

MIT — use it, sell it, modify it, white-label it. Built for hustlers with £0-£0.80 budget.
