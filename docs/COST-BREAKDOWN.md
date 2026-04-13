# Cost Breakdown

## Per Blog Post (AI Costs)

| API Call | Purpose | Cost |
|----------|---------|------|
| Claude Sonnet (extraction) | Key point extraction | ~$0.02 |
| Claude Sonnet x8 (transforms) | 8 platform-specific content pieces | ~$0.13 |
| **Total per post** | | **~$0.15** |

At 4 posts/month: ~$0.60/month in API costs.

## Monthly SaaS Tools

| Tool | Cost | Required? | Purpose |
|------|------|-----------|---------|
| **n8n** | Free | Yes | Workflow orchestration (self-hosted) |
| **Claude API** | ~$1-5/mo | Yes | Content generation (~$0.15/post) |
| **Jina.ai** | Free | Yes | Blog URL → clean text conversion |
| **Slack** | Free | Recommended | Content review notifications |
| **Dev.to** | Free | Optional | Developer cross-posting |
| **Hashnode** | Free | Optional | Developer cross-posting |
| **Buffer** | $6/mo | Optional | LinkedIn scheduling |
| **Typefully** | $19/mo | Optional | Twitter/X thread scheduling |
| **Loops.so** | $49/mo | Optional | Email newsletter |
| **Reppit AI** | $29/mo | Optional | Reddit thread discovery (comment engine) |
| **F5Bot** | Free | Optional | Keyword alerts (comment engine) |
| **Engage AI** | Free | Optional | LinkedIn comment suggestions |
| **X Premium** | $8/mo | Optional | Twitter/X algorithmic reach boost |

## Cost Tiers

### Minimal ($0/mo)
Just the pipeline + free platforms. You get: LinkedIn (manual post), Dev.to, Hashnode, Reddit (manual), Indie Hackers (manual), and content generation.

### Starter (~$6-25/mo)
Add Buffer ($6) for LinkedIn scheduling and/or Typefully ($19) for Twitter. This automates the two highest-ROI platforms.

### Full Stack (~$74/mo)
All paid tools: Buffer ($6) + Typefully ($19) + Loops.so ($49). Full automation across all platforms.

### Full Stack + Comment Engine (~$111/mo)
Add Reppit AI ($29) + X Premium ($8) for active community engagement on top of content publishing.

## Hardware Costs

| Component | Cost | Purpose |
|-----------|------|---------|
| GPU with 8+ GB VRAM | One-time | Local LLM for comment drafting (Ollama + Qwen 2.5 7B) |
| Machine that stays on | Existing | Runs Docker containers for n8n + PostgreSQL |

The comment engine runs locally on your GPU at $0/month for inference.
