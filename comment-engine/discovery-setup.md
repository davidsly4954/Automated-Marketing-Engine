# Discovery Tools — Setup Guide

## 1. Reppit AI ($29/mo) — Reddit Thread Discovery

**What it does:** Scans Reddit for threads where people are actively evaluating tools in your niche, scored 0-100 by buying intent. Surfaces the 10-15 daily threads most likely to convert.

**Setup:**
- Sign up at https://reppit.ai (Standard plan, $29/mo)
- Create a project named after your company
- Add 5-10 target subreddits where your audience discusses problems you solve:
  - Find subreddits by searching Reddit for your niche keywords
  - Include a mix of large (500K+) and focused (50-200K) communities
  - Include 1-2 "monitor only" subs (very strict moderation — never post, just learn)
- Set keywords:
  - Your product category (e.g., "project management tool", "CRM software")
  - Pain points your product solves (e.g., "too many spreadsheets", "compliance nightmare")
  - Competitor names (e.g., "[Competitor1] alternative")
  - Industry-specific terms that signal buying intent

**Daily use:**
- Check Reppit dashboard each morning
- Focus on threads scored 60+ (high buying intent)
- Feed thread context to your local LLM for draft comment
- Review, edit, post manually

**What you get:** 300 smart comments/month, 5 projects, 10 subreddits per project.

---

## 2. F5Bot (Free) — Keyword Alerts on Reddit/HN/Lobsters

**What it does:** Sends email alerts within minutes when your keywords appear on Reddit, Hacker News, or Lobsters. No scoring — just fast notification.

**Setup:**
- Sign up at https://f5bot.com
- Add keyword alerts:
  - Your product category keywords
  - Your company name (brand monitoring)
  - "[Competitor] alternative" variations
  - Competitor names (competitor monitoring)
  - Key pain-point phrases your audience uses

**Daily use:**
- Check email alerts in the morning
- HN alerts are especially valuable — early comments on relevant threads get the most visibility
- Use for reactive engagement: when someone mentions a competitor or asks about tools in your space, respond quickly

**Tip:** Forward F5Bot emails to a dedicated Slack channel (#social-mentions) for centralized monitoring.

---

## 3. Engage AI (Free) — LinkedIn Comment Suggestions

**What it does:** Chrome extension that suggests contextual comments on LinkedIn posts. Helps with the 10-15 daily LinkedIn comments.

**Setup:**
- Install from Chrome Web Store: search "Engage AI"
- Connect your LinkedIn account
- Configure for your niche/industry focus

**Daily use:**
- Browse LinkedIn feed and target audience posts (prospects, industry leaders, practitioners)
- Engage AI suggests comment drafts
- Review and edit before posting (their suggestions are a starting point, not final copy)
- Alternatively, use your local LLM with the linkedin.txt prompt for higher-quality drafts

**Note:** Engage AI is a supplement, not a replacement. For high-value prospects (someone you want to connect with later), use the local LLM prompt for a more thoughtful comment.

---

## 4. LinkedIn Manual Discovery (Free)

No tool needed — just a focused browsing routine.

**Who to follow and engage with:**
- **Industry thought leaders:** Find 5-10 accounts with 10K+ followers in your space
- **Practitioners:** Your target audience posts about daily challenges, tool evaluations, industry struggles
- **Adjacent professionals:** People whose audience overlaps with your buyer persona

**What to look for:**
- Posts asking for tool recommendations
- Pain-point stories (empathize, add insight)
- Industry news (add technical depth)
- Founder journey posts (relate with your own experience)

**Tip:** Use LinkedIn's search with your niche keywords filtered to Posts from the past week.

---

## Tool Summary

| Tool | Cost | Platform | What It Does | Setup Time |
|------|------|----------|-------------|------------|
| Reppit AI | $29/mo | Reddit | Intent-scored thread discovery | 15 min |
| F5Bot | Free | Reddit/HN/Lobsters | Keyword email alerts | 10 min |
| Engage AI | Free | LinkedIn | Comment draft suggestions | 5 min |
| Ollama + LLM | Free | All | Local comment draft generation | 15 min |
