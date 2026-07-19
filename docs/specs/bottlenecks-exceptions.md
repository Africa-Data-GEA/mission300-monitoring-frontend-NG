# Bottlenecks & Exceptions

## Mission 300 Bottlenecks and Exceptions Dashboard Specification

## A. Headline Performance Cards

## Operational benchmarks are limited to the four headline exception cards.

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Target or Benchmark | Target Comparison and Progress Behaviour | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|---|---|
| Exceptions | Open high or critical bottlenecks | Alert card | Zero unresolved high or critical bottlenecks | Compare with the previous reporting cycle and show median days open. | Definition: Open bottlenecks classified High or Critical. Methodology: Count unique unresolved bottleneck records at the selected severities. Data source: Bottleneck Register. |
| Exceptions | Delayed priority records | Alert card | Zero delayed priority records | Compare with the previous reporting cycle and show average days overdue. | Definition: Priority implementation records currently delayed. Methodology: Count unique priority records with Delayed status. Data source: Implementation Register. |
| Exceptions | Blocked priority records | Alert card | Zero blocked priority records | Compare with the previous reporting cycle and show affected pillars. | Definition: Priority records that cannot progress because of an unresolved dependency or constraint. Methodology: Count unique priority records with Blocked status. Data source: Implementation Register and Bottleneck Register. |
| Escalations | Overdue escalations or decisions | Alert card | Zero overdue escalation actions or decisions | Compare with the previous reporting cycle and show the oldest unresolved item. | Definition: Escalation actions or leadership decisions past their due date. Methodology: Count unresolved escalation records whose due date is earlier than the reporting date. Data source: Bottleneck Register and escalation tracker. |

## B. All Bottlenecks

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Bottlenecks | Bottleneck register | Searchable table | Definition: Structured record of delivery constraints and exceptions. Methodology: Show identifier, issue, category, severity, affected pillar, indicator, programme or project, responsible institution, date raised, age, follow-up, escalation and status. Data source: Bottleneck Register and linked Implementation Register records. |

## C. By Category and Lifecycle Stage

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Analysis | Bottlenecks by category | Horizontal bars | Definition: Distribution of open bottlenecks by approved category. Methodology: Count unique open records by category such as financing, procurement, permitting, regulatory approval, coordination, technical constraint, implementation delay, data or reporting. Data source: Bottleneck Register. |
| Analysis | Bottlenecks by lifecycle stage | Stacked bars by severity | Definition: Open constraints by delivery stage. Methodology: Count unique open bottlenecks by the linked register record's current lifecycle stage and severity. Data source: Bottleneck Register linked to Implementation Register. |

## D. By Agency

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Accountability | Open bottlenecks by responsible institution | Ranked bars with exception table | Definition: Open bottlenecks assigned to each responsible institution. Methodology: Count unique open records by responsible institution and show high or critical records first. Data source: Bottleneck Register and Institution Registry. |

## E. Escalations

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Escalation | Escalation tracker | Decision and action table | Definition: Issues escalated for management or leadership action. Methodology: Show decision required, escalation level, owner, due date, days overdue, current status, resolution and evidence. Data source: Bottleneck Register and escalation tracker. |

## F. Bottlenecks and Exceptions Filters

Filter

Severity

Category

Institution

Compact pillar

Programme or project

Lifecycle stage

Escalation status

Validation status

Reporting period
