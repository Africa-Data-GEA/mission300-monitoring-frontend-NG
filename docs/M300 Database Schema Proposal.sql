-- ============================================================================
-- M300 MONITORING PLATFORM — PROPOSED DATABASE SCHEMA
-- ============================================================================
-- Built directly from the frontend's live API contract (src/api/schemas/*.ts)
-- and from what we found wrong in the current backend's real schema
-- (mission300-monitoring-backend-NG/api/database/nigeria20260903.sql) during
-- live testing on 2026-09-08/09.
--
-- Every table below exists to satisfy a field the frontend already sends or
-- expects back — nothing here is speculative. Where a table replaces or
-- fixes something broken in the current backend, that's called out in a
-- comment directly above it, referencing the issue from the combined issues
-- list (docs/M300 Combined Issues List.csv).
--
-- Engine: InnoDB, utf8mb4. MySQL 8+.
-- ============================================================================


-- ============================================================================
-- SECTION 1 — REFERENCE / LOOKUP TABLES
-- ============================================================================

-- The six Compact pillars. FIX: the current backend's routes accept a slug
-- (/pillars/generation-network) in some places and only a numeric id
-- (/pillars/3) in others, and neither table nor route agree on which is
-- canonical — this caused PD-01/KE-01 (404s) and the KPI-to-pillar
-- mismatches in the KPI catalogue. Every KPI, programme, project and
-- bottleneck below references pillar_id as an integer FK, but `slug` is a
-- real, unique, indexed column too — so a route handler can look up by
-- either without a translation layer.
CREATE TABLE pillar (
  id     TINYINT UNSIGNED PRIMARY KEY,
  slug   VARCHAR(40)  NOT NULL UNIQUE,   -- e.g. 'generation-network'
  label  VARCHAR(80)  NOT NULL           -- e.g. 'Generation & network'
) ENGINE=InnoDB;

INSERT INTO pillar (id, slug, label) VALUES
  (1, 'generation-network',            'Generation & network'),
  (2, 'last-mile-access',              'Last-mile access'),
  (3, 'financially-viable-utilities',  'Financially Viable Utilities'),
  (4, 'private-sector-participation',  'Private sector'),
  (5, 'regional-integration',          'Regional integration'),
  (6, 'clean-cooking',                 'Clean cooking');

-- FIX: the current institution table only has 3 ministries, TCN, Ikeja
-- Electric (mislabeled type='regulator') and 12 DiscOs — NERC, NISO and
-- every GenCo are missing entirely, even though KPIs, programmes and
-- datasets constantly cite them as sourceInstitution/owner. `type` is
-- expanded to cover every real actor in the sector.
CREATE TABLE institution (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id   VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. 'INST-0001'
  name        VARCHAR(160) NOT NULL,
  short_name  VARCHAR(40)  NOT NULL,
  type        ENUM('ministry','agency','regulator','transmission','genco',
                    'disco','market-operator','programme-team','partner')
              NOT NULL,
  status      ENUM('active','pending-onboarding','inactive') NOT NULL DEFAULT 'active',
  coverage    VARCHAR(120) NULL,               -- e.g. 'National', a state name
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- institution.roles[] from the contract — a real many-to-many, not a
-- free-text list.
CREATE TABLE institution_role (
  institution_id INT UNSIGNED NOT NULL,
  role           VARCHAR(80)  NOT NULL,
  PRIMARY KEY (institution_id, role),
  FOREIGN KEY (institution_id) REFERENCES institution(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 2 — KPI EXPLORER
-- ============================================================================

-- FIX: the current backend has TWO places a KPI's provenance can live —
-- kpi_definition's own provenance_* columns AND a separate kpi_provenance
-- table keyed by name-matching (fragile — this is the root cause of the
-- ATC&C "definition not found" bug). Per the agreed direction, there is
-- exactly ONE table now. kpi_definition is the single source of truth for
-- everything on a KPI's profile that isn't a value: metadata, provenance,
-- and the single primary baseline/target. updateKpiMetadataRequestSchema
-- writes every column on this table in one PATCH.
CREATE TABLE kpi_definition (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id               VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. 'M300-P1-004' — THE id the frontend calls with
  short_code              VARCHAR(40)  NULL,
  name                    VARCHAR(160) NOT NULL,
  pillar_id               TINYINT UNSIGNED NOT NULL,
  category                VARCHAR(40)  NOT NULL,          -- Outcome / Output / Impact / Input / System Performance / Financial / Pipeline / Investment
  unit                    VARCHAR(20)  NOT NULL,
  definition              TEXT NOT NULL,
  formula                 TEXT NOT NULL,
  aggregation             VARCHAR(40)  NOT NULL,          -- latest / sum / average
  frequency               VARCHAR(40)  NOT NULL,
  disaggregation          VARCHAR(80)  NULL,
  limitations             TEXT NULL,
  direction               ENUM('higher-is-better','lower-is-better') NOT NULL,
  readiness               ENUM('core','supporting','future') NOT NULL,

  source_institution_id   INT UNSIGNED NULL,
  source_dataset_id       INT UNSIGNED NULL,               -- FK -> dataset.id, once assigned
  source_reference        VARCHAR(160) NULL,                -- e.g. 'NERC Quarterly Reports'

  -- Primary baseline/target (single point, always rendered). Periodic
  -- checkpoints toward it live in kpi_target below.
  baseline                DECIMAL(18,4) NULL,
  baseline_label          VARCHAR(160)  NULL,
  target                  DECIMAL(18,4) NULL,
  target_label            VARCHAR(160)  NULL,
  target_basis            ENUM('level','growth-rate','none') NOT NULL DEFAULT 'none',
  target_basis_label      VARCHAR(80)   NULL,
  target_date             VARCHAR(20)   NULL,               -- e.g. '2030' — deliberately a label, not a real date

  -- Provenance (the four fields behind every info icon).
  provenance_definition   TEXT NOT NULL,
  provenance_methodology  TEXT NOT NULL,
  provenance_source       VARCHAR(160) NOT NULL,
  provenance_last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  active                  TINYINT(1) NOT NULL DEFAULT 1,    -- retire, never delete — see setKpiActiveRequestSchema
  version                 VARCHAR(10) NOT NULL DEFAULT '1.0',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (pillar_id) REFERENCES pillar(id),
  FOREIGN KEY (source_institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;

-- kpiTargetPointSchema / kpiProfileSchema.targets[] — interim checkpoints
-- on the way to the primary target above (e.g. 2026/2028/2030 milestones).
-- This is NEW: the current backend has no equivalent at all.
CREATE TABLE kpi_target (
  id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kpi_id  INT UNSIGNED NOT NULL,
  period  VARCHAR(20)   NOT NULL,       -- e.g. '2026' or 'Q2 2026'
  value   DECIMAL(18,4) NOT NULL,
  label   VARCHAR(160)  NOT NULL,
  FOREIGN KEY (kpi_id) REFERENCES kpi_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- FIX: this is the real values table (was `metric_observation`, currently
-- filled with random placeholder numbers unrelated to the KPI's actual
-- possible range — e.g. ATC&C Loss Rate showing 961%). A value only ever
-- enters this table as the side effect of an APPROVED submission being
-- published (see submission_kpi_extraction below) — never typed in
-- directly — so every row is traceable to who submitted it.
-- FIX: always query this ORDER BY period — the current backend returns
-- kpi history in insertion order, not chronological order.
CREATE TABLE kpi_observation (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kpi_id            INT UNSIGNED NOT NULL,
  period             VARCHAR(20)   NOT NULL,        -- e.g. 'Q3 2026'
  period_sort_key    DATE NOT NULL,                  -- always populated so ORDER BY is real, not string-sorted
  value              DECIMAL(18,4) NOT NULL,
  validation_status  ENUM('confirmed','public-source','requires-validation','provisional','future') NOT NULL,
  submission_id      INT UNSIGNED NULL,              -- FK -> submission.id; null only for pre-migration seed rows
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kpi_id) REFERENCES kpi_definition(id) ON DELETE CASCADE,
  UNIQUE KEY uq_kpi_period (kpi_id, period)          -- one published value per KPI per period
) ENGINE=InnoDB;

-- linkedRecordSchema — a delivery record (programme/project/milestone/action)
-- a KPI is linked to, for the KPI profile's "linked records" panel.
CREATE TABLE kpi_linked_record (
  kpi_id       INT UNSIGNED NOT NULL,
  record_type  ENUM('programme','project','milestone','action') NOT NULL,
  record_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (kpi_id, record_type, record_id),
  FOREIGN KEY (kpi_id) REFERENCES kpi_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 3 — DATA SUBMISSIONS & VALIDATION
-- ============================================================================

-- FIX: currently `Obligation.dataset` is a free-text label matched by
-- convention against nothing — there is no real dataset entity at all.
CREATE TABLE dataset (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id           VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. 'DS-0007'
  name                VARCHAR(160) NOT NULL,
  purpose             TEXT NOT NULL,
  pillar_id           TINYINT UNSIGNED NOT NULL,
  frequency           VARCHAR(40)  NOT NULL,
  owner_institution_id INT UNSIGNED NOT NULL,
  FOREIGN KEY (pillar_id) REFERENCES pillar(id),
  FOREIGN KEY (owner_institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;

-- dataset.requiredDataPoints[]
CREATE TABLE dataset_required_field (
  dataset_id INT UNSIGNED NOT NULL,
  label      VARCHAR(160) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (dataset_id, label),
  FOREIGN KEY (dataset_id) REFERENCES dataset(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- One template per dataset (was one shared template for everything).
CREATE TABLE submission_template (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dataset_id    INT UNSIGNED NOT NULL,
  version        VARCHAR(10)  NOT NULL,
  file_name      VARCHAR(160) NOT NULL,
  download_url   VARCHAR(255) NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES dataset(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- FIX: obligation.dataset_id is a real FK now, not a name match.
CREATE TABLE obligation (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id            VARCHAR(20)  NOT NULL UNIQUE,     -- e.g. 'OBL-0000000008'
  institution_id       INT UNSIGNED NOT NULL,
  focal_person         VARCHAR(120) NULL,
  dataset_id           INT UNSIGNED NOT NULL,
  reporting_period      VARCHAR(20)  NOT NULL,
  frequency             VARCHAR(40)  NOT NULL,
  due_date              DATE NOT NULL,
  status                ENUM('not-started','in-progress','submitted','under-review',
                              'returned','accepted','overdue') NOT NULL DEFAULT 'not-started',
  template_id           INT UNSIGNED NULL,
  accepted_submission_id INT UNSIGNED NULL,               -- FK -> submission.id, set once accepted
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  FOREIGN KEY (dataset_id) REFERENCES dataset(id),
  FOREIGN KEY (template_id) REFERENCES submission_template(id)
) ENGINE=InnoDB;

CREATE TABLE submission (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id          VARCHAR(20)  NOT NULL UNIQUE,
  obligation_id      INT UNSIGNED NULL,
  institution_id     INT UNSIGNED NOT NULL,
  dataset_id         INT UNSIGNED NOT NULL,
  reporting_period    VARCHAR(20)  NOT NULL,
  method              ENUM('manual-entry','file-upload') NOT NULL,
  version             INT UNSIGNED NOT NULL DEFAULT 1,
  submitted_by        VARCHAR(120) NOT NULL,
  submitted_at        TIMESTAMP NULL,
  status              ENUM('draft','submitted','under-review','returned',
                            'provisional','approved','rejected') NOT NULL DEFAULT 'draft',
  source_reference     VARCHAR(160) NULL,
  notes                TEXT NULL,
  file_name            VARCHAR(160) NULL,
  reviewer_id          INT UNSIGNED NULL,
  FOREIGN KEY (obligation_id) REFERENCES obligation(id),
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  FOREIGN KEY (dataset_id) REFERENCES dataset(id)
) ENGINE=InnoDB;

CREATE TABLE submission_status_history (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id  INT UNSIGNED NOT NULL,
  status         VARCHAR(40)  NULL,
  actor          VARCHAR(120) NOT NULL,
  occurred_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment        TEXT NULL,
  FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE submission_validation_issue (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id       INT UNSIGNED NOT NULL,
  type                VARCHAR(60)  NOT NULL,
  location             VARCHAR(120) NOT NULL,
  field                VARCHAR(80)  NOT NULL,
  message              VARCHAR(255) NOT NULL,
  required_correction   VARCHAR(255) NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- What a submission publishes if approved — this is the ONLY thing allowed
-- to write into kpi_observation. Row is written at submission time
-- (status='pending') and only actually copied into kpi_observation once
-- decision = approved/provisional.
CREATE TABLE submission_kpi_extraction (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id     INT UNSIGNED NOT NULL,
  kpi_id            INT UNSIGNED NOT NULL,
  reporting_period   VARCHAR(20) NOT NULL,
  value              DECIMAL(18,4) NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
  FOREIGN KEY (kpi_id) REFERENCES kpi_definition(id)
) ENGINE=InnoDB;

-- FIX: currently only 2 of 10+ datasets have a custodian assigned at all.
CREATE TABLE custodian_assignment (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dataset_id      INT UNSIGNED NOT NULL,
  custodian_institution_id INT UNSIGNED NOT NULL,
  focal_person    VARCHAR(120) NULL,
  frequency       VARCHAR(40)  NULL,
  template_id     INT UNSIGNED NULL,
  reviewer        VARCHAR(120) NULL,
  validator       VARCHAR(120) NULL,
  status          ENUM('active','pending') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (dataset_id) REFERENCES dataset(id) ON DELETE CASCADE,
  FOREIGN KEY (custodian_institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 4 — PROGRAMMES, PROJECTS, MILESTONES
-- ============================================================================

-- FIX: currently every one of the 3 seeded programmes has a lead institution
-- with no relationship to the programme's subject (a grid programme led by
-- the Ministry of Health), and one record is a literal placeholder
-- ("Example Programme") counted in the live headline stats. This schema
-- doesn't prevent bad data entry by itself, but FKs to real institution
-- rows at least make the mismatch checkable/queryable, and there should be
-- an application-level rule that a programme's lead_institution must carry
-- a role relevant to its pillar before going live.
CREATE TABLE programme (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id          VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. 'PRG-0001'
  name               VARCHAR(160) NOT NULL,
  lead_institution_id INT UNSIGNED NOT NULL,
  pillar_id          TINYINT UNSIGNED NOT NULL,
  objectives         TEXT NOT NULL,
  financing          VARCHAR(160) NULL,
  status             ENUM('on-track','at-risk','delayed','blocked','completed') NOT NULL,
  priority           ENUM('priority','standard') NOT NULL DEFAULT 'standard',
  start_date         DATE NOT NULL,
  end_date           DATE NOT NULL,
  bottleneck_category ENUM('financing','procurement','permitting','regulatory-approval',
                            'coordination','technical-constraint','implementation-delay',
                            'data-or-reporting') NULL,
  validation_status  ENUM('confirmed','public-source','requires-validation','provisional','future') NOT NULL,
  last_update        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_institution_id) REFERENCES institution(id),
  FOREIGN KEY (pillar_id) REFERENCES pillar(id)
) ENGINE=InnoDB;

-- FIX: supportingInstitution was a single free-text column — now a proper
-- many-to-many, matching supportingInstitutions[] on the contract.
CREATE TABLE programme_supporting_institution (
  programme_id   INT UNSIGNED NOT NULL,
  institution_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (programme_id, institution_id),
  FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE,
  FOREIGN KEY (institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;

CREATE TABLE project (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id           VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. 'PRJ-0000000003'
  name                VARCHAR(160) NOT NULL,
  programme_id        INT UNSIGNED NOT NULL,
  owner_institution_id INT UNSIGNED NOT NULL,
  lead_name           VARCHAR(120) NOT NULL,
  location            VARCHAR(160) NOT NULL,
  latitude             DECIMAL(9,6) NULL,
  longitude            DECIMAL(9,6) NULL,
  coverage             VARCHAR(80)  NOT NULL,
  pillar_id            TINYINT UNSIGNED NOT NULL,       -- can differ from programme's pillar
  lifecycle_stage      ENUM('identification','design','procurement','implementation',
                             'commissioning','operations') NOT NULL,
  program_type         ENUM('grant','concessional-loan','ppp','government-funded','blended-finance') NOT NULL,
  funding_source       VARCHAR(160) NULL,
  funding_structure    VARCHAR(160) NOT NULL,
  funding_status       ENUM('committed','disbursing','fully-disbursed','at-risk','unfunded') NOT NULL,
  pipeline_readiness   ENUM('pipeline','feasibility-study','investment-ready') NULL,
  projected_status     ENUM('on-track','at-risk','delayed','blocked','completed') NOT NULL,
  current_status       ENUM('on-track','at-risk','delayed','blocked','completed') NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  evidence_url         VARCHAR(255) NULL,
  bottleneck_category  ENUM('financing','procurement','permitting','regulatory-approval',
                             'coordination','technical-constraint','implementation-delay',
                             'data-or-reporting') NULL,
  comment              TEXT NULL,
  suggestion           TEXT NULL,
  validation_status    ENUM('confirmed','public-source','requires-validation','provisional','future') NOT NULL,
  description           TEXT NOT NULL,
  budget_usd            DECIMAL(18,2) NOT NULL DEFAULT 0,
  disbursed_usd          DECIMAL(18,2) NOT NULL DEFAULT 0,
  contractor             VARCHAR(160) NULL,
  contact_name            VARCHAR(120) NOT NULL,
  contact_email           VARCHAR(160) NOT NULL,
  FOREIGN KEY (programme_id) REFERENCES programme(id),
  FOREIGN KEY (owner_institution_id) REFERENCES institution(id),
  FOREIGN KEY (pillar_id) REFERENCES pillar(id)
) ENGINE=InnoDB;

CREATE TABLE project_document (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  label      VARCHAR(160) NOT NULL,
  url        VARCHAR(255) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE project_update (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  occurred_on DATE NOT NULL,
  note        TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- statusHistoryEntrySchema (projects) — trajectory across reporting cycles.
CREATE TABLE project_status_history (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  period     VARCHAR(20) NOT NULL,
  status     ENUM('on-track','at-risk','delayed','blocked','completed') NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE milestone (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id           VARCHAR(20)  NOT NULL UNIQUE,
  name                VARCHAR(160) NOT NULL,
  project_id          INT UNSIGNED NOT NULL,
  priority            ENUM('priority','standard') NOT NULL DEFAULT 'standard',
  expected_date        DATE NOT NULL,
  actual_date          DATE NULL,
  status               ENUM('on-track','at-risk','delayed','blocked','completed') NOT NULL,
  lead_institution_id   INT UNSIGNED NOT NULL,
  evidence_url          VARCHAR(255) NULL,
  risk                  TEXT NULL,
  next_action           TEXT NULL,
  bottleneck_category   ENUM('financing','procurement','permitting','regulatory-approval',
                              'coordination','technical-constraint','implementation-delay',
                              'data-or-reporting') NULL,
  validation_status     ENUM('confirmed','public-source','requires-validation','provisional','future') NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 5 — BOTTLENECKS & ESCALATIONS
-- ============================================================================

CREATE TABLE bottleneck (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id         VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. 'BTN-2025-004'
  issue             VARCHAR(255) NOT NULL,
  category          ENUM('financing','procurement','permitting','regulatory-approval',
                          'coordination','technical-constraint','implementation-delay',
                          'data-or-reporting') NOT NULL,
  severity          ENUM('critical','high','medium','low') NOT NULL,
  pillar_id         TINYINT UNSIGNED NOT NULL,
  linked_record_type ENUM('programme','project','milestone','kpi') NULL,
  linked_record_id   INT UNSIGNED NULL,
  institution_id     INT UNSIGNED NOT NULL,
  date_raised         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  follow_up            TEXT NULL,
  escalation_status    ENUM('not-escalated','escalated','overdue','resolved') NOT NULL DEFAULT 'not-escalated',
  status               ENUM('open','in-progress','blocked','escalated','resolved') NOT NULL DEFAULT 'open',
  lifecycle_stage      ENUM('identification','design','procurement','implementation',
                             'commissioning','operations') NOT NULL,
  FOREIGN KEY (pillar_id) REFERENCES pillar(id),
  FOREIGN KEY (institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;

-- bottleneckStatusHistoryEntrySchema — appended by the backend as a side
-- effect whenever PATCH /bottlenecks/:id actually changes `status`, never
-- written directly by the client. This table did not exist at all before —
-- there was no way to change a bottleneck's status once raised.
CREATE TABLE bottleneck_status_history (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bottleneck_id  INT UNSIGNED NOT NULL,
  period         VARCHAR(20) NOT NULL,
  status         ENUM('open','in-progress','blocked','escalated','resolved') NOT NULL,
  changed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bottleneck_id) REFERENCES bottleneck(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE escalation (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id          VARCHAR(20) NOT NULL UNIQUE,
  bottleneck_id      INT UNSIGNED NOT NULL,
  decision_required   TEXT NOT NULL,
  level                ENUM('programme-management','institution-leadership',
                             'steering-committee','ministerial') NOT NULL,
  owner                VARCHAR(120) NOT NULL,
  due_date              DATE NOT NULL,
  status                ENUM('not-escalated','escalated','overdue','resolved') NOT NULL,
  resolution            TEXT NULL,
  evidence_url          VARCHAR(255) NULL,
  FOREIGN KEY (bottleneck_id) REFERENCES bottleneck(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 6 — STATE / DISCO / GENCO PERFORMANCE DATA
-- ============================================================================
-- Kept close to the current backend's real tables (these are fine
-- structurally — they're genuinely NERC-sourced, monthly-native for DisCos,
-- annual-native for GenCo installed capacity). Two fixes applied:
--   1. disco_* tables reference institution_id, not a free-text DisCo name.
--   2. genco_installed_capacity gets a month/date column to match
--      genco_average_available_capacity — it was annual-only before, which
--      silently breaks any month-level query against it.

CREATE TABLE state (
  id   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  zone VARCHAR(40) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE disco_energy_received (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,   -- FK -> institution (type = 'disco')
  period_month    DATE NOT NULL,           -- first-of-month
  energy_received_gwh DECIMAL(14,3) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

CREATE TABLE disco_energy_billed (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,
  period_month    DATE NOT NULL,
  energy_billed_gwh DECIMAL(14,3) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

CREATE TABLE disco_revenue_billed (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,
  period_month    DATE NOT NULL,
  revenue_billed_naira DECIMAL(18,2) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

CREATE TABLE disco_revenue_collected (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,
  period_month    DATE NOT NULL,
  revenue_collected_naira DECIMAL(18,2) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

CREATE TABLE disco_metering (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id      INT UNSIGNED NOT NULL,
  end_of_quarter       DATE NOT NULL,
  active_customers      INT UNSIGNED NOT NULL,
  metered_customers     INT UNSIGNED NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, end_of_quarter)
) ENGINE=InnoDB;

CREATE TABLE disco_allowed_tariff (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,
  period_month    DATE NOT NULL,
  allowed_tariff_naira_per_kwh DECIMAL(10,4) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

-- FIX: previously annual-only (no month column) — now consistent with
-- genco_average_available_capacity below.
CREATE TABLE genco_installed_capacity (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,   -- FK -> institution (type = 'genco')
  period_month    DATE NOT NULL,
  installed_mw    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;

CREATE TABLE genco_average_available_capacity (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NOT NULL,
  period_month    DATE NOT NULL,
  available_mw    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (institution_id) REFERENCES institution(id),
  UNIQUE KEY uq (institution_id, period_month)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 7 — ADMINISTRATION (USERS, ROLES, AUDIT)
-- ============================================================================

CREATE TABLE user_account (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id       VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. 'usr-001'
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  institution_id  INT UNSIGNED NULL,
  designation     VARCHAR(120) NULL,
  role            ENUM('system-administrator','institutional-data-provider','data-reviewer',
                        'validator','dashboard-manager','oversight-user','read-only-user') NOT NULL,
  status          ENUM('active','pending','inactive','suspended') NOT NULL DEFAULT 'pending',
  last_login      TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institution(id)
) ENGINE=InnoDB;

-- The role x permission matrix — static reference data, seeded once from
-- the specification, not user-editable.
CREATE TABLE role_permission (
  role       ENUM('system-administrator','institutional-data-provider','data-reviewer',
                   'validator','dashboard-manager','oversight-user','read-only-user') NOT NULL,
  permission ENUM('view','submit','edit','validate','approve','export','administer') NOT NULL,
  PRIMARY KEY (role, permission)
) ENGINE=InnoDB;

CREATE TABLE scope_assignment (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  level           ENUM('national','state','distribution-company','institution',
                        'programme','project','dataset','indicator') NOT NULL,
  scope_label     VARCHAR(160) NOT NULL,   -- e.g. 'Ikeja DisCo'
  responsibility  VARCHAR(255) NULL,
  effective_from  DATE NOT NULL,
  effective_to    DATE NULL,
  active          TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_log (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  occurred_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id      INT UNSIGNED NOT NULL,
  action       VARCHAR(160) NOT NULL,
  module       VARCHAR(80)  NOT NULL,
  record_id    VARCHAR(40)  NULL,
  prior_value  TEXT NULL,
  new_value    TEXT NULL,
  result       ENUM('success','failure','rejected') NOT NULL DEFAULT 'success',
  reference    VARCHAR(80)  NULL,
  FOREIGN KEY (user_id) REFERENCES user_account(id),
  INDEX ix_module_time (module, occurred_at)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 8 — BRANDING (SINGLE-ROW CONFIG)
-- ============================================================================

CREATE TABLE brand_config (
  id              TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,  -- always row 1 — single active config
  country_name    VARCHAR(80) NOT NULL,
  primary_color   CHAR(7) NOT NULL,
  secondary_color CHAR(7) NOT NULL,
  text_color      CHAR(7) NOT NULL,
  sidebar_color   CHAR(7) NOT NULL,
  logo_url        VARCHAR(255) NOT NULL,
  font_h1         VARCHAR(80) NOT NULL,
  font_h2         VARCHAR(80) NOT NULL,
  font_h3         VARCHAR(80) NOT NULL,
  font_h4         VARCHAR(80) NOT NULL,
  font_h5         VARCHAR(80) NOT NULL,
  font_h6         VARCHAR(80) NOT NULL,
  font_body       VARCHAR(80) NOT NULL,
  currency_code   CHAR(3) NOT NULL,
  currency_symbol VARCHAR(4) NOT NULL,
  currency_locale VARCHAR(10) NOT NULL,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_single_row CHECK (id = 1)
) ENGINE=InnoDB;


-- ============================================================================
-- SECTION 9 — REPORTS & EXPORTS
-- ============================================================================

CREATE TABLE report_catalogue (
  report_type ENUM('compact-progress','compact-review','pillar-performance','kpi-indicator',
                    'state-disco','implementation','bottleneck','financial',
                    'submission-compliance','data-quality') PRIMARY KEY,
  category    ENUM('compact','performance','delivery','data-governance') NOT NULL,
  title       VARCHAR(160) NOT NULL,
  definition  TEXT NOT NULL,
  methodology TEXT NOT NULL,
  data_source VARCHAR(160) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE saved_report (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id              VARCHAR(20)  NOT NULL UNIQUE,
  report_type            VARCHAR(40)  NOT NULL,
  title                  VARCHAR(160) NOT NULL,
  owner_user_id          INT UNSIGNED NOT NULL,
  validation_status_label VARCHAR(80) NOT NULL,
  version                INT UNSIGNED NOT NULL DEFAULT 1,
  format                 ENUM('pdf','xlsx') NOT NULL,
  file_reference          VARCHAR(255) NOT NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_generated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  config_json              JSON NOT NULL,   -- the full reportConfigSchema payload used to generate it
  FOREIGN KEY (owner_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB;


-- ============================================================================
-- NOTES FOR THE BACKEND DEVELOPER
-- ============================================================================
-- 1. Route params should resolve pillar/KPI identifiers by whichever the
--    frontend sends — pillar.slug or kpi_definition.public_id — never a
--    bare numeric id alone. Both are unique+indexed for this reason.
-- 2. kpi_observation is written to ONLY when a submission is approved
--    (via submission_kpi_extraction) — never by a direct "edit value" form.
--    kpi_definition is edited directly, through the KPI metadata PATCH.
-- 3. bottleneck_status_history / project_status_history / kpi_target rows
--    are appended by the server as a side effect of a status/target change
--    — the client never writes to these tables directly.
-- 4. Every *_id foreign key above should be enforced (ON DELETE RESTRICT by
--    default, CASCADE only where shown) — the current backend's programme/
--    genco/disco tables use free-text names with no FK at all, which is how
--    "Ministry of Health leads a grid reinforcement programme" got into
--    production undetected.
-- 5. See docs/API.md for the full JSON shape each endpoint must return —
--    this schema is designed to make every field in that contract a direct
--    column or join, not a computed guess.
