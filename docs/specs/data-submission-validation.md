# Data Submission & Validation

## Mission 300 Data Submission and Validation Dashboard Specification

## A. Headline Performance Cards

Only approved or provisionally approved records may feed dashboard performance views, according to the configured validation decision.

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Target or Benchmark | Target Comparison and Progress Behaviour | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|---|---|
| Submission control | Submissions due in the reporting period | Summary card | Approved submission calendar | Compare expected submissions with the previous comparable cycle. | Definition: Datasets expected from custodians in the selected period. Methodology: Count active institution-dataset assignments whose reporting period is due. Data source: Institution assignments and submission calendar. |
| Submission control | On-time submission rate | Progress card | 100% | Compare with the previous reporting cycle. | Definition: Expected submissions received by their due dates. Methodology: Submissions received on or before due date divided by submissions due, multiplied by 100. Data source: Submission Register. |
| Validation control | Submissions pending review | Queue card | Zero submissions beyond the agreed review timeline | Compare queue size and age with the previous reporting cycle. | Definition: Submitted versions awaiting a validation decision. Methodology: Count latest submission versions with Pending Validation status and show age since submission. Data source: Submission and Validation Registers. |
| Submission control | Overdue or missing submissions | Alert card | Zero overdue or missing submissions | Compare with the previous reporting cycle and rank institutions by days overdue. | Definition: Expected submissions not received by the due date. Methodology: Count active institution-dataset-period obligations with no accepted submission by the reporting date. Data source: Submission calendar and Submission Register. |

## B. Submissions

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Submissions | Submission tracker | Table with status and version | Definition: Institutional template submissions by dataset and period. Methodology: Show submission identifier, institution, dataset, reporting period, date, submitter, template, version, file reference and current status. Data source: Submission Register. |

## C. Validation Queue

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Validation | Pending, returned, rejected and approved submissions | Tabbed validation queue | Definition: Current validation and approval position of each submission version. Methodology: Show schema-check result, reviewer, validation comments, decision date, approval status and correction link. Rejected or returned data cannot appear as confirmed performance. Data source: Validation workflow and Submission Register. |
| Validation | Validation-rule failures | Error summary and downloadable error table | Definition: Schema, field, type, period, controlled-list, duplicate, range, formula, source-reference and version errors. Methodology: Count errors by type and list affected sheet, row, field, error and required correction. Data source: Automated ingestion checks and reviewer decisions. |

## D. Overdue and Missing

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Compliance | Overdue submissions by institution and dataset | Ranked compliance table | Definition: Expected data not received by the due date. Methodology: Compare the approved submission calendar with accepted submission records and calculate days overdue. Data source: Institution assignments, submission calendar and Submission Register. |

## E. Data Gaps

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Data quality | Indicator and field data gaps | Gap register and heatmap | Definition: Required indicators, periods or fields without usable data. Methodology: Classify gaps by missing source, missing period, incomplete breakdown, failed validation or future collection. Link each gap to an owner and next action. Data source: Key Performance Indicator catalogue, submissions, validation records and data-gap register. |

## F. Data Submission and Validation Filters

Filter

Institution

Dataset

Reporting period

Submission status

Validation status

Reviewer

Readiness tier

Overdue status
