/**
 * Automated Marketing Engine — Configuration
 *
 * Copy this file to config.js and fill in your details:
 *   cp config.example.js config.js
 *
 * Then regenerate the workflow:
 *   node n8n/scripts/build-workflow.js
 *
 * Import the generated JSON into n8n at http://localhost:5678
 */

module.exports = {
  // ─── Your Brand Identity (required) ───────────────────────────────────────

  companyName: 'YourCompany',
  blogUrl: 'https://yourdomain.com',
  rssFeedUrl: 'https://yourdomain.com/feed',

  // ─── What Your Company Does (required) ────────────────────────────────────

  // One sentence describing your company for the AI content strategist
  nicheDescription: 'a SaaS helping businesses with [your value proposition]',

  // How the AI should frame the founder's voice
  founderRole: 'a solo technical builder sharing hard-won insights',

  // Your area of expertise (used in content constraints)
  nicheTopic: 'your industry',

  // ─── Platform Customization ───────────────────────────────────────────────

  // The subreddit where your target audience hangs out
  redditSubreddit: 'r/your_niche',

  // Call-to-action for the final carousel slide
  carouselCta: 'Follow for more insights',

  // Suggested tags for Dev.to cross-posts (comma-separated)
  devtoTags: 'startup, saas, programming, webdev',

  // ─── Scheduling ───────────────────────────────────────────────────────────

  // IANA timezone for scheduling posts (e.g., 'America/New_York', 'Europe/London')
  timezone: 'UTC',

  // Hours to add to convert your local time to UTC (e.g., 4 for EDT, 5 for EST, 0 for UTC, 8 for PST)
  timezoneOffset: 0,

  // ─── Advanced: Content Style ──────────────────────────────────────────────

  // Words/phrases to avoid in generated content
  avoidWords: '"leverage," "synergy," "delve," "In today\'s rapidly evolving landscape," "game-changer," "cutting-edge," "revolutionary"',

  // What the AI should embrace in writing style
  embraceStyle: 'Specific technical details, real-world examples, contrarian takes, founder vulnerability',
};
