# How the Automated Marketing Engine Works

## The Big Picture

You write one blog post. The engine automatically turns it into 8 pieces of content for 8 different platforms, sends you a Slack message to review them, and publishes them on a staggered 7-day schedule. Your only job after setup is writing blog posts and doing ~30 min/day of community commenting.

## What's Running on Your Machine

```
Your Machine
├── Docker (container runtime)
│   ├── n8n (workflow automation — the brain)
│   │   └── localhost:5678 — this is your dashboard
│   └── PostgreSQL (database that stores n8n's workflows and data)
├── Ollama (local AI for comment drafting — not used in the pipeline)
│   └── qwen2.5:7b model (runs on your GPU, used for Reddit/LinkedIn/HN comments)
└── Files
    └── Automated-Marketing-Engine/
        ├── n8n/              ← Workflow JSON and build script
        ├── comment-engine/   ← Comment drafting prompts and guides
        └── docs/             ← Documentation
```

## How the Content Pipeline Works (Step by Step)

### Step 1: Detection (automatic)
Your blog has an RSS feed. The n8n workflow checks this feed **every 20 minutes**. When it finds a new post, it kicks off the pipeline.

### Step 2: Content Fetching (automatic)
n8n sends the blog post URL to **Jina.ai** (a free service) which converts the webpage into clean text. This is better than using the RSS content because it gets the full article with proper formatting.

### Step 3: Duplicate Check (automatic)
Before doing anything expensive, n8n checks if it already processed this URL. It keeps a list of the last 200 URLs it's handled. If it's a repeat, it stops here.

### Step 4: Key Point Extraction (automatic, ~$0.02)
n8n sends the full blog post to **Claude Sonnet** (Anthropic's AI, via API) and asks it to pull out:
- The main argument
- Key statistics
- Supporting points
- Technical details
- 3 different "hook" angles
- The main takeaway

This extraction feeds ALL the platform-specific content below. It runs once and everything else branches from it.

### Step 5: 8 Platform Transforms (automatic, ~$0.13)
n8n takes the extraction + full blog post and sends them to Claude **8 separate times**, each with a different prompt tailored to the platform:

| Platform | What Claude Creates | Key Rules |
|----------|-------------------|-----------|
| **LinkedIn** | 1,000-1,300 char post | Hook first line, blank lines between paragraphs, ends with question, hashtags at bottom |
| **Twitter/X** | 5-8 tweet thread | Each tweet under 280 chars, separated by `---` for Typefully, NO links in tweets (kills reach), hook first tweet |
| **Reddit** | Discussion post | Casual peer tone, NEVER mentions your company, frames as sharing findings, technical depth |
| **Email** | Newsletter snippet | 2 subject line options, preview text, 100-150 word teaser with curiosity gap |
| **Carousel** | 8-12 slide outline | Bold headlines, one point per slide, for manual Canva design |
| **Dev.to** | Full cross-post | Developer formatting, canonical URL pointing back to your blog (protects SEO) |
| **Hashnode** | Full cross-post | Same idea as Dev.to, different platform |
| **Indie Hackers** | Building-in-public post | Founder voice, honest context, asks community a question |

### Step 6: Scheduling (automatic)
n8n calculates a **7-day drip schedule** so content doesn't all drop at once (that kills reach):

```
Tuesday    10 AM  →  LinkedIn post (via Buffer)
Tuesday    12 PM  →  Twitter thread (via Typefully)
Wednesday  10 AM  →  Email newsletter (via Loops.so)
Thursday   10 AM  →  Carousel (you design in Canva, post via Buffer)
Friday      8 AM  →  Reddit post #1 (you post manually)
Monday      9 AM  →  Dev.to + Hashnode cross-posts (automatic)
Tuesday     9 AM  →  Reddit post #2 (you post manually)
Wednesday  10 AM  →  Indie Hackers (you post manually)
```

### Step 7: Publishing (automatic where possible)
n8n fans out to **7 parallel branches** and tries to publish to each platform:

- **Buffer** → schedules the LinkedIn post
- **Typefully** → queues the Twitter thread
- **Loops.so** → sends the email newsletter
- **Dev.to** → publishes the cross-post via API
- **Hashnode** → publishes the cross-post via GraphQL API
- **Save Drafts** → stores Reddit, Carousel, and IH content for you to post manually
- **Slack** → sends you a formatted notification with previews of all 8 pieces

If any platform isn't configured yet (no API key), that branch just fails silently and the rest continue.

### Step 8: Slack Review (you, ~10 min)
You get a Slack message with truncated previews of all 8 pieces, scheduled dates, and a link to the full content in the n8n dashboard. You review, tweak if needed, and the scheduled posts go out on their own.

## UTM Tracking

Every link the engine generates has UTM parameters so you can track what's working in Google Analytics:

```
yourdomain.com/blog/example-post?utm_source=linkedin&utm_medium=social&utm_campaign=example-post&utm_content=text-post
```

This tells you: this click came from LinkedIn, from the text post version, for the example-post article.

## What Each Tool Does

| Tool | What It Does | Cost | How It Connects |
|------|-------------|------|-----------------|
| **n8n** | Orchestrates everything — the brain | Free (self-hosted) | Runs on your machine via Docker |
| **Claude Sonnet** | AI that transforms content | ~$0.15/blog post | API calls from n8n |
| **Buffer** | Schedules LinkedIn posts | $6/mo | n8n → Buffer API |
| **Typefully** | Schedules Twitter threads | $19/mo | n8n → Typefully API |
| **Loops.so** | Email newsletter | $49/mo | n8n → Loops API |
| **Jina.ai** | Converts blog URLs to clean text | Free | n8n → Jina API |
| **Slack** | Review channel for content approval | Free | n8n → Slack webhook |
| **Dev.to** | Developer blog cross-posting | Free | n8n → Dev.to API |
| **Hashnode** | Developer blog cross-posting | Free | n8n → Hashnode API |
| **Ollama** | Local AI for comment drafting | Free | Runs locally, not in pipeline |

## Cost Summary

**Monthly recurring:** $6-74/mo depending on which SaaS tools you use
**Per blog post:** ~$0.15 in Claude API costs
**Your time:** ~10 min/week reviewing content in Slack + ~30-45 min/day commenting
