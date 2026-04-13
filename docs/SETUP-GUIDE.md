# Setup Guide

Complete checklist for getting the Automated Marketing Engine running. Work through these in order.

## Prerequisites

Before starting, you need:
- A blog with an RSS feed (e.g., `https://yourdomain.com/feed`) that returns valid XML
- Docker and Docker Compose installed
- A machine that stays on (the pipeline checks your RSS feed every 20 minutes)

---

## Priority 1: Core Pipeline Setup

### 1.1 Configure the Engine
```bash
# Clone the repo
git clone https://github.com/davidsly4954/Automated-Marketing-Engine.git
cd Automated-Marketing-Engine

# Create your config
cp config.example.js config.js
```

Edit `config.js` with your details:
- `companyName` — your company name
- `blogUrl` — your website URL
- `rssFeedUrl` — your RSS feed URL
- `nicheDescription` — one sentence describing what your company does
- `redditSubreddit` — the main subreddit for your niche

### 1.2 Generate the Workflow
```bash
node n8n/scripts/build-workflow.js
```
This creates `n8n/workflows/content-repurposing-pipeline.json` customized to your brand.

### 1.3 Set Up Secrets
```bash
cp .env.example .env
```

Generate secure keys:
```bash
# Generate random passwords
openssl rand -hex 16  # Use for POSTGRES_PASSWORD
openssl rand -hex 16  # Use for N8N_ENCRYPTION_KEY
```

Edit `.env` and paste in your generated keys.

### 1.4 Start the Services
```bash
docker compose up -d
```

Open http://localhost:5678 in your browser. You should see the n8n dashboard.

### 1.5 Import the Workflow
1. In n8n, click **Add workflow** → **Import from file**
2. Select `n8n/workflows/content-repurposing-pipeline.json`
3. The workflow should appear with all 17 nodes

### 1.6 Add Your Claude API Key
1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add it to `.env` as `ANTHROPIC_API_KEY=sk-ant-...`
4. Restart containers: `docker compose restart`

### 1.7 Set Up Slack Notifications
1. Create a free Slack workspace (or use an existing one)
2. Create a channel called `#content-review`
3. Add an Incoming Webhook: Slack Apps → Create New App → Incoming Webhooks → Add to `#content-review`
4. Copy the webhook URL
5. In n8n, open the "Notify Slack" node and replace `YOUR_SLACK_WEBHOOK_URL` with your URL

---

## Priority 2: Connect Publishing Platforms

Each platform is optional — the pipeline gracefully skips unconfigured platforms.

### Buffer (LinkedIn Scheduling) — $6/mo
1. Sign up at https://buffer.com
2. Connect your LinkedIn profile
3. Go to Settings → API & Integrations → get your access token
4. Find your LinkedIn profile ID (Buffer API: `GET /profiles`)
5. Add to `.env`:
   ```
   BUFFER_ACCESS_TOKEN=your_token
   BUFFER_LINKEDIN_PROFILE_ID=your_profile_id
   ```
6. Restart: `docker compose restart`

### Typefully (Twitter/X Scheduling) — $19/mo
1. Sign up at https://typefully.com
2. Connect your Twitter/X account
3. Go to Settings → API → generate key
4. Get your social_set_id from the API
5. Add to `.env`:
   ```
   TYPEFULLY_API_KEY=your_key
   TYPEFULLY_SOCIAL_SET_ID=your_id
   ```

### Loops.so (Email Newsletter) — $49/mo
1. Sign up at https://loops.so
2. Create a transactional email template for your newsletter
3. Go to Settings → API → get your key
4. Add to `.env`:
   ```
   LOOPS_API_KEY=your_key
   LOOPS_NEWSLETTER_TEMPLATE_ID=your_template_id
   ```

### Dev.to (Free)
1. Go to https://dev.to/settings/extensions
2. Generate an API key
3. Add to `.env`: `DEVTO_API_KEY=your_key`

### Hashnode (Free)
1. Go to https://hashnode.com/settings/developer
2. Generate a Personal Access Token
3. Find your publication ID in your Hashnode dashboard URL
4. Add to `.env`:
   ```
   HASHNODE_PAT=your_token
   HASHNODE_PUBLICATION_ID=your_pub_id
   ```

After adding any keys, restart: `docker compose restart`

---

## Priority 3: Comment Engine Setup

See [comment-engine/README.md](../comment-engine/README.md) for the full guide.

### Quick Start:
1. Install Ollama: https://ollama.com
2. Pull the model: `ollama pull qwen2.5:7b`
3. Customize the prompt templates in `comment-engine/prompts/` with your niche details
4. Sign up for Reppit AI ($29/mo) and/or F5Bot (free) for thread discovery

---

## Priority 4: Social Account Warmup

If your social accounts are new, spend 2-4 weeks building karma before the pipeline starts posting. See [comment-engine/rules.md](../comment-engine/rules.md) for the karma building timeline.

Key warmup activities:
- **Reddit:** Comment helpfully 3-5x/day in your target subreddits. Zero self-promotion for the first 10 days. Target 50+ karma.
- **LinkedIn:** 10-15 comments/day on posts from your target audience. Send 10-20 connection requests/day.
- **Twitter/X:** Get X Premium ($8/mo). Reply to 5-10 key accounts/day in your space. Post 1-2 tweets/day after week 1.
- **Hacker News:** Submit 1-2 interesting articles/day. Comment with technical depth. Build toward 500+ karma.

---

## Verification Checklist

After setup, verify everything works:

- [ ] `docker compose ps` shows both `n8n` and `postgres` running
- [ ] http://localhost:5678 loads the n8n dashboard
- [ ] Your workflow is imported and visible
- [ ] Your RSS feed URL (`yourdomain.com/feed`) returns valid XML in a browser
- [ ] Slack webhook sends a test message (use n8n's "Test" button on the Notify Slack node)
- [ ] At least one publishing platform is connected (check `.env`)

---

## Restarting After a Reboot

If `restart: always` is set in docker-compose.yml (it is by default), containers restart automatically on boot. If not:

```bash
cd /path/to/Automated-Marketing-Engine
docker compose up -d
```

That's it. The RSS trigger resumes checking every 20 minutes.
