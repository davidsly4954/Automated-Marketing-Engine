# 7-Email Post-Action Nurture Sequence — Template

A framework for building an automated email nurture sequence in Loops.so (or any email tool).
Customize the content, merge tags, and cadence for your product.

**Trigger:** User completes your lead magnet (free scan, free trial, free report, etc.)
**Cadence:** Days 0, 3, 7, 10, 14, 21, 28
**Send time:** Tuesday/Wednesday 9-11 AM recipient local timezone
**Suppression:** Max 1 email per 24-48 hrs, exit on conversion

---

## Contact Properties to Create

Customize these for your product:

```
result_score        (string)  — grade, score, or outcome from your lead magnet
total_findings      (number)  — number of issues/results/recommendations found
key_metric_1        (number)  — primary metric relevant to your product
key_metric_2        (number)  — secondary metric
user_domain         (string)  — user's domain or company identifier
company_name        (string)  — company name
action_date         (string)  — ISO date of the triggering action
plan_interest       (string)  — which tier they're most likely to buy
```

## Mailing Lists to Create

- "Free [Lead Magnet] Leads"
- "Blog Subscribers"
- "Trial Users"

---

## EMAIL 1 — Day 0: Results Delivery

**Target open rate: 60-80%** (users are expecting this)

**Subject lines (test all 3):**
- Your [product] found {{ total_findings }} [issues/opportunities]
- {{ key_metric_1 }} [key findings] on {{ user_domain }}
- {{ company_name }}'s [product] results are ready

**Preview text:** Your [score type]: {{ result_score }} — see full breakdown inside

**Body:**

Hi {{ first_name }},

Your [product action] on **{{ user_domain }}** is complete.

**Your [Score Type]: {{ result_score }}**

[Include a summary table or key metrics from the user's results]

[View Your Full Report →]({{ dashboard_url }})

Over the next few weeks, I'll send you practical guidance on what these findings mean and how to act on them.

— [Your Name], [YourCompany]

**CTA button:** View Your Full Report

---

## EMAIL 2 — Day 3: Education

**Goal:** Help the user understand their #1 finding. Build trust through expertise.

**Subject:** What your top finding actually means for {{ company_name }}

**Body framework:**
- Reference their specific result: "Your [product] flagged [X] as your highest priority..."
- Explain why it matters (business impact, not just technical details)
- Provide 2-3 actionable steps they can take right now
- Sign off with credibility: link to a relevant blog post

---

## EMAIL 3 — Day 7: Compliance / Industry Angle

**Goal:** Connect findings to an industry framework, regulation, or standard that matters to your buyer.

**Subject:** 3 findings that would flag during [relevant audit/review]

**Body framework:**
- Reference their specific metrics
- Map findings to industry requirements (SOC 2, GDPR, ISO, HIPAA, PCI — whatever applies to your niche)
- Show the gap between current state and required state
- Quantify the risk (fines, audit failures, lost deals)

**Note:** This is typically the highest-converting email in B2B SaaS nurture sequences. Compliance urgency drives action.

---

## EMAIL 4 — Day 10: Social Proof / Case Study

**Goal:** Show transformation is possible with a real example.

**Subject:** How [similar company] went from [bad state] to [good state]

**Body framework:**
- Tell the story of a customer or user similar to the recipient
- Specific before/after metrics
- Timeline (4 weeks, 2 months, etc.)
- What they did differently
- Subtle connection to your product

---

## EMAIL 5 — Day 14: Depth Gap

**Goal:** Plant the seed that the free version only shows the surface.

**Subject:** 5 things your free [product] can't check

**Body framework:**
- Acknowledge the value of the free version
- List 5 things the paid version covers that the free version doesn't
- Frame each as a risk or blind spot
- Each item should feel like "I didn't know I needed that"
- No hard sell — educational tone

---

## EMAIL 6 — Day 21: Direct Offer

**Goal:** Make the ask. This is your conversion email.

**Subject:** [YourCompany] Pro from $[PRICE]/month

**Body framework:**
- Reference their original results: "When you [took action] {{ action_date }}, we found {{ total_findings }} [issues]..."
- Restate the value: what they get, what problems it solves
- Present pricing tiers clearly
- Include the strongest social proof point
- Clear single CTA to upgrade
- Address the #1 objection in a P.S.

---

## EMAIL 7 — Day 28: Re-engagement Loop

**Goal:** Restart the funnel. Whether they converted or not, bring them back.

**Subject:** [Do the free action] again — see what's changed

**Body framework:**
- "It's been 4 weeks since your last [action]..."
- Explain what might have changed
- Single CTA to retake the free action
- This resets Day 0 if they take action again

---

## Behavioral Overrides

These override the standard sequence timing:

- **Visits pricing page** → Skip to Email 6 (Direct Offer) immediately
- **Uses dashboard 3+ times** → Send Email 5 (Depth Gap) early
- **Converts** → Exit sequence, move to onboarding
- **Unsubscribes** → Respect immediately, never re-add

## Key Metrics to Track

| Email | Target Open Rate | Target Click Rate |
|-------|-----------------|-------------------|
| 1 (Results) | 60-80% | 40-60% |
| 2 (Education) | 45-55% | 8-12% |
| 3 (Compliance) | 40-50% | 10-15% |
| 4 (Social Proof) | 35-45% | 8-12% |
| 5 (Depth Gap) | 35-45% | 10-15% |
| 6 (Direct Offer) | 30-40% | 5-8% |
| 7 (Re-engage) | 25-35% | 15-25% |
