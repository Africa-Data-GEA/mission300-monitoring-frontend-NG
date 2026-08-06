# M300 Nigeria — Public gateway: copy and data specification

Every user-facing string on the home page, and every figure behind it, with the
API field it comes from.

Two audiences for this document: whoever signs off the wording, and whoever
builds the Figma. Copy in **bold quotes** is final text. `code` is a field path.

Companion to `public-gateway-home.md` (structure) and
`public-gateway-research.md` (competitive scan).

---

## Principle: publish the whole record, plainly

Modelled on the UKHSA Data Dashboard, which the UK Analysis Function holds up as
good practice. Its move is not four hero numbers — it is **a lot of open data,
plainly presented**, each figure carrying its period and its caveats.

The platform already computes far more than the four Compact outcomes. All of it
is publishable, and a fuller record is more credible than a curated one: a
reader who can see thirteen indicators believes the four headline ones more than
a reader shown only the four.

So the home page carries **13 indicators plus delivery status**, not four.

### The UKHSA sentence pattern

Every figure gets a number *and a sentence*, never a number and a coloured
arrow:

> **"114 cases as of 22 July 2026. There has been an increase of 3 (2.7%)
> compared to the previous 7 days."**

The arrow tells a reader the direction. The sentence tells them the size, the
period, and what it is compared against — and it survives being read aloud, or
by a screen reader, or printed in a briefing pack.

---

## §01 — Header

| Element | Copy |
|---|---|
| Service name | **"Mission 300 Nigeria"** |
| Sub-line | **"Federal Ministry of Power"** |
| Action | **"Sign in"** |

Crest: Nigerian coat of arms, `public/Logos/geapp.png`, decorative
(`alt=""` — the service name beside it is the accessible label).

---

## §02 — Opening statement

> # National electrification record
>
> **{people.value}** people in Nigeria have electricity access, against a
> national target of **{people.targetLabel}**.
>
> `[ See national progress → ]`

| Slot | Field |
|---|---|
| `{people.value}` | `headlineCards.peopleWithElectricityAccess.value` — e.g. `137.3M` |
| `{people.targetLabel}` | `…peopleWithElectricityAccess.targetLabel` — e.g. `236.7M by 2030` |

One heading, one sentence, one button. Nothing else above the fold.

---

## §03 — The four Compact outcomes

> ## Latest published figures
>
> The four outcomes Nigeria has committed to under the National Energy Compact.

| Row | Value field | Period field | Target |
|---|---|---|---|
| People with electricity access | `peopleWithElectricityAccess.value` | `.reportingPeriod` | `236.7M by 2030` |
| Electricity access rate | `accessRate.value` | `.sourceYear` | `.targetLabel` |
| Available generation capacity | `generationCapacity.value` | `.reportingPeriod` | `.benchmarkLabel` |
| Clean cooking access | `cleanCookingAccess.value` | `.reportingPeriod` | `.targetLabel` |

Each row also carries its comparison sentence from `.trend.label`, e.g.
**"+50.7M vs prior published year"**.

Row labels come from `.title` — never retyped here, so the public page and the
dashboard cannot drift apart.

---

## §04 — Delivery channels

> ## How access is being delivered
>
> Connections reach households by three routes. Figures are cumulative for the
> current reporting year.

Source: `accessDelivery[]` — three rows, `.title` and `.value`.

- With a target: **"{percentComplete}% of {targetLabel}"**
- Without one: **"Annual target to be confirmed"**

That second string matters. The specification forbids deriving a grid-connection
target from the 9% access-rate commitment, so one channel genuinely has none.
Publishing the absence is a credibility signal — it shows the record is honest
about what has not been agreed.

---

## §05 — National performance indicators *(not yet built)*

> ## National performance indicators
>
> Six measures of how the power sector itself is performing. These sit behind
> the access figures above: a household counted as connected still depends on
> metering, on network losses, and on whether its distribution company is
> financially viable.

Source: `nationalPerformance[]`.

| Indicator | KPI | Unit | Format | Note |
|---|---|---|---|---|
| Renewable Energy Share in Generation Mix | `M300-P1-004` | % | `27.4%` | **"Seasonal — retains the reporting period"** |
| Metering Rate | `M300-P3-004` | % | `55%` | |
| ATC&C Loss Rate | `M300-P3-006` | % | `31.2%` | **"Lower is better"** |
| DisCo Remittance to NBET/GenCos | `M300-P3-009` | % | `85.4%` | |
| Subsidy / Tariff Shortfall | `M300-P3-010` | NGN bn | `₦2.20tn` | **"Outstanding = approved requirement − funded"** |
| Private Capital Mobilized for Last-Mile Access | `M300-P4-002` | USD m | `$2.4B` | **"Tracked from the January 2025 baseline"** |

Each row: current value, the target from `.targetLabel`, the period, and the
caption where one exists. Captions come from the data — they are already written
and already reviewed.

**This section is the single biggest gain available.** It roughly triples the
published record at no data cost, and it is what separates a national record
from a campaign page.

---

## §06 — Delivery status *(not yet built)*

> ## Programme and project delivery
>
> Status of the projects delivering the Compact, as reported by the institutions
> responsible for them.

Source: `deliveryStatus.statusSummary[]` — a count per status.

> **"{n} projects are being tracked. {x} on track, {y} at risk, {z} delayed,
> {b} blocked."**

Publishing blocked and delayed counts publicly is a real decision, and it is the
one that earns the rest of the page its credibility. A record that only ever
reports good news is read as a campaign.

---

## §07 — The six pillars

> ## The six pillars of the Compact

Labels from `PILLAR_LABELS`. Summaries are editorial and need sign-off:

1. **Generation & network** — "Building generation capacity and the transmission network to carry it."
2. **Last-mile access** — "Reaching households beyond the grid through mini-grids and solar home systems."
3. **Viable utilities** — "Putting distribution companies on a financially sustainable footing."
4. **Private sector** — "Bringing private capital into generation, distribution and off-grid delivery."
5. **Regional integration** — "Connecting Nigeria to regional power markets and cross-border trade."
6. **Clean cooking** — "Moving households away from firewood and charcoal to cleaner fuels."

No icons. There is no glyph for "viable utilities", and an invented one is
decoration standing where information should be.

---

## §08 — Institutions

> ## Who reports these figures
>
> Each figure on this page is reported by the institution responsible for it.

| Institution | Role |
|---|---|
| Federal Ministry of Power | "Policy direction and oversight of the National Energy Compact." |
| Nigerian Electricity Regulatory Commission (NERC) | "Regulation of tariffs, licensing and market rules." |
| Rural Electrification Agency (REA) | "Off-grid and mini-grid delivery to underserved communities." |
| Transmission Company of Nigeria (TCN) | "The national transmission network." |
| Nigerian Independent System Operator (NISO) | "System operation and dispatch of the national grid." |
| Distribution companies (DisCos) | "Connections, metering and supply to end customers." |

Named with responsibilities, not a logo wall. A reader who does not know what
NERC is learns nothing from its mark, and the point of a public record is to
show who is accountable for which number.

---

## §09 — Footer

> ## About these figures
>
> Every figure on this page carries the status of the data behind it.
> **Confirmed** means validated by the institution responsible for it.
> **Public source** means published elsewhere, such as by the World Bank.
> **Provisional** and **requires validation** are early figures that may change
> as data is checked. They are shown so the record is complete, not because they
> are final.
>
> Last updated {date}.
>
> [Sign in to the monitoring platform]
> For institutions submitting data, reviewers and oversight users.
>
> Federal Republic of Nigeria · Federal Ministry of Power

`{date}` from `provenance.lastUpdated`, formatted by `formatDate`.

This paragraph is the mitigation for publishing every validation status. It is
body text, not a tooltip and not a legend of coloured dots, because readers skip
chrome. If a provisional figure is ever quoted as final, this is what the
correction points back to.

---

## Summary of what the page publishes

| Section | Indicators | Built |
|---|---|---|
| §03 Compact outcomes | 4 | Yes |
| §04 Delivery channels | 3 | Yes |
| §05 Performance indicators | 6 | **No** |
| §06 Delivery status | 4 counts | **No** |
| **Total** | **13 indicators + status** | |

---

## Needs sign-off before launch

- The §02 opening sentence — the only editorial claim on the page
- The six pillar summaries in §07
- The institution role descriptions in §08
- Whether §06 blocked/delayed project counts may be published
