# Mission 300 Nigeria — Theory of Change

**Prepared:** 27 August 2026
**Purpose:** State the causal logic connecting what this platform tracks to Nigeria's National Energy Compact goal, in response to SEforALL's MRL guidance note (§1, "Results framework and national scope" — Partial Gap). This is a documentation exercise over data the platform already holds. It does not propose any change to the five-pillar structure, and no schema or code changes are implied by it.

---

## 1. The chain

```
IMPACT     Nigerians have reliable electricity and clean cooking access
               ↑
OUTCOME    Electricity access rate  ·  Clean cooking access rate
           ATC&C losses ↓  ·  Metering rate ↑  ·  Market remittance ↑
           Renewable generation share ↑  ·  Tariff shortfall ↓
               ↑
OUTPUT     New grid connections  ·  Mini-grid connections  ·  SHS deployed
           Improved cookstoves distributed
               ↑
ACTIVITY   Programmes → Projects → Milestones, delivered by DisCos, REA,
           TCN, NISO and private developers under the six Compact pillars
               ↑
INPUT      Public and private capital mobilised for last-mile access and
           generation & network investment
```

Each level exists to answer a different question a reader of this platform actually asks: *what did we spend* (Input), *what did we do* (Activity), *what did that produce* (Output), *did it change the underlying condition* (Outcome), and *did Nigerians' lives change* (Impact). The platform today organises everything by **pillar** — a sector grouping — which sits orthogonally to this chain: every pillar contains work at several of these levels at once.

---

## 2. What sits at each level, by name

| Level | Indicator / record | Where it lives today |
|---|---|---|
| **Impact** | People with electricity access; Clean cooking access | Executive Overview headline cards |
| **Outcome** | Electricity access rate; Clean cooking access rate; ATC&C Loss Rate; Metering Rate; DisCo Remittance to NBET/GenCos; Renewable Energy Share in Generation Mix; Subsidy/Tariff Shortfall | Executive Overview headline cards + National Performance panel; KPI Explorer (`M300-P3-004`, `M300-P3-006`, `M300-P3-009`, `M300-P1-004`, `M300-P3-010`) |
| **Output** | New Grid Connections (Annual); Mini-Grid Customer Connections; Solar Home Systems Deployed; Improved Cookstoves Distributed | Executive Overview "Access delivery by channel"; KPI Explorer (`M300-P2-001`, `M300-P2-003`, `M300-P2-006`, `M300-P2-011`) |
| **Activity** | Programmes, Projects, Milestones — tagged to the six Compact pillars | Programmes → Projects module |
| **Input** | Private Capital Mobilised for Last-Mile Access; development-partner funding | KPI Explorer (`M300-P4-002`, `M300-PX-002`) |

The Impact-level composites (137.3M people, 26% clean cooking access) are hand-blended figures — each carries `kpiId: null`, meaning no single KPI Explorer profile currently backs the number. This is the concrete form of the "results-level linkage" gap SEforALL's note identifies: the platform states the top of the chain and the middle of the chain, but nothing today formally declares that *these specific outputs* produced *that specific outcome number*.

---

## 3. The causal claims, stated explicitly

This is the part a results framework requires and the platform doesn't yet assert anywhere:

- New Grid Connections + Mini-Grid Connections + Solar Home Systems Deployed → **jointly produce** the Electricity access rate outcome, which **rolls up into** People with electricity access (Impact).
- Improved Cookstoves Distributed → **produces** the Clean cooking access rate outcome, which **rolls up into** Clean cooking access (Impact).
- Metering Rate ↑ and ATC&C Loss Rate ↓ → **jointly produce** DisCo financial viability, which is the precondition for DisCo Remittance ↑ and Tariff Shortfall ↓ — the financially-viable-utilities pillar's own internal causal chain.
- Private Capital Mobilised (Input) → **funds** Programmes and Projects (Activity) tagged `private-sector-participation`, which in turn **produce** outputs under whichever pillar each funded project targets.
- Renewable Energy Share (Outcome) sits partly outside this chain — it is generation-mix composition, not a downstream product of the last-mile access outputs above it. It answers "is the grid getting cleaner," a parallel outcome under `generation-network`, not a rung on the electrification ladder.

## 4. Where the platform is already ahead of this document

Two KPIs already exist as a working pilot of exactly the discipline SEforALL's guidance asks for at the beneficiary level:

- **`M300-P2-024` — People Connected to Electricity (Canonical)**: counts a person once, only from a Tier 1+ (Multi-Tier Framework) connection made after the Compact tracking start, deduplicated per household even across reconnection or upgrade.
- **`M300-P2-025` — Clean Cooking, Verified Beneficiary Households (Canonical)**: counts a household once, at its single best-recorded cooking category, collapsing stove-stacking rather than double-counting.

Both are backed by a real beneficiary-event ledger (`mocks/data/beneficiary-events.ts`), explicitly labelled pilot-scale and `requires-validation` — they do not yet replace the Impact-level composite figures above, which remain the reported numbers until beneficiary data reaches national submission volume. They are the same pattern already applied to Private Capital (`M300-P4-002`), which is itself backed by a transaction-level ledger rather than a single blended figure.

This means the *mechanism* SEforALL is asking for — output-level records with dedup and eligibility rules, feeding a canonical count — is not a gap to be designed from nothing. It is a pattern already proven twice, that the two new headline composites (people-with-access, clean-cooking-access) have not yet been switched onto.

## 5. Assumptions and risks carried by this chain

- A connection event (grid, mini-grid, or SHS) is assumed to result in *sustained* access, not just installation — this platform does not currently re-verify a connection stays active in later periods.
- The Impact-level access rate is drawn from independent survey data (World Bank/SDG7), not derived from summing connection outputs — the two are expected to move together but are not mathematically tied, and a persistent divergence between them is itself a signal worth watching, not a data error to reconcile away.
- DisCo-reported figures (metering, remittance, ATC&C) are taken as submitted pending the validation workflow; the causal claims above assume that workflow catches material misreporting before a figure reaches the outcome level.
- Renewable Energy Share currently reports hydro generation only (solar/wind not yet consistently reported) — the outcome figure understates true renewable share until that gap closes, independent of the generation-share/capacity-share distinction being resolved separately.

## 6. What this document does not do

It does not add a `resultsLevel` field to any KPI record, does not add a `contributesToKpiId` link, and does not add a `kpiId` reference to the Project record — those are the concrete, additive schema changes this document exists to inform, proposed as Phase 2 once the chain above is agreed. No existing figure, pillar grouping, or reporting period is changed by this document.
