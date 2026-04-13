# Comment Engine — Architecture & Setup Guide

## What This Is

A daily workflow for generating helpful, authentic comments on Reddit, LinkedIn, and Hacker News using discovery tools + a local LLM. This is **separate from the n8n content pipeline** — it's an on-demand tool you run manually each day.

## How It Works

```
Discovery Tools (automated, background)
├── Reppit AI ($29/mo) — scores Reddit threads by buying intent (0-100)
├── F5Bot (free) — email alerts when keywords appear on Reddit/HN/Lobsters
└── You open results each morning

         ↓ 10-20 relevant threads/day

Local LLM (on-demand, free)
├── You paste thread context into your local model via Ollama
├── Model drafts a reply in ~5 seconds
└── Zero API cost, runs on your GPU

         ↓ draft comment

Human Review (mandatory, ~30-45 min/day)
├── Edit tone, add personal experience
├── Remove anything that sounds like AI
├── Copy-paste into your browser and post manually
└── NEVER automate the posting step
```

## Daily Routine

| Platform | Comments/Day | Time | Discovery Tool |
|----------|-------------|------|----------------|
| LinkedIn | 10-15 | 15-20 min | Manual browsing + Engage AI (free Chrome extension) |
| Reddit | 3-5 | 10-15 min | Reppit AI (intent-scored threads) |
| Hacker News | 2-3 | 5-10 min | F5Bot (keyword alerts) |
| **Total** | **15-23** | **30-45 min** | |

## Why Not Automate Posting

- **Reddit**: Domain-level spam flags are nearly irreversible. If your domain gets flagged, all links are auto-removed sitewide forever. Your target audience (technical decision-makers) actively investigates astroturfing.
- **LinkedIn**: Multiple companies got permanently banned for automation. LinkedIn uses ML behavioral analysis and browser fingerprinting.
- **Twitter/X**: All associated accounts get suspended when one is caught. Cookie-based tools violate ToS.
- **Hacker News**: Shadowbans both users and entire domains permanently. Voting ring detection is highly sophisticated.

One authentic founder account with real karma converts better than 50 bot accounts.

## How to Run a Comment Draft

### Quick one-liner:
```bash
ollama run qwen2.5:7b --system "$(cat comment-engine/prompts/reddit.txt)" "THREAD: [paste post title and body here]"
```

### For longer threads, use a temp file:
```bash
# Paste the thread content into a file
nano /tmp/thread.txt

# Generate draft with the appropriate platform prompt
ollama run qwen2.5:7b --system "$(cat comment-engine/prompts/reddit.txt)" "$(cat /tmp/thread.txt)"
```

### Platform prompt files:
- `prompts/reddit.txt` — Casual peer-to-peer tone for your target subreddits
- `prompts/linkedin.txt` — Professional value-add commenting
- `prompts/hackernews.txt` — Technical depth, zero marketing

## Hardware Requirements

- **GPU**: Any GPU with 8+ GB VRAM (runs Qwen 2.5 7B at full speed)
- **RAM**: 16GB+ recommended
- **Ollama**: Install from https://ollama.com, then `ollama pull qwen2.5:7b`
- **Cost**: $0/month for inference

## SaaS Tools Needed

| Tool | Cost | Purpose | Status |
|------|------|---------|--------|
| Reppit AI | $29/mo | Reddit intent-scored thread discovery (300 smart comments, 5 projects, 10 subs/project) | Not signed up |
| F5Bot | Free | Keyword alerts on Reddit, HN, Lobsters via email | Not signed up |
| Engage AI | Free | Chrome extension for LinkedIn comment suggestions | Not signed up |

## File Structure

```
comment-engine/
├── README.md               ← This file
├── prompts/
│   ├── reddit.txt          ← System prompt for Reddit comments
│   ├── linkedin.txt        ← System prompt for LinkedIn comments
│   └── hackernews.txt      ← System prompt for HN comments
├── discovery-setup.md      ← How to configure Reppit AI, F5Bot, Engage AI
└── rules.md                ← Platform rules, ban avoidance, karma building
```
