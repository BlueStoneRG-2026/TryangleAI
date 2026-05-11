# TryangleAI

The repo behind [tryangleai.com](https://tryangleai.com) — landing page, free Chapter 1, and the buyer's master template for TRY Playbook Vol. I.

---

## What this is

**TRY Playbook · Vol. I** is the front door of a productized AI implementation business for small business owners. The ebook is the qualifier; higher tiers (Industry Packs, Workshops, Implementation Sprints) are the destination.

- **Publisher:** Tryangle Holdings LLC (New York)
- **Brand mark:** TRY
- **Year-1 ICP:** Contractors & Trades
- **North Star metric:** Hours per week reclaimed by owner
- **Front-end price:** $9.99 founding → $27 retail after first 100 buyers

## Repo layout

```
/                          ← (landing page lives here when wired in)
chapter-1-free/
  index.html               ← Workflow #01 (Review Responder) — free + master template
  styles.css               ← shared chapter stylesheet, inherited by all 12 workflows
README.md                  ← this file
_redirects                 ← Netlify clean URLs (/chapter-1 → /chapter-1-free/)
netlify.toml               ← Netlify build & headers config
```

The landing page (`index.html` at root) is currently deployed separately via Netlify drag-drop. Next step: wire that into this repo so the whole site auto-deploys on `git push`.

## The four-tier offering ladder

| Tier | Name | Price | Notes |
|------|------|-------|-------|
| 1 | TRY Playbook Vol. I | $9.99 → $27 | 12 workflows, 40-page PDF |
| 2 | Industry Packs (Contractor first) | $29 each | Same 12 rewritten for one vertical |
| 3 | TRY Workshop | $297 | Monthly cohorts, 10–12 owners each |
| 4 | TRY Implementation | $2,500 / $5,000 / $8,000 | 3 fixed SKUs + optional $497–997/mo maintenance |

Realistic Year-1 target: **~$99K**, with >50% from Tier 4.

## The 12 workflows (locked)

1. Review Responder *(free Chapter 1 — this is what's in the repo)*
2. Quote Generator
3. Missed-Call Text-Back
4. Email Triage
5. Invoice Follow-Up
6. Meeting Notes
7. Social Content Engine
8. Lead Qualifier
9. Customer Re-engagement
10. Job Post Writer
11. Contract Summary & Questions for Counsel *(renamed from "Contract Review" for legal safety)*
12. Weekly Owner Brief

Every chapter inherits the same 15-section mini-implementation-kit structure used in `chapter-1-free/index.html`.

---

## The 90-day de-risking calendar

The single source of truth for what we're doing and why, in order. Move fast on this. Most of the assurance comes from execution, not more planning.

### Month 1 (Days 1–30) — Product validation

- [ ] **Day 1–7** — Workflow #01 (Review Responder) written, designed, deployed (this PR)
- [ ] **Day 7–14** — Workflows #02–#12 written to the same template
- [ ] **Day 14–21** — Direct outreach to 20+ contractors via Facebook groups, r/Contractors, Thumbtack pros, local hardware stores. Offer: *"Free Vol. I + $50 gift card for a 15-min feedback call after 7 days."*
- [ ] **Day 21–30** — Run all 20 feedback calls. Record every "I got stuck at step X." Patch friction points before any paid traffic.

### Month 2 (Days 31–60) — Funnel validation

- [ ] **Day 31–40** — Launch Vol. I at $9.99 to warm list (the 20 beta callers + their referrals). Target: 50 paid sales.
- [ ] **Day 41–50** — Ship the post-purchase 7-email implementation sequence. Track: how many implement Workflow #01 within 7 days? (Goal: 60%+. Anything less means the docs aren't doing their job.)
- [ ] **Day 51–60** — Soft-launch the Contractor Industry Pack at $29 to existing buyers. Target: 10 upgrades. That's a 20% upsell rate — proves the ladder.

### Month 3 (Days 61–90) — Channel validation

- [ ] **Day 61–75** — Spend up to $500 testing one acquisition channel (Facebook groups + micro-influencer affiliates first; ads only after a tested $<15 CAC organic channel). Track CAC religiously.
- [ ] **Day 76–90** — Double down on whatever produced <$15 CAC. Cut the rest. Pre-sell first Workshop cohort (deposits, not free signups).

### The three questions that have to be yes by Day 90

1. **Does the product deliver?** ≥18 of the first 20 buyers say "yes, I saved measurable time."
2. **Can we acquire customers profitably?** One channel under $15 CAC, tested with $500 spend.
3. **Will they upgrade?** ≥15% of Vol. I buyers buy Tier 2 within 60 days.

If all three are yes, scale. If any are no, fix that one first.

---

## What's explicitly NOT being done yet (and why)

- **No "Triple Your Money Back" guarantee** — attracts serial refunders on instant-delivery digital. Standard 30-day stays.
- **No Loom videos in every chapter** — gates launch behind 12 video productions. Adds in v3 after 20 paying customers.
- **No public `/book/` folder** — buyer chapters go through gated Gumroad delivery, not public Netlify paths.
- **No ad spend** — until 20 paying customers from direct outreach exist.
- **No six Industry Packs at once** — Contractor first, others wait for proof.

---

## Development & deploy

This repo is deployed to Netlify. Once GitHub continuous deployment is wired up:

```bash
# Make changes locally
git add .
git commit -m "Workflow 02 — Quote Generator"
git push
```

Netlify rebuilds and the site is live in ~30 seconds.

## Contact

- General: hi@tryangleai.com
- Refunds: refund@tryangleai.com
- Workshop / stuck readers: workshop@tryangleai.com
