# M300 Nigeria — Public Gateway: Research & Direction

**Design research · Public gateway**
Scope: the public gateway (`/`) — not the authenticated dashboard
Reviewed: 5 comparable platforms
Audience: whole of Nigeria + international partners

A competitive scan and site direction for the public landing and secure-login gateway in front of the Mission 300 Nigeria monitoring platform — the page a minister, a DisCo engineer, a journalist, or any citizen sees first, before anyone signs in.

---

## §01 — Why this page carries more weight than a typical landing page

Everything else in this build — Executive Overview, the KPI Directory, Data Submissions — is seen by people who already have a login. This page is seen by everyone else: state officials deciding whether to trust the numbers, DisCos checking whether their data is represented fairly, donors deciding whether to keep funding, and ordinary Nigerians asking whether their community shows up at all. It has to read as *official and credible* before it reads as good-looking.

> **Working thesis:** the strongest asset this page has that Mission 300 Africa, GEAPP and most national portals don't — a live, already-built platform of real KPI data behind it. The landing page shouldn't invent generic marketing claims; it should surface the same real numbers Executive Overview already shows, a tier down in detail, in public view.

---

## §02 — Competitive scan

Five reference points spanning the exact spectrum this page sits in: continental initiative marketing, funder-facing nonprofit sites, a Nigerian federal agency, a secure-gateway pattern, and a data-transparency dashboard.

### Mission 300 Africa
`mission300africa.org`

Continental initiative site. Hero states the 300M target immediately, then Vision (3 delivery pillars as cards), a stark Challenge stat ("83% of the global energy deficit"), Benefits, News, video gallery, then partner logos (World Bank, AfDB, governments).

- **Borrow:** stat-led hero
- **Avoid:** no live data, PDFs only

### GEAPP / Energy Alliance
`energyalliance.org`

Funder-facing nonprofit. "Change Energy. Change Lives" hero with a donor-dashboard CTA. Two pillars, then three named human testimonials (incl. one from Nigeria), a 20-country map, then dense partner-logo wall.

- **Borrow:** named human stories
- **Avoid:** donor framing reads NGO, not gov

### Rural Electrification Agency (Nigeria)
`rea.gov.ng`

The direct domestic peer, and a cautionary one: mandate/news-bulletin structure typical of Nigerian federal agency sites, no data visualisation, no way for a citizen to see what's been delivered in their own state.

- **Borrow:** nothing structurally
- **Avoid:** bulletin-board feel, zero data

### Login.gov
`login.gov`

Not energy-related, but the exact pattern this page needs on its login side: one plain-language marketing page in front of a single secure sign-in, at national scale (100M+ accounts), built to *digital.gov* human-centred standards.

- **Borrow:** plain-language trust cues

### Tracking SDG7 (World Bank/IEA/IRENA)
`trackingsdg7.esmap.org`

The closest data-shape peer: country-level electricity-access indicators presented publicly, backed by named custodian institutions, positioned as the authoritative global reference rather than a campaign site.

- **Borrow:** indicator-first, not story-first

---

## §03 — What repeats across all five

Patterns that show up regardless of whether the site is a campaign, a nonprofit, or a data portal — and what each one means for M300 Nigeria specifically.

| Pattern | Seen in | Fit for M300 Nigeria |
|---|---|---|
| One dominant number in the hero | All five | **Use — but make it live** |
| Named institutional partners as trust signal | M300 Africa, GEAPP | **Use — NERC, REA, TCN, DisCos** |
| Pillars presented as parallel cards | M300 Africa, GEAPP | **Use — already have 6 named pillars** |
| Human/beneficiary story, named and located | GEAPP | **Use sparingly — 1, not 3** |
| News/updates cadence section | M300 Africa, REA | **Defer — needs a content owner first** |
| Country/state-level map as navigation | GEAPP, SDG7 tracker | **Use — State & DisCo view already exists** |
| Single, plain-language secure-login gateway | Login.gov | **Use as-is for the sign-in flow** |
| Indicators framed as authoritative record, not marketing | SDG7 tracker | **Use — this is the actual differentiator** |

---

## §04 — Recommended site structure

The public gateway and the existing secure dashboard already sit on the same domain and codebase — the sitemap should make that relationship explicit rather than bolting on a separate marketing site.

```
Public Gateway                              /
  Replaces today's redirect straight to /dashboard — becomes the
  front door for everyone, signed in or not.

├─ Home                                     /
│    Hero + live national headline strip + six pillars +
│    delivery-in-motion + partners
│
├─ National Progress                        /progress
│    Public, read-only cut of Executive Overview's real KPI data —
│    no filters, no drill-down, no login
│
├─ The Compact                              /about
│    What Mission 300 / the National Energy Compact is, the six
│    pillars explained, named institutional partners
│
├─ Data & Methodology                       /methodology
│    Where each number comes from — the same provenance text
│    already on every KPI, surfaced publicly
│
└─ Secure sign-in                           /account/login
     Existing login flow, reached via one clear "Sign in" action —
     leads into the platform you already have

Authenticated platform                      /dashboard, /kpis, /programs …
  Unchanged — Executive Overview, KPI Directory, Data Submissions,
  Reports, Administration, exactly as built
```

---

## §05 — Home page, section by section

Each section below is grounded in a pattern from §03, with the reasoning for including — or deliberately leaving out — the equivalent from the reference sites.

**Hero** *(from §03 · dominant number)*
Not a slogan — a live figure pulled from the same KPI data Executive Overview already computes (e.g. people connected this year, national access rate), with the reporting period visible next to it exactly as the dashboard already displays confidence. Nigeria flag motif, not stock photography of solar panels.

**National headline strip** *(from §03 · live, not static)*
3–4 numbers in one row — access rate, generation capacity, clean cooking access, capital mobilised — sourced the same way the Compact-outcome headline cards are. This is the section that no reference site can match, because none of them have a real backend behind their claims.

**Six pillars** *(from §03 · parallel cards)*
Same six pillars already defined in the platform (Generation & Network, Last-Mile Access, Viable Utilities, Private Sector, Regional Integration, Clean Cooking), each linking to its public progress view — not to six new pages that need separate content.

**Delivery in motion** *(from §03 · map as navigation)*
A Nigeria map echoing the State & DisCo view already built, showing where projects are active right now — this is the section a state commissioner or a journalist checks first: "did my state get anything."

**One story, well told** *(from §03 · human story, used sparingly)*
GEAPP uses three; one is enough here, rotated periodically rather than three at once — keeps the page reading as a national record, not a fundraising appeal.

**Institutions** *(from §03 · named partners as trust)*
Federal Ministry of Power, NERC, REA, TCN, NISO, the DisCos — logos as a credibility signal, and each one a real stakeholder already modelled in Administration & Stakeholders.

**Secure access** *(from §03 · plain-language gateway)*
One clearly labelled "Sign in" action, described in one sentence — who it's for (institutions submitting data, reviewers, oversight users) — not a generic "Login" button with no context, per the Login.gov pattern.

**Footer** *(from §03 · methodology as credibility)*
Data & Methodology, Contact, and the same provenance language already written into every KPI's info popover — reused, not rewritten, so the public claims and the dashboard's own claims can never drift apart.

---

## §06 — Visual continuity with the dashboard

The public gateway should look like the front door of the platform you already use, not a separate agency's marketing site bolted on top of it. These are the two accents already in production use — the gateway design should draw from this pair, not introduce a third.

| Token | Hex | Where it's used today |
|---|---|---|
| Brand green | `#008751` | brand-600, Nigerian flag green — sidebar & primary actions |
| Brand green (dark) | `#016E44` | brand-700, hover and pressed states |
| Chart teal | `#1F7FA6` | Executive Overview's mid series colour |
| Chart navy | `#10314F` | darkest ring/series colour |

---

## §07 — Decisions I can't make for you

Before building the actual page, these need a call — each changes the structure above materially.

- **Primary audience:** is this page written first for citizens, for state/DisCo officials, or for donors and international partners? The tone of the hero and the choice of which numbers lead changes with the answer.
- **Public data threshold:** should every figure on `/progress` be exactly what's in Executive Overview, or only KPIs marked *confirmed* — holding back *provisional*/*requires-validation* values from public view?
- **Language:** English only, or does this need Hausa/Yoruba/Igbo variants given the "whole of Nigeria" audience?
- **News & updates:** worth including only if someone owns writing it — otherwise it becomes the one visibly stale section on the page.
- **Domain:** does the public gateway live at the same domain as the dashboard (as sketched in §04), or a separate public-facing domain that links into it?

---

*Reviewed: mission300africa.org · energyalliance.org · rea.gov.ng · login.gov · trackingsdg7.esmap.org*
