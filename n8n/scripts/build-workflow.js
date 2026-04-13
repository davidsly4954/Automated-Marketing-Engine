#!/usr/bin/env node
/**
 * Automated Marketing Engine — Workflow Generator
 *
 * Generates an n8n workflow JSON that transforms one blog post into
 * 8 platform-specific content pieces via Claude AI.
 *
 * Run: node build-workflow.js
 * Output: ../workflows/content-repurposing-pipeline.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uuid = () => crypto.randomUUID();

// ─── Configuration ──────────────────────────────────────────────────────────
// Load user config from config.js (at repo root), fall back to defaults

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.js');
let userConfig = {};
try {
  userConfig = require(CONFIG_PATH);
} catch (e) {
  console.log('No config.js found — using defaults. Copy config.example.js to config.js to customize.\n');
}

const config = {
  companyName: userConfig.companyName || 'YourCompany',
  blogUrl: userConfig.blogUrl || 'https://yourdomain.com',
  rssFeedUrl: userConfig.rssFeedUrl || 'https://yourdomain.com/feed',
  nicheDescription: userConfig.nicheDescription || 'a SaaS helping businesses with [your value proposition]',
  founderRole: userConfig.founderRole || 'a solo technical builder sharing hard-won insights',
  nicheTopic: userConfig.nicheTopic || 'your industry',
  redditSubreddit: userConfig.redditSubreddit || 'r/your_niche',
  carouselCta: userConfig.carouselCta || 'Follow for more insights',
  devtoTags: userConfig.devtoTags || 'startup, saas, programming, webdev',
  timezone: userConfig.timezone || 'UTC',
  timezoneOffset: userConfig.timezoneOffset != null ? userConfig.timezoneOffset : 0,
  avoidWords: userConfig.avoidWords || '"leverage," "synergy," "delve," "In today\'s rapidly evolving landscape," "game-changer," "cutting-edge," "revolutionary"',
  embraceStyle: userConfig.embraceStyle || 'Specific technical details, real-world examples, contrarian takes, founder vulnerability',
};

// ─── Brand Voice System Prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a content strategist and ghostwriter for ${config.companyName}, ${config.nicheDescription}. The founder is ${config.founderRole}.

<brand_voice>
Tone: Technical but accessible. Confident, not arrogant. Think "experienced practitioner explaining to a smart colleague."
Avoid: ${config.avoidWords}
Embrace: ${config.embraceStyle}
</brand_voice>

<constraints>
- Output must sound human-written and opinionated
- Preserve technical accuracy of all ${config.nicheTopic} concepts
- Include specific tools, data, or frameworks when the source does
- Always include data/statistics from the source material
</constraints>`;

// ─── Step 1: Key Point Extraction Prompt (temp 0.3) ──────────────────────────

const EXTRACTION_PROMPT = `Extract the following from this blog post. Output ONLY valid JSON, no other text.

{
  "core_thesis": "one sentence summary of the main argument",
  "key_statistics": ["stat1", "stat2"],
  "supporting_arguments": ["arg1", "arg2", "arg3"],
  "technical_details": ["detail1", "detail2"],
  "hook_angles": ["hook1", "hook2", "hook3"],
  "actionable_takeaway": "the primary action readers should take"
}

Blog post title: {{TITLE}}

Blog post content:
{{CONTENT}}`;

// ─── Step 2: Platform-Specific Prompts ───────────────────────────────────────

const PLATFORM_PROMPTS = {
  linkedin_post: {
    temperature: 0.6,
    max_tokens: 800,
    prompt: `Using the key points and full blog post below, write a LinkedIn post.

Requirements:
- 1,000-1,300 characters total
- First line MUST compel "see more" clicks — use a controversial opinion, surprising result, or provocative question
- Use blank lines between every short paragraph
- Write in first person. Sound like a founder sharing a lesson, not a brand posting content
- End with a question to drive comments
- Add 3-5 relevant hashtags after two blank lines at the end
- Include at least one specific data point or statistic from the source
- Depth level: medium (explain acronyms, add brief context)

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  twitter_thread: {
    temperature: 0.7,
    max_tokens: 1500,
    prompt: `Using the key points and full blog post below, write a Twitter/X thread.

Requirements:
- 5-8 tweets, each STRICTLY under 280 characters
- Separate each tweet with --- on its own line (Typefully format)
- Tweet 1 MUST be a provocative hook that works as a standalone post
- Each subsequent tweet delivers one key insight
- DO NOT include any URLs in the tweets (links get 94% reach suppression — the blog URL will be added in a reply)
- Use 1-2 hashtags maximum, only in the final tweet
- Tone: sharp, opinionated, punchy. Replace jargon with plain language
- Depth level: low (focus on business impact)

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  reddit_draft: {
    temperature: 0.7,
    max_tokens: 1200,
    prompt: `Using the key points and full blog post below, write a Reddit discussion post for ${config.redditSubreddit}.

Requirements:
- Write a discussion-style post title (question format works best)
- Casual, peer-to-peer tone — sound like a practitioner sharing findings, NOT a vendor selling
- NEVER mention ${config.companyName} or any product name unless directly relevant to a technical finding
- No emojis. No marketing language. No superlatives
- Frame as sharing interesting research/findings with the community
- Include specific technical details (data points, tool names, config examples)
- End with a genuine question to spark discussion
- Depth level: high (keep technical specifics and data)

Output format:
TITLE: [post title]
SUBREDDIT: ${config.redditSubreddit}
BODY:
[post body]

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  email_newsletter: {
    temperature: 0.5,
    max_tokens: 600,
    prompt: `Using the key points and full blog post below, write an email newsletter snippet.

Requirements:
- TWO subject line options: one curiosity-driven, one benefit-driven, both under 50 characters
- Preview text line under 90 characters
- 100-150 word teaser body that creates an information gap
- Single clear CTA: "Read the full analysis" linking to the blog post
- Tone: informative, slightly urgent, personal
- Reference at least one specific statistic from the source

Output format:
SUBJECT_LINE_1: [curiosity-driven]
SUBJECT_LINE_2: [benefit-driven]
PREVIEW_TEXT: [under 90 chars]
BODY:
[teaser body with CTA]

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  carousel_outline: {
    temperature: 0.5,
    max_tokens: 1500,
    prompt: `Using the key points and full blog post below, create a LinkedIn carousel outline.

Requirements:
- 8-12 slides
- Slide 1: Bold cover headline (max 8 words) + subtitle
- Slides 2-N: One key point per slide, max 40 words each, with a brief supporting detail
- Final slide: CTA with "${config.carouselCta}"
- Each slide should be self-contained and visually clear
- Use numbers, percentages, and specific data wherever possible
- This outline will be designed in Canva

Output format:
SLIDE 1: [headline] / [subtitle]
SLIDE 2: [point] / [detail]
...
SLIDE N: [CTA]

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  devto_crosspost: {
    temperature: 0.4,
    max_tokens: 4000,
    prompt: `Using the full blog post below, create a Dev.to cross-post.

Requirements:
- Keep the full article content with minimal changes
- Add a brief intro line: "*Originally published on [${config.companyName}]({{BLOG_URL}})*"
- Format with Dev.to markdown conventions (## for headings, code blocks with language tags)
- Suggest 4 Dev.to tags from: ${config.devtoTags}
- Include the canonical_url in frontmatter
- Preserve all technical accuracy

Output format:
---
title: {{TITLE}}
published: true
tags: [tag1, tag2, tag3, tag4]
canonical_url: {{BLOG_URL}}
---

[article content]

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  hashnode_crosspost: {
    temperature: 0.4,
    max_tokens: 4000,
    prompt: `Using the full blog post below, create a Hashnode cross-post.

Requirements:
- Keep the full article content with minimal changes
- Add at the top: "*Originally published on [${config.companyName}]({{BLOG_URL}})*"
- Format with standard markdown
- Suggest 3-5 Hashnode tags relevant to the content
- The originalArticleURL will be set via the Hashnode GraphQL API
- Preserve all technical accuracy

Output format:
TAGS: [tag1, tag2, tag3]

[article content]

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  },

  indiehackers_draft: {
    temperature: 0.7,
    max_tokens: 1000,
    prompt: `Using the key points and full blog post below, write an Indie Hackers update post.

Requirements:
- Building-in-public founder frame — share the insight as part of the ${config.companyName} journey
- Include honest business context (what you learned, what surprised you, what failed)
- Conversational, personal tone — IH audience values authenticity and real numbers
- Keep it 200-400 words
- End with a question for the community
- Reference the blog post as "wrote about this in more detail on our blog"
- Depth level: low (focus on business impact and founder lessons)

KEY POINTS:
{{EXTRACTION}}

FULL BLOG POST:
{{CONTENT}}`
  }
};

// ─── Node Definitions ────────────────────────────────────────────────────────

const nodes = [
  // ── Setup Note ──
  {
    id: uuid(),
    name: 'Setup Instructions',
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position: [-200, -200],
    parameters: {
      content: `## Content Repurposing Pipeline\n\n**Setup before activating:**\n1. Add \`ANTHROPIC_API_KEY\` to .env and restart containers\n2. Set Slack webhook URL in "Notify Slack" node\n3. Verify RSS feed URL in trigger node\n\n**Publishing nodes (enable as you sign up):**\n- Buffer: Set \`BUFFER_ACCESS_TOKEN\` env + LinkedIn profile ID\n- Typefully: Set \`TYPEFULLY_API_KEY\` env + social_set_id\n- Dev.to: Set \`DEVTO_API_KEY\` env\n- Hashnode: Set \`HASHNODE_PAT\` env + publication ID\n- Loops.so: Set \`LOOPS_API_KEY\` env + transactional template ID\n\n**Drip schedule:**\n- Day 1: LinkedIn (10AM) + Twitter (12PM)\n- Day 2: Email newsletter (10AM)\n- Day 3: Carousel outline saved (manual Canva)\n- Day 4: Reddit draft saved (manual post)\n- Day 5: Dev.to + Hashnode (auto cross-post)\n- Day 7: Indie Hackers draft saved (manual post)\n\n**Cost per run:** ~$0.15 Claude API`,
      width: 450,
      height: 420
    }
  },

  // ── Drip Calendar Note ──
  {
    id: uuid(),
    name: 'Drip Calendar',
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position: [1680, -200],
    parameters: {
      content: `## 7-Day Drip Release Calendar\n\n| Day | Platform | Time | Auto? |\n|-----|----------|------|-------|\n| 1 (Tue) | LinkedIn | 10-11 AM | Buffer |\n| 1 (Tue) | Twitter/X | 12-1 PM | Typefully |\n| 2 (Wed) | Email | 10 AM | Loops.so |\n| 3 (Thu) | Carousel | 10 AM | Manual Canva |\n| 4 (Fri) | Reddit #1 | 8 AM | Manual post |\n| 5 (Mon) | Dev.to | Anytime | Auto API |\n| 5 (Mon) | Hashnode | Anytime | Auto API |\n| 6 (Tue) | Reddit #2 | 9 AM | Manual post |\n| 7 (Wed) | Indie Hackers | AM | Manual post |`,
      width: 350,
      height: 320
    }
  },

  // ── 1. RSS Feed Trigger ──
  {
    id: uuid(),
    name: 'Blog RSS Trigger',
    type: 'n8n-nodes-base.rssFeedReadTrigger',
    typeVersion: 1,
    position: [0, 300],
    parameters: {
      feedUrl: config.rssFeedUrl,
      pollTimes: {
        item: [{ mode: 'everyX', value: 20, unit: 'minutes' }]
      }
    }
  },

  // ── 2. Fetch Full Blog Content via Jina.ai ──
  {
    id: uuid(),
    name: 'Fetch Blog Content',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [280, 300],
    parameters: {
      method: 'GET',
      url: '=https://r.jina.ai/{{ $json.link }}',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Accept', value: 'application/json' }
        ]
      },
      options: { timeout: 30000 }
    },
    onError: 'continueErrorOutput',
    retryOnFail: true,
    maxTries: 3
  },

  // ── 3. Prepare Content & Dedup ──
  {
    id: uuid(),
    name: 'Prepare & Dedup',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [560, 300],
    parameters: {
      jsCode: `const rssItem = $('Blog RSS Trigger').first().json;
const fetchResponse = $input.first().json;

const blogTitle = rssItem.title || 'Untitled';
const blogUrl = rssItem.link || '';
const blogSlug = blogUrl.split('/').filter(Boolean).pop() || 'untitled';
const pubDate = rssItem.pubDate || rssItem.isoDate || new Date().toISOString();

let blogContent = '';
if (fetchResponse && fetchResponse.data && fetchResponse.data.content) {
  blogContent = fetchResponse.data.content;
} else if (rssItem.content) {
  blogContent = rssItem.content;
} else if (rssItem.contentSnippet) {
  blogContent = rssItem.contentSnippet;
}

if (!blogContent || blogContent.length < 100) {
  throw new Error('Blog content too short or empty. Check RSS feed and Jina.ai response.');
}

const staticData = $getWorkflowStaticData('global');
if (!staticData.processedUrls) staticData.processedUrls = [];
if (staticData.processedUrls.includes(blogUrl)) {
  return [];
}
staticData.processedUrls.push(blogUrl);
if (staticData.processedUrls.length > 200) {
  staticData.processedUrls = staticData.processedUrls.slice(-200);
}

const systemPrompt = ${JSON.stringify(SYSTEM_PROMPT)};

const extractionPrompt = ${JSON.stringify(EXTRACTION_PROMPT)}
  .replace('{{TITLE}}', blogTitle)
  .replace('{{CONTENT}}', blogContent);

const requestBody = JSON.stringify({
  model: 'claude-sonnet-4-6',
  max_tokens: 1500,
  temperature: 0.3,
  system: systemPrompt,
  messages: [{ role: 'user', content: extractionPrompt }]
});

return [{
  json: {
    blogTitle, blogUrl, blogSlug, blogContent, pubDate,
    systemPrompt, extractionRequestBody: requestBody
  }
}];`
    }
  },

  // ── 4. Extract Key Points (Claude API — Step 1) ──
  {
    id: uuid(),
    name: 'Extract Key Points',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [840, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'x-api-key', value: '={{ $env.ANTHROPIC_API_KEY }}' },
          { name: 'anthropic-version', value: '2023-06-01' },
          { name: 'content-type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ $json.extractionRequestBody }}',
      options: { timeout: 60000 }
    },
    retryOnFail: true,
    maxTries: 3
  },

  // ── 5. Create Platform Prompts (8 items) ──
  {
    id: uuid(),
    name: 'Create Platform Prompts',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1120, 300],
    parameters: {
      jsCode: `const blogData = $('Prepare & Dedup').first().json;
const claudeResponse = $input.first().json;
const extraction = claudeResponse.content[0].text;
const systemPrompt = blogData.systemPrompt;
const blogContent = blogData.blogContent;
const blogTitle = blogData.blogTitle;
const blogUrl = blogData.blogUrl;

const platforms = ${JSON.stringify(
  Object.entries(PLATFORM_PROMPTS).map(([platform, cfg]) => ({
    platform,
    temperature: cfg.temperature,
    max_tokens: cfg.max_tokens,
    prompt: cfg.prompt
  })),
  null,
  2
)};

return platforms.map(p => {
  const userPrompt = p.prompt
    .replace(/\\{\\{EXTRACTION\\}\\}/g, extraction)
    .replace(/\\{\\{CONTENT\\}\\}/g, blogContent)
    .replace(/\\{\\{TITLE\\}\\}/g, blogTitle)
    .replace(/\\{\\{BLOG_URL\\}\\}/g, blogUrl);

  const requestBody = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: p.max_tokens,
    temperature: p.temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return { json: { platform: p.platform, requestBody } };
});`
    }
  },

  // ── 6. Generate Platform Content (Claude API — Step 2, runs 8 times) ──
  {
    id: uuid(),
    name: 'Generate Platform Content',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1400, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'x-api-key', value: '={{ $env.ANTHROPIC_API_KEY }}' },
          { name: 'anthropic-version', value: '2023-06-01' },
          { name: 'content-type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ $json.requestBody }}',
      options: { timeout: 120000 }
    },
    retryOnFail: true,
    maxTries: 3
  },

  // ── 7. Process Results, Compute Drip Schedule, Generate UTMs ──
  {
    id: uuid(),
    name: 'Process & Schedule',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1680, 300],
    parameters: {
      jsCode: `// Aggregate 8 platform responses, compute 7-day drip schedule, generate UTM links
const blogData = $('Prepare & Dedup').first().json;
const items = $input.all();

const platformOrder = [
  'linkedin_post', 'twitter_thread', 'reddit_draft', 'email_newsletter',
  'carousel_outline', 'devto_crosspost', 'hashnode_crosspost', 'indiehackers_draft'
];

const results = {};
const errors = [];

for (let i = 0; i < items.length; i++) {
  const platform = platformOrder[i];
  try {
    if (items[i].json.content && items[i].json.content[0]) {
      results[platform] = items[i].json.content[0].text;
    } else {
      errors.push(platform + ': unexpected response format');
      results[platform] = 'ERROR: Check execution log';
    }
  } catch (e) {
    errors.push(platform + ': ' + e.message);
    results[platform] = 'ERROR: ' + e.message;
  }
}

// ── 7-day drip schedule ──
// Find next Tuesday as Day 1 (or today if Tuesday)
const now = new Date();
const dayOfWeek = now.getUTCDay(); // 0=Sun, 2=Tue
let daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
if (daysUntilTuesday === 0 && now.getUTCHours() >= 18) daysUntilTuesday = 7;

const day1 = new Date(now);
day1.setUTCDate(day1.getUTCDate() + daysUntilTuesday);

// Helper: set scheduled time (adjust for your timezone offset in config)
const TZ_OFFSET = ${config.timezoneOffset};
const scheduleAt = (dayOffset, hour) => {
  const d = new Date(day1);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hour + TZ_OFFSET, 0, 0, 0);
  return d.toISOString();
};

const schedule = {
  linkedin:    scheduleAt(0, 10),  // Day 1 Tue 10AM
  twitter:     scheduleAt(0, 12),  // Day 1 Tue 12PM
  email:       scheduleAt(1, 10),  // Day 2 Wed 10AM
  carousel:    scheduleAt(2, 10),  // Day 3 Thu 10AM (manual Canva)
  reddit_1:    scheduleAt(3, 8),   // Day 4 Fri 8AM (manual)
  devto:       scheduleAt(5, 9),   // Day 6 Mon 9AM (auto — 2-day delay for SEO)
  hashnode:    scheduleAt(5, 9),   // Day 6 Mon 9AM (auto)
  reddit_2:    scheduleAt(6, 9),   // Day 7 Tue 9AM (manual)
  indiehackers: scheduleAt(7, 10)  // Day 8 Wed 10AM (manual)
};

// ── UTM links ──
const slug = blogData.blogSlug;
const base = blogData.blogUrl;

const utmLinks = {
  linkedin:     base + '?utm_source=linkedin&utm_medium=social&utm_campaign=' + slug + '&utm_content=text-post',
  twitter:      base + '?utm_source=twitter&utm_medium=social&utm_campaign=' + slug + '&utm_content=thread',
  reddit:       base + '?utm_source=reddit&utm_medium=community&utm_campaign=' + slug + '&utm_content=discussion',
  email:        base + '?utm_source=newsletter&utm_medium=email&utm_campaign=' + slug + '&utm_content=newsletter-cta',
  devto:        base + '?utm_source=devto&utm_medium=cross-post&utm_campaign=' + slug + '&utm_content=article',
  hashnode:     base + '?utm_source=hashnode&utm_medium=cross-post&utm_campaign=' + slug + '&utm_content=article',
  indiehackers: base + '?utm_source=indiehackers&utm_medium=community&utm_campaign=' + slug + '&utm_content=update'
};

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

return [{
  json: {
    blogTitle: blogData.blogTitle,
    blogUrl: blogData.blogUrl,
    blogSlug: slug,
    pubDate: blogData.pubDate,
    timestamp,
    results,
    schedule,
    utmLinks,
    errors,
    platformCount: Object.keys(results).length,
    errorCount: errors.length
  }
}];`
    }
  },

  // ── 8. Format Slack Message ──
  {
    id: uuid(),
    name: 'Format Slack Message',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1960, 100],
    parameters: {
      jsCode: `const data = $input.first().json;
const r = data.results;
const s = data.schedule;
const trunc = (str, n) => str && str.length > n ? str.slice(0, n) + '...' : (str || 'N/A');

const errorLine = data.errorCount > 0
  ? '\\n:warning: *Errors:* ' + data.errors.join(', ') : '';

const blocks = [
  { type: 'header', text: { type: 'plain_text', text: 'New Content Ready for Review', emoji: true } },
  { type: 'section', text: { type: 'mrkdwn',
    text: '*Blog Post:* <' + data.blogUrl + '|' + data.blogTitle + '>\\n'
      + '*Platforms:* ' + data.platformCount + ' drafts generated' + errorLine + '\\n'
      + '*Drip starts:* ' + s.linkedin.slice(0,10)
  }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*LinkedIn Post* (scheduled ' + s.linkedin.slice(0,10) + '):\\n' + trunc(r.linkedin_post, 500) }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*Twitter Thread* (scheduled ' + s.twitter.slice(0,10) + '):\\n' + trunc(r.twitter_thread, 500) }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*Email Newsletter* (scheduled ' + s.email.slice(0,10) + '):\\n' + trunc(r.email_newsletter, 400) }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*Reddit Draft* (manual post ' + s.reddit_1.slice(0,10) + '):\\n' + trunc(r.reddit_draft, 400) }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*Carousel Outline* (manual Canva ' + s.carousel.slice(0,10) + '):\\n' + trunc(r.carousel_outline, 300) }},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn',
    text: '*Dev.to + Hashnode* (auto ' + s.devto.slice(0,10) + '): Full cross-posts ready\\n'
      + '*Indie Hackers* (manual ' + s.indiehackers.slice(0,10) + '):\\n' + trunc(r.indiehackers_draft, 200)
  }},
  { type: 'divider' },
  { type: 'context', elements: [{ type: 'mrkdwn',
    text: 'Full content in <http://localhost:5678|n8n> execution log | UTM links auto-generated'
  }]}
];

return [{ json: { ...data, slackBlocks: JSON.stringify({ blocks }),
  slackText: 'New content: ' + data.blogTitle + ' (' + data.platformCount + ' platforms)'
}}];`
    }
  },

  // ── 9. Notify Slack ──
  {
    id: uuid(),
    name: 'Notify Slack',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [2240, 100],
    parameters: {
      method: 'POST',
      url: 'YOUR_SLACK_WEBHOOK_URL',
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: 'Content-Type', value: 'application/json' }]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ $json.slackBlocks }}',
      options: { timeout: 10000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 10. Publish to Buffer (LinkedIn) ──
  {
    id: uuid(),
    name: 'Publish LinkedIn (Buffer)',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1960, 400],
    parameters: {
      method: 'POST',
      url: 'https://api.bufferapp.com/1/updates/create.json',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Content-Type', value: 'application/x-www-form-urlencoded' }
        ]
      },
      sendBody: true,
      specifyBody: 'string',
      body: '=text={{ encodeURIComponent($json.results.linkedin_post + "\\n\\n" + $json.utmLinks.linkedin) }}&profile_ids[]={{ $env.BUFFER_LINKEDIN_PROFILE_ID }}&scheduled_at={{ $json.schedule.linkedin }}&access_token={{ $env.BUFFER_ACCESS_TOKEN }}',
      options: { timeout: 15000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 11. Publish to Typefully (Twitter Thread) ──
  {
    id: uuid(),
    name: 'Publish Twitter (Typefully)',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1960, 560],
    parameters: {
      method: 'POST',
      url: '=https://api.typefully.com/v2/social-sets/{{ $env.TYPEFULLY_SOCIAL_SET_ID }}/drafts',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'X-API-KEY', value: '=Bearer {{ $env.TYPEFULLY_API_KEY }}' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ content: $json.results.twitter_thread, schedule: "next-free-slot", threadify: false, "schedule-date": $json.schedule.twitter }) }}',
      options: { timeout: 15000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 12. Send Email (Loops.so) ──
  {
    id: uuid(),
    name: 'Send Email (Loops.so)',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1960, 720],
    parameters: {
      method: 'POST',
      url: 'https://app.loops.so/api/v1/transactional',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: '=Bearer {{ $env.LOOPS_API_KEY }}' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ transactionalId: $env.LOOPS_NEWSLETTER_TEMPLATE_ID || "YOUR_TEMPLATE_ID", mailingList: "Blog Subscribers", dataVariables: { blogTitle: $json.blogTitle, blogUrl: $json.utmLinks.email, newsletterContent: $json.results.email_newsletter } }) }}',
      options: { timeout: 15000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 13. Publish to Dev.to ──
  {
    id: uuid(),
    name: 'Publish Dev.to',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1960, 880],
    parameters: {
      method: 'POST',
      url: 'https://dev.to/api/articles',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'api-key', value: '={{ $env.DEVTO_API_KEY }}' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ article: { title: $json.blogTitle, body_markdown: $json.results.devto_crosspost, published: true, canonical_url: $json.blogUrl } }) }}',
      options: { timeout: 30000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 14. Publish to Hashnode ──
  {
    id: uuid(),
    name: 'Publish Hashnode',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1960, 1040],
    parameters: {
      method: 'POST',
      url: 'https://gql.hashnode.com',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: '={{ $env.HASHNODE_PAT }}' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ query: "mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id url } } }", variables: { input: { title: $json.blogTitle, contentMarkdown: $json.results.hashnode_crosspost, publicationId: $env.HASHNODE_PUBLICATION_ID || "YOUR_PUB_ID", originalArticleURL: $json.blogUrl, tags: [] } } }) }}',
      options: { timeout: 30000 }
    },
    onError: 'continueErrorOutput'
  },

  // ── 15. Save Manual Drafts (Reddit, Carousel, IH) ──
  {
    id: uuid(),
    name: 'Save Manual Drafts',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1960, 1200],
    parameters: {
      jsCode: `// Prepare manual drafts for review — these get saved in the execution log
// and appear in the Slack notification. Manual posting required.
const data = $input.first().json;

const manualDrafts = {
  reddit: {
    content: data.results.reddit_draft,
    scheduledDate: data.schedule.reddit_1,
    instructions: 'Post manually to your target subreddit. Review tone — must sound like a practitioner, NOT a vendor. No product mentions.'
  },
  carousel: {
    content: data.results.carousel_outline,
    scheduledDate: data.schedule.carousel,
    instructions: 'Design in Canva using this outline. Post via Buffer on the scheduled date.'
  },
  indiehackers: {
    content: data.results.indiehackers_draft,
    scheduledDate: data.schedule.indiehackers,
    instructions: 'Post to Indie Hackers. Add real revenue numbers and honest founder context before posting.'
  }
};

return [{
  json: {
    blogTitle: data.blogTitle,
    blogSlug: data.blogSlug,
    manualDrafts,
    message: 'Manual drafts saved. Check Slack #content-review and n8n execution log for full content.'
  }
}];`
    }
  }
];

// ─── Connections ─────────────────────────────────────────────────────────────

const connections = {
  'Blog RSS Trigger': {
    main: [[{ node: 'Fetch Blog Content', type: 'main', index: 0 }]]
  },
  'Fetch Blog Content': {
    main: [[{ node: 'Prepare & Dedup', type: 'main', index: 0 }]]
  },
  'Prepare & Dedup': {
    main: [[{ node: 'Extract Key Points', type: 'main', index: 0 }]]
  },
  'Extract Key Points': {
    main: [[{ node: 'Create Platform Prompts', type: 'main', index: 0 }]]
  },
  'Create Platform Prompts': {
    main: [[{ node: 'Generate Platform Content', type: 'main', index: 0 }]]
  },
  'Generate Platform Content': {
    main: [[{ node: 'Process & Schedule', type: 'main', index: 0 }]]
  },
  // Fan-out from Process & Schedule to all publishing endpoints
  'Process & Schedule': {
    main: [[
      { node: 'Format Slack Message', type: 'main', index: 0 },
      { node: 'Publish LinkedIn (Buffer)', type: 'main', index: 0 },
      { node: 'Publish Twitter (Typefully)', type: 'main', index: 0 },
      { node: 'Send Email (Loops.so)', type: 'main', index: 0 },
      { node: 'Publish Dev.to', type: 'main', index: 0 },
      { node: 'Publish Hashnode', type: 'main', index: 0 },
      { node: 'Save Manual Drafts', type: 'main', index: 0 }
    ]]
  },
  'Format Slack Message': {
    main: [[{ node: 'Notify Slack', type: 'main', index: 0 }]]
  }
};

// ─── Workflow Object ─────────────────────────────────────────────────────────

const workflow = {
  name: config.companyName + ' Content Repurposing Pipeline',
  nodes,
  connections,
  settings: { executionOrder: 'v1' },
  staticData: { global: { processedUrls: [] } },
  pinData: {},
  active: false
};

// ─── Write Output ────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, '..', 'workflows', 'content-repurposing-pipeline.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2));
console.log('Workflow written to:', outPath);
console.log('Nodes:', nodes.length, '(' + nodes.filter(n => !n.type.includes('stickyNote')).length + ' functional)');
console.log('Connections:', Object.keys(connections).length);
console.log('Fan-out from Process & Schedule:', connections['Process & Schedule'].main[0].length, 'parallel branches');
