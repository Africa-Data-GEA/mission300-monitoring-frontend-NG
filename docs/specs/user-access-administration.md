# User Access & Administration

## Mission 300 User Access and Administration Module Specification

## A. Access Summary

These cards summarise account and permission administration. They are not performance targets.

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Users | Active users | Summary card by system role | Definition: Enabled user accounts with current access. Methodology: Count unique accounts with Active status by assigned system role. Data source: User Registry. |
| Users | Pending, inactive or suspended accounts | Split summary card | Definition: Accounts not currently active. Methodology: Count unique accounts by Pending, Inactive and Suspended status. Data source: User Registry. |
| Roles | Configured system roles | Summary card | Definition: Approved role definitions available for assignment. Methodology: Count active unique role identifiers. Data source: Role and Permission Table. |
| Security | Users with approval or administration rights | Summary card | Definition: Accounts holding elevated approval or administration permissions. Methodology: Count unique active users with Approve or Administer permission and allow drill-down for review. Data source: User assignments and Role and Permission Table. |

## B. Users

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| User registry | User account table | Searchable administrative table | Definition: Dashboard user accounts and institutional links. Methodology: Show user identifier, name, email, institution, designation, system role, status, last login and created date. Data source: User Registry. |

## C. Roles and Permissions

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Access control | Role and permission matrix | Matrix for View, Submit, Edit, Validate, Approve, Export and Administer | Definition: Actions allowed for each system role. Methodology: Store permissions independently from official job designation and apply least-privilege access. Data source: Role and Permission Table. |
| Access control | Recommended roles | Role catalogue | Definition: System Administrator, Institutional Data Provider, Data Reviewer, Validator, Dashboard Manager, Oversight User and Read-Only User roles. Methodology: Show approved permissions and module access for each configured role. Data source: Role and Permission Table. |

## D. Access Scope

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Assignments | User access scope and responsibilities | Assignment table | Definition: National, state, Distribution Company, institution, programme, project, dataset or indicator scope assigned to a user. Methodology: Link each user to one or more approved scope assignments and effective status. Data source: User Assignment Table. |

## E. Audit Log

| Pillar or Scope | Metric or Dashboard Element | Visual Type | Information Icon Content: Definition, Methodology and Data Source |
|---|---|---|---|
| Audit | User and administrative activity log | Filterable event table | Definition: Trace of uploads, edits, validation decisions, approvals, exports and administrative changes. Methodology: Record timestamp, user, action, module, record identifier, prior value where applicable, new value, result and reference. Data source: System Audit Log. |

## F. User Access and Administration Filters

Filter

Search

Institution

System role

Account status

Permission

Access scope

Module

Audit period
