# M300 Nigeria — Public Gateway: Home page sketch

Section-by-section build spec for `/`. Follows on from `public-gateway-research.md`,
which covers the competitive scan and site structure; this document covers what
actually goes on the home page, in what words, fed by which field.

Nothing here is built yet. `/` currently redirects to `/dashboard`
(`src/app/router.tsx`), so this is a clean slate.

---

## §00 — Decisions taken

The five open questions from the research doc's §07, resolved so the sketch can be
concrete.

| Question | Decision |
|---|---|
| Primary audience | Nigerian public sets the **tone**; `/progress` carries the depth a state commissioner or journalist needs. Not a donor deck. |
| Public data threshold | **Every figure is published, each labelled with its validation status.** |
| Language | English at launch. Copy stays extractable so Hausa/Yoruba/Igbo can follow. |
| News & updates | **Cut.** No content owner means it becomes the one visibly stale section. |
| Domain | Same domain as the dashboard. The sign-in continuity is the point. |

### On publishing everything

Showing provisional and requires-validation figures publicly buys maximum
transparency and costs a specific risk: a journalist quotes a provisional number
as final, it is revised down next quarter, and the correction is the story.

A badge alone does not cover this — badges are chrome, and readers skip chrome.
So the mitigation is a **persistent, plain-language key** directly beneath the
headline strip (§02), in body text, not a tooltip and not a legend of coloured
dots. Every figure on the page then carries a status that has already been
explained in words the reader has passed over.

This is the one place the page should spend words on caveats. Everywhere else,
caveats live behind the info control, as they already do in the dashboard.

---

## §01 — Rules that apply to every section

Constraints, not suggestions. Most exist because the alternative is what a
generic template does by default.

**The generic test.** Every section must fail this question:

> Could this section appear on Ghana's or Kenya's version of this page by
> swapping a logo and three numbers?

If it survives the swap, it is marketing filler and gets cut or rewritten.
"Powering Nigeria's Future" survives the swap. "137.3 million Nigerians have
electricity access, up from 86.6 million in 2024" does not.

**Every number on this page comes from the API.** No hardcoded stats, no
`<h1>300 million</h1>` in JSX. If a figure cannot be sourced from the same
payload the dashboard reads, it does not go on the page. This is the single
structural reason the page cannot come out generic — it is constrained by real
data with real reporting periods.

**Every number carries its provenance.** Source institution, reporting period,
validation status. Reuse `SourceBadge` and `InfoPopover` rather than writing new
components — that also guarantees the public claims and the dashboard's claims
can never drift apart.

**Visual continuity with the dashboard.** Same tokens, same 13px-base type
scale. Do **not** switch to 16px marketing type — the density is part of the
register. This is a federal government record, not a product launch.

**Banned outright**, all of which the dashboard was just cleaned of:

- Icons in tinted circles
- Three-column feature-card grids
- Gradient mesh heroes
- Em-dash headings
- Scroll-triggered counting-up numbers
- Stock photography of solar panels or smiling villagers
- `seamless`, `empower`, `unlock`, `revolutionize`, `transforming`
- Any headline of the form "Empowering X. Transforming Y."

**AMENDED 2026-08-24 — the home page redesign.** Three rules above were
changed on request, deliberately, and are recorded here so the next change does
not fight them:

1. **A hero background image is now permitted**, behind a heavy navy scrim
   (`HeroBackdrop`). The ban on *stock* photography stands unchanged — a real,
   credited photograph or nothing. See `public/hero/README.md`.
2. **The hero is a dark band, not white.** "No gradient mesh" still holds; a
   flat navy field with a directional scrim is not that.
3. **Type on this page runs larger than the dashboard's 13px base**, and the
   page carries its own chart language (`lib/landing-chart-theme.ts`). The
   *continuity* requirement is now met through shared tokens, shared provenance
   components and identical vocabulary — not through identical type size.

Everything else in this section is unchanged and still binding, including the
generic test, "every number comes from the API", and "every number carries its
provenance".

**Visual register.** The Nigerian coat of arms (`public/Logos/geapp.png`) and
flag green `#008751`. Official record, not startup SaaS.

---

## §02 — Hero

**Purpose.** State the single most important fact about Mission 300 in Nigeria
before the reader scrolls. Not a slogan — a number.

**Content:**

- Eyebrow: `Federal Republic of Nigeria · National Energy Compact`
- Headline, the figure itself at display size:
  **`137.3 million Nigerians have electricity access`**
- Supporting line: `Up 50.7 million from the 86.6 million baseline in 2024. The
  national target is 236.7 million by 2030.`
- Provenance, visible, not hidden:
  `Nigeria Mission 300 Compact Progress Report · Q3 2025 · Confirmed`
- Primary action: `See national progress` → `/progress`
- Secondary action: `Sign in` with one sentence of context — *for institutions
  submitting data, reviewers and oversight users* — per the Login.gov pattern.
  Never a bare "Login" button.

**Data:** `headlineCards.peopleWithElectricityAccess` — `value`, `trend.label`,
`baselineLabel`, `targetLabel`, `reportingPeriod`, `provenance.source`.
All already computed for Executive Overview.

**What it is not:** no background image, no gradient, no carousel. The coat of
arms and the number do the work.

---

## §03 — National headline strip

**Purpose.** The section no reference site in the research doc can match,
because none of them have a backend. Four live figures in one row.

**Content:** the same four Compact outcomes the dashboard leads with —

| Figure | Field | Shown as |
|---|---|---|
| People with electricity access | `peopleWithElectricityAccess` | 137.3M, progress to 236.7M |
| Electricity access rate | `accessRate` | 70.0%, source year visible |
| Available generation capacity | `generationCapacity` | 5.4 GW of 13.6 GW installed |
| Clean cooking access | `cleanCookingAccess` | 26.0%, target 100% by 2030 |

Reuse `MetricCardFrame` and `BulletChart` directly. The public strip and the
authenticated Executive Overview should be visibly the same components — that
*is* the trust signal.

**Immediately beneath — the data confidence key.** Required by §00. Plain
sentences, roughly:

> Figures on this page carry the status of the data behind them. **Confirmed**
> means validated by the custodian institution. **Public source** means
> published elsewhere, such as the World Bank. **Provisional** and **Requires
> validation** are early figures that may change as data is checked — they are
> shown so the record is complete, not because they are final.

**What it is not:** not animated counters, not four icons in circles.

---

## §04 — How access is being delivered

**Purpose.** Answers "how", immediately after "how much". The three delivery
channels are concrete and specific to Nigeria's programme.

**Content:** New grid connections · Mini-grid household connections · Solar Home
Systems deployed. Each with its figure and progress to target where a target
exists.

**Data:** `accessDelivery[]`.

**Note:** at least one channel has no approved target and must say so —
*Annual target to be confirmed* — exactly as the dashboard now does. Publishing
the absence of a target is itself a credibility signal, and it is honest.

---

## §05 — The six pillars

**Purpose.** Show the Compact's actual structure. These are six real pillars
already modelled in the platform, not invented "features".

Generation & network · Last-mile access · Viable utilities · Private sector ·
Regional integration · Clean cooking

**Data:** `PILLAR_LABELS` in `src/api/schemas/common.ts`.

**Content per pillar:** name, one line of what it covers, and its current
headline indicator. Links to that pillar's public progress view.

**What it is not:** not six cards with a lucide icon and two lines of filler.
If a pillar has no number to show, it shows the name and the line only — an
empty state is better than a decorative icon.

---

## §06 — Delivery in motion

**Purpose.** The section a state commissioner or journalist checks first: *did
my state get anything?* Research doc calls this correctly.

**Content:** Nigeria map, states shaded by delivery activity, echoing the
existing State & DisCo view. Clicking a state opens its public summary.

**Data:** state-disco payload.

**Honest caveat:** this is the most expensive section to build and the one most
likely to sit half-finished. If it cannot be done properly it should ship as a
ranked list of states rather than a broken map. A list that works beats a map
that does not.

---

## §07 — One story

**Purpose.** One named, located human account. GEAPP uses three; three reads as
fundraising, one reads as a record.

**Content:** name, community, state, what changed, when. Photograph only if it is
a real photograph of that person with permission — otherwise no image at all.

**Blocked:** needs a real story from the comms team. Until one exists, **this
section does not ship**. A placeholder testimonial is the single most
AI-looking thing that could appear on this page.

---

## §08 — Institutions

**Purpose.** Named institutional partners as the trust signal, per the research
doc's §03.

**Content:** Federal Ministry of Power, NERC, REA, TCN, NISO, the DisCos — each
already modelled in Administration & Stakeholders.

**What it is not:** not a greyscale logo wall with a hover effect. Name the
institution and what it is responsible for. A reader learning that NERC is the
regulator is worth more than a logo they cannot identify.

---

## §09 — Footer

Data & Methodology · Contact · sign-in.

Methodology reuses the provenance text already written per KPI. No new copy,
so the public explanation and the dashboard's explanation cannot diverge.

---

## §10 — Cut deliberately

Recorded so these do not reappear by default.

| Cut | Reason |
|---|---|
| News & updates | No owner; would become visibly stale |
| Newsletter signup | Nothing to send |
| "Our partners" logo wall | Replaced by named institutions with roles (§08) |
| Testimonial carousel | One story or none (§07) |
| Statistics that count up on scroll | Decorative; undermines a record |
| "Learn more" cards to pages that do not exist | Every link must resolve |

---

## §11 — What the backend needs

The one genuinely new contract this page requires.

```
GET /api/public/overview
```

- Serves the headline strip, delivery channels and pillar indicators
- **No authentication**
- Every figure carries `validationStatus` and `provenance`
- Returns display labels, never filter slugs — see the `Q3-2025` defect fixed in
  `applyPeriodFilter`; `reportingPeriod` is a label, and that must hold on the
  real backend too
- Cacheable: this is read-only public data and will take the most traffic of
  anything in the platform

---

## §12 — Still open

- **The story (§07)** — needs a real, named, permitted account or the section does not ship
- **Map or ranked list (§06)** — depends on effort available
- **Who owns public copy** — the hero sentence will need sign-off from the Ministry
- **Visual verification** — none of this can be judged from source. A screenshot
  loop or a browser tool is needed before any of it is called done.
