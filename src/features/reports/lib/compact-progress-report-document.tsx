import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CompactProgressReportData } from './compact-progress-report-data'
import { actionsParagraphs, keyTargetParagraphs, shortLabel } from './compact-progress-report-text'
import './pdf-fonts'

/**
 * A bespoke, fixed-layout PDF matching the real Mission 300 Compact Progress
 * Report's design and structure (see `public/nigeria_mission-300_compact-
 * progress-report_q12026.pdf`, the reference this was built against): a 16:9
 * slide deck with large type, a written paragraph beside each table, and
 * tables that fill their slide. Populated with this app's own data rather
 * than that document's point-in-time content. See
 * `compact-progress-report-data.ts` for what backs each page and why
 * Programmes stand in for "Reform Actions".
 *
 * Deliberately NOT the generic `ReportDocument` (report-document.tsx): this
 * layout isn't filterable and isn't built from generic tabular sections.
 * Reached only from the fixed "Compact Progress Report" quick-export card,
 * never the configurable builder — see `use-compact-exports-page.ts`.
 */

const SLIDE: [number, number] = [960, 540]
const NAVY = '#002036'
const BLUE = '#065a89'
const GOLD = '#ffb800'
const CREAM = '#fdf3d8'
const TEXT_MUTED = '#5b6472'
const ASSET_BASE = '/reports/compact-progress'

const STATUS_COLORS: Record<string, string> = {
  'Not yet due': '#5b6472',
  'In progress, on track': '#00764a',
  'In progress, minor delays': '#8f5605',
  'In progress, at risk': '#b85c00',
  Delayed: '#a8201a',
  Completed: '#00764a',
}

const BOLD = { fontFamily: 'Google Sans', fontWeight: 700 } as const

const styles = StyleSheet.create({
  pageHeader: { fontSize: 9, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  pageFooter: {
    position: 'absolute',
    bottom: 14,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: TEXT_MUTED,
  },
  h1Row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  h1Dot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#7cb928' },
  h1: { fontSize: 28, ...BOLD, color: BLUE },

  coverPage: { padding: 0, flexDirection: 'row' },
  coverLeft: { width: '47%', backgroundColor: NAVY, color: '#ffffff', padding: 40, justifyContent: 'space-between' },
  coverRight: { width: '53%' },
  coverLogosRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  coverTitle: { fontSize: 36, ...BOLD, color: GOLD, lineHeight: 1.12, marginTop: 20 },
  coverSubtitle: { fontSize: 14, ...BOLD, color: '#ffffff', marginTop: 10 },
  coverFlagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  coverCountry: { fontSize: 16, ...BOLD, color: '#ffffff' },
  coverDate: { fontSize: 12, ...BOLD, color: GOLD, marginTop: 16 },
  coverDisclaimer: { fontSize: 10, lineHeight: 1.4, color: '#dbe4ea', marginTop: 8 },
  coverPartnersLabel: {
    fontSize: 10,
    color: '#9fb3c2',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverPartnerLogos: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  externalUseBadge: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalUseText: { fontSize: 9, ...BOLD, color: NAVY, textAlign: 'center', lineHeight: 1.2 },

  contentPage: { padding: 36, paddingBottom: 34, fontFamily: 'Google Sans', fontSize: 13, color: '#1a1f29' },
  twoCol: { flexDirection: 'row', gap: 18 },
  navyBox: { backgroundColor: BLUE, padding: 18, borderRadius: 4 },
  goldBorderBox: { borderWidth: 1.5, borderColor: GOLD, padding: 14, borderRadius: 4 },
  boxTitle: { fontSize: 14, ...BOLD, marginBottom: 10, color: GOLD },
  boxTitleBlue: { fontSize: 14, ...BOLD, marginBottom: 8, color: BLUE },
  bodyText: { fontSize: 11, lineHeight: 1.4 },
  bodyTextLight: { fontSize: 11.5, lineHeight: 1.45, color: '#ffffff', marginBottom: 8 },
  bodyLarge: { fontSize: 13, lineHeight: 1.45, marginBottom: 10 },
  subheading: { fontSize: 12, ...BOLD, color: BLUE, marginBottom: 4 },
  legendRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  legendDot: { width: 8, height: 8, marginTop: 3, backgroundColor: BLUE },
  glossaryGrid: { flexDirection: 'row', gap: 20 },
  glossaryRow: { flexDirection: 'row', gap: 6, marginBottom: 1 },
  glossaryTerm: { fontSize: 10, ...BOLD, width: 60 },
  glossaryDef: { fontSize: 10, flex: 1, color: '#333' },

  targetNode: { alignSelf: 'center', backgroundColor: CREAM, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 14 },
  targetNodeText: { fontSize: 11, ...BOLD, color: NAVY, textAlign: 'center' },
  targetCardsRow: { flexDirection: 'row' },
  targetCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GOLD, padding: 8, height: 50 },
  targetCardIcon: { width: 22, height: 22 },
  targetCardLabel: { fontSize: 11, ...BOLD, color: NAVY, flex: 1 },
  targetCard: { backgroundColor: CREAM, borderWidth: 1, borderColor: '#ffffff', padding: 14, height: 150 },
  targetCardDesc: { fontSize: 12, lineHeight: 1.45 },
  pillarsTitle: { fontSize: 12, ...BOLD, color: '#8f5605', textAlign: 'center', marginTop: 18 },
  pillarBoxesRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pillarBox: { flex: 1, paddingTop: 8, borderTopWidth: 2, borderTopColor: GOLD },
  pillarBoxLabel: { fontSize: 12, ...BOLD, color: NAVY, lineHeight: 1.3 },

  tableOuter: { borderWidth: 1.5, borderColor: GOLD },
  tableTitle: { backgroundColor: BLUE, color: GOLD, fontSize: 11, ...BOLD, textAlign: 'center', padding: 6 },
  ktHeaderRow: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: GOLD },
  ktRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: GOLD },
  ktCellHeader: { flex: 1, padding: 7, fontSize: 10.5, ...BOLD, color: BLUE, textAlign: 'center' },
  ktCell: { flex: 1, padding: 7, fontSize: 11, textAlign: 'center' },
  ktFirst: { flex: 1.5, padding: 7 },
  ktFirstLabel: { fontSize: 10.5, ...BOLD },
  ktFirstUnit: { fontSize: 9.5, color: TEXT_MUTED, marginTop: 2 },
  footnote: { fontSize: 9.5, color: TEXT_MUTED, marginTop: 8, lineHeight: 1.35 },
  redNote: { fontSize: 10.5, ...BOLD, color: '#c1272d', marginTop: 8 },

  crossHeaderRow: { flexDirection: 'row', backgroundColor: BLUE },
  crossHeaderCell: { flex: 1, padding: 8, fontSize: 10.5, ...BOLD, color: GOLD, textAlign: 'center', justifyContent: 'center' },
  crossFirstHeader: { flex: 1.3, padding: 8, fontSize: 12, ...BOLD, color: '#ffffff', justifyContent: 'center' },
  crossRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: GOLD },
  crossCell: { flex: 1, padding: 7, fontSize: 13, textAlign: 'center' },
  crossFirstCell: { flex: 1.3, padding: 7, fontSize: 13 },
  crossTotalRow: { flexDirection: 'row', borderTopWidth: 1.5, borderTopColor: GOLD, backgroundColor: BLUE },
  crossTotalCell: { flex: 1, padding: 8, fontSize: 13, ...BOLD, color: GOLD, textAlign: 'center' },

  detailHeaderRow: { flexDirection: 'row', backgroundColor: BLUE },
  detailHeaderCell: { padding: 8, fontSize: 11, ...BOLD, color: GOLD },
  detailRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: GOLD, alignItems: 'center' },
  detailCell: { padding: 9, fontSize: 11.5, lineHeight: 1.35 },
  statusBadge: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 9, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 10, ...BOLD, color: '#ffffff' },

  closingPage: { padding: 0, flexDirection: 'row' },
  closingLeft: { width: '50%', padding: 40, justifyContent: 'space-between' },
  closingRight: { width: '50%' },
  closingTitle: { fontSize: 22, ...BOLD, color: NAVY, marginBottom: 14 },
  closingText: { fontSize: 15, lineHeight: 1.55 },
})

function Footer({ label }: { label: string }) {
  return (
    <Text
      style={styles.pageFooter}
      render={({ pageNumber, totalPages }) => `MISSION 300  ·  ${label}  ·  Page ${pageNumber} of ${totalPages}`}
      fixed
    />
  )
}

function PageHeader({ data }: { data: CompactProgressReportData }) {
  return (
    <Text style={styles.pageHeader}>
      {data.countryName} Compact Progress Report {data.reportingPeriod}
    </Text>
  )
}

function PageTitle({ children }: { children: string }) {
  return (
    <View style={styles.h1Row}>
      <View style={styles.h1Dot} />
      <Text style={styles.h1}>{children}</Text>
    </View>
  )
}

function CoverPage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size={SLIDE} wrap={false} style={styles.coverPage}>
      <View style={styles.coverLeft}>
        <View>
          <View style={styles.coverLogosRow}>
            <Image src={`${ASSET_BASE}/logo-worldbank.png`} style={{ width: 90, height: 31 }} />
            <Image src={`${ASSET_BASE}/logo-afdb.png`} style={{ width: 52, height: 26 }} />
          </View>

          <Text style={styles.coverTitle}>
            MISSION 300{'\n'}COMPACT{'\n'}PROGRESS REPORT
          </Text>
          <Text style={styles.coverSubtitle}>{data.cycleLabel.toUpperCase()}</Text>

          <View style={styles.coverFlagRow}>
            <Image src={`${ASSET_BASE}/nigeria-flag-icon.png`} style={{ width: 22, height: 22, borderRadius: 11 }} />
            <Text style={styles.coverCountry}>{data.countryName.toUpperCase()}</Text>
          </View>

          <Text style={styles.coverDate}>
            {(data.reportDateLabel || data.reportingPeriod).toUpperCase()} · DATA AS OF {data.generatedAtLabel.toUpperCase()}
          </Text>
          <Text style={styles.coverDisclaimer}>
            Disclaimer: This report has been prepared and validated by the Government through its Compact Delivery
            and Monitoring Unit (CDMU). While Mission 300 partners support the reporting process and its
            standardization, responsibility for the content, data, and interpretations rests solely with the
            Government.
          </Text>
        </View>

        <View>
          <Text style={styles.coverPartnersLabel}>In collaboration with</Text>
          <View style={styles.coverPartnerLogos}>
            <Image src={`${ASSET_BASE}/logo-rockefeller.png`} style={{ width: 80, height: 27 }} />
            <Image src={`${ASSET_BASE}/logo-geapp.png`} style={{ width: 80, height: 27 }} />
          </View>
        </View>
      </View>

      <View style={styles.coverRight}>
        <Image src={`${ASSET_BASE}/solar-panels.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <View style={styles.externalUseBadge}>
          <Text style={styles.externalUseText}>FOR{'\n'}EXTERNAL{'\n'}USE</Text>
        </View>
      </View>
    </Page>
  )
}

const GLOSSARY: readonly [string, string][] = [
  ['AfDB', 'African Development Bank'],
  ['CDMU', 'Compact Delivery and Monitoring Unit'],
  ['CPR', 'Compact Progress Report'],
  ['DISCOs', 'Distribution Companies'],
  ['GENCOs', 'Generation Companies'],
  ['PPP', 'Public-Private Partnership'],
  ['SEforALL', 'Sustainable Energy for All'],
  ['T&D', 'Transmission and Distribution'],
  ['TA', 'Technical Assistance'],
  ['USD', 'United States Dollar'],
  ['WBG', 'World Bank Group'],
]

const STATUS_LEGEND: readonly string[] = [
  'NOT YET DUE: No activities initiated for this action',
  'IN PROGRESS, ON TRACK: Implementation progressing well, no issues to be reported',
  'IN PROGRESS, MINOR DELAYS: In progress but slight issues or minor delays expected',
  'IN PROGRESS, AT RISK: In progress but major challenges, high risk of delay expected',
  'DELAYED: Deadlines passed and activities remain incomplete',
  'COMPLETED: All implementation activities concluded',
]

function GlossaryPage({ data }: { data: CompactProgressReportData }) {
  const half = Math.ceil(GLOSSARY.length / 2)
  return (
    <Page size={SLIDE} wrap={false} style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={[styles.twoCol, { flex: 1 }]}>
        <View style={[styles.navyBox, { width: '36%' }]}>
          <Text style={styles.boxTitle}>DATA SOURCES AND DISCLAIMER</Text>
          <Text style={styles.bodyTextLight}>
            Under the Mission 300 initiative, progress on National Energy Compacts is monitored through data
            submitted by each country&apos;s Compact Delivery and Monitoring Unit (CDMU).
          </Text>
          <Text style={styles.bodyTextLight}>
            Monitoring covers both policy reform actions and key targets: electricity access, clean cooking access,
            share of renewable energy in national generation, and private capital mobilized.
          </Text>
          <Text style={styles.bodyTextLight}>
            This report presents the latest {data.countryName}-reported data as of {data.generatedAtLabel} and
            reflects the {data.cycleLabel}. The data is country-reported and based on national
            methodologies, which may limit direct comparisons across countries.
          </Text>
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          <View style={styles.goldBorderBox}>
            <Text style={styles.boxTitleBlue}>DEFINITIONS &amp; METHODOLOGY</Text>
            <Text style={styles.subheading}>Action Status</Text>
            {STATUS_LEGEND.map((line) => (
              <View style={styles.legendRow} key={line}>
                <View style={styles.legendDot} />
                <Text style={styles.bodyText}>{line}</Text>
              </View>
            ))}
            <Text style={[styles.subheading, { marginTop: 8 }]}>
              &quot;Connections&quot; and &quot;People Provided with Electricity access&quot; Methodology
            </Text>
            <Text style={styles.bodyText}>
              &quot;New electricity connections&quot; refers to additional electricity connections established since
              the start of Mission 300 up to the reporting year, across all solution types (grid, mini-grids and
              solar home systems). The number of people gaining access is estimated by multiplying new connections
              by the national average household size. This conversion is illustrative and does not imply that each
              connection corresponds to exactly one household.
            </Text>
          </View>

          <View>
            <Text style={styles.boxTitleBlue}>GLOSSARY</Text>
            <View style={styles.glossaryGrid}>
              {[GLOSSARY.slice(0, half), GLOSSARY.slice(half)].map((column, index) => (
                <View style={{ flex: 1 }} key={index}>
                  {column.map(([term, definition]) => (
                    <View style={styles.glossaryRow} key={term}>
                      <Text style={styles.glossaryTerm}>{term}</Text>
                      <Text style={styles.glossaryDef}>{definition}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

const ICON_FILES: Record<CompactProgressReportData['pillarTargets'][number]['icon'], string> = {
  'electricity-access': 'icon-electricity-access.png',
  'clean-cooking': 'icon-clean-cooking.png',
  renewables: 'icon-renewables.png',
  'private-capital': 'icon-private-capital.png',
}

function CompactStructurePage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size={SLIDE} wrap={false} style={styles.contentPage}>
      <PageHeader data={data} />
      <PageTitle>{`${data.countryName.toUpperCase()} NATIONAL ENERGY COMPACT`}</PageTitle>

      <View style={{ flexDirection: 'row', gap: 24 }}>
        <View style={{ width: '32%' }}>
          <Text style={styles.bodyLarge}>
            Under the Mission 300 initiative, {data.countryName} committed to accelerating electricity access and
            mobilizing private investment.
          </Text>
          <Text style={styles.bodyLarge}>
            This Compact Progress Report tracks {data.countryName}&apos;s progress against these commitments using
            data submitted by the Compact Delivery and Monitoring Unit (CDMU), with the latest update provided as of{' '}
            {data.generatedAtLabel}.
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.targetNode}>
            <Text style={styles.targetNodeText}>
              {data.reportingPeriod} {data.countryName.toUpperCase()}
              {'\n'}NATIONAL ENERGY COMPACT TARGETS
            </Text>
          </View>
          <View style={styles.targetCardsRow}>
            {data.pillarTargets.map((target) => (
              <View key={target.pillarId} style={{ flex: 1 }}>
                <View style={styles.targetCardHead}>
                  <Image src={`${ASSET_BASE}/${ICON_FILES[target.icon]}`} style={styles.targetCardIcon} />
                  <Text style={styles.targetCardLabel}>{target.label.toUpperCase()}</Text>
                </View>
                <View style={styles.targetCard}>
                  <Text style={styles.targetCardDesc}>{shortLabel(target.description)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.pillarsTitle}>MISSION 300 COMPACT PILLARS</Text>
      <View style={styles.pillarBoxesRow}>
        {data.pillars.map((pillar) => (
          <View key={pillar.id} style={styles.pillarBox}>
            <Text style={styles.pillarBoxLabel}>{pillar.label}</Text>
          </View>
        ))}
      </View>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function KeyTargetsPage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size={SLIDE} wrap={false} style={styles.contentPage}>
      <PageHeader data={data} />
      <PageTitle>KEY TARGETS</PageTitle>

      <View style={{ flexDirection: 'row', gap: 26 }}>
        <View style={{ width: '40%' }}>
          {keyTargetParagraphs(data).map((text) => (
            <Text key={text} style={styles.bodyLarge}>
              {text}
            </Text>
          ))}
          <Text style={styles.redNote}>
            Quantitative data presented in this slide reflect the information available as of the latest reporting
            cycle provided by the Compact Delivery and Monitoring Unit (CDMU).
          </Text>
        </View>

        <View style={[styles.tableOuter, { flex: 1 }]}>
          <Text style={styles.tableTitle}>
            {data.countryName.toUpperCase()}&apos;S PROGRESS ON HIGH-LEVEL COMPACT TARGETS
          </Text>
          <View style={styles.ktHeaderRow}>
            <Text style={[styles.ktCellHeader, { flex: 1.5, textAlign: 'left' }]}>Key Target</Text>
            <Text style={styles.ktCellHeader}>Baseline</Text>
            <Text style={styles.ktCellHeader}>Progress to date</Text>
            <Text style={[styles.ktCellHeader, { flex: 1.3 }]}>Target</Text>
          </View>
          {data.keyTargets.map((target) => (
            <View style={styles.ktRow} key={target.label} wrap={false}>
              <View style={styles.ktFirst}>
                <Text style={styles.ktFirstLabel}>{target.label}</Text>
                <Text style={styles.ktFirstUnit}>({target.unit})</Text>
              </View>
              <Text style={styles.ktCell}>{shortLabel(target.baselineLabel)}</Text>
              <Text style={styles.ktCell}>{shortLabel(target.currentLabel)}</Text>
              <Text style={[styles.ktCell, { flex: 1.3 }]}>{shortLabel(target.targetLabel)}</Text>
            </View>
          ))}
        </View>
      </View>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function ReformOverviewPage({ data }: { data: CompactProgressReportData }) {
  const lines = [
    {
      label: 'Priority actions',
      pillarCounts: data.statusByPillar.map((row) => row.priorityCount),
      statusCounts: data.statusByPriority.priority,
    },
    {
      label: 'Other actions',
      pillarCounts: data.statusByPillar.map((row) => row.otherCount),
      statusCounts: data.statusByPriority.other,
    },
  ]
  const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0)

  return (
    <Page size={SLIDE} wrap={false} style={styles.contentPage}>
      <PageHeader data={data} />
      <PageTitle>OVERVIEW OF REFORM ACTIONS STATUS</PageTitle>

      <View style={styles.tableOuter}>
        <View style={styles.crossHeaderRow}>
          <Text style={styles.crossFirstHeader}>{data.countryName}</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={styles.crossHeaderCell}>
              {row.pillarLabel}
            </Text>
          ))}
          <Text style={styles.crossHeaderCell}>Total</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={styles.crossHeaderCell}>
              {entry.label}
            </Text>
          ))}
        </View>

        {lines.map((line) => (
          <View style={styles.crossRow} key={line.label}>
            <Text style={styles.crossFirstCell}>{line.label}</Text>
            {line.pillarCounts.map((count, index) => (
              <Text key={data.statusByPillar[index]?.pillarId} style={styles.crossCell}>
                {count}
              </Text>
            ))}
            <Text style={[styles.crossCell, BOLD]}>{sum(line.pillarCounts)}</Text>
            {line.statusCounts.map((entry) => (
              <Text key={entry.status} style={styles.crossCell}>
                {entry.count}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.crossTotalRow}>
          <Text style={[styles.crossFirstCell, BOLD, { color: GOLD }]}>Total</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={styles.crossTotalCell}>
              {row.total}
            </Text>
          ))}
          <Text style={styles.crossTotalCell}>{data.totalActions}</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={styles.crossTotalCell}>
              {entry.count}
            </Text>
          ))}
        </View>
      </View>

      <Text style={styles.footnote}>
        In this table all actions that are not yet due, on track, delayed by a minor margin or at risk are shown together as
        &quot;In progress&quot;. The status of each priority action is given in full on the next page.
      </Text>
      <Text style={[styles.boxTitleBlue, { marginTop: 10 }]}>Reform Actions</Text>
      {actionsParagraphs(data).map((text) => (
        <Text key={text} style={[styles.bodyText, { marginBottom: 8 }]}>
          {text}
        </Text>
      ))}
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function PriorityActionsPage({ data }: { data: CompactProgressReportData }) {
  const columns = [
    { key: 'pillar', label: 'Pillar', flex: 1.3 },
    { key: 'commitment', label: 'Commitment / Indicator', flex: 2 },
    { key: 'action', label: 'Priority Reform Action', flex: 2.6 },
    { key: 'deadline', label: 'Deadline', flex: 0.9 },
    { key: 'current', label: 'Current Status', flex: 1 },
    { key: 'previous', label: 'Previous Status', flex: 1 },
  ] as const

  return (
    <Page size={SLIDE} wrap={false} style={styles.contentPage}>
      <PageHeader data={data} />
      <PageTitle>FOCUS ON PRIORITY REFORM ACTIONS STATUS</PageTitle>

      {data.priorityActions.length === 0 ? (
        <Text style={styles.bodyText}>No priority reform actions are currently on record.</Text>
      ) : (
        <View style={styles.tableOuter}>
          <Text style={[styles.tableTitle, { fontSize: 13, padding: 7 }]}>
            {data.countryName} Energy Compact Priority Reform Actions
          </Text>
          <View style={styles.detailHeaderRow}>
            {columns.map((column) => (
              <Text key={column.key} style={[styles.detailHeaderCell, { flex: column.flex }]}>
                {column.label}
              </Text>
            ))}
          </View>
          {data.priorityActions.map((action) => (
            <View key={action.id} style={styles.detailRow} wrap={false}>
              <Text style={[styles.detailCell, BOLD, { flex: 1.3, color: BLUE }]}>{action.pillarLabel}</Text>
              <Text style={[styles.detailCell, { flex: 2 }]}>{action.commitment}</Text>
              <Text style={[styles.detailCell, { flex: 2.6 }]}>{action.actionText}</Text>
              <Text style={[styles.detailCell, { flex: 0.9 }]}>{action.deadlineLabel}</Text>
              <View style={[styles.detailCell, { flex: 1 }]}>
                <View
                  style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[action.currentStatusLabel] ?? TEXT_MUTED }]}
                >
                  <Text style={styles.statusBadgeText}>{action.currentStatusLabel}</Text>
                </View>
              </View>
              <Text style={[styles.detailCell, { flex: 1, color: TEXT_MUTED }]}>{action.previousStatusLabel}</Text>
            </View>
          ))}
        </View>
      )}
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function ClosingPage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size={SLIDE} wrap={false} style={styles.closingPage}>
      <View style={styles.closingLeft}>
        <View>
          <Text style={styles.closingTitle}>ABOUT MISSION 300</Text>
          <Text style={styles.closingText}>
            Mission 300 is a joint initiative by the World Bank Group and the African Development Bank (AfDB),
            supported by The Rockefeller Foundation, SEforALL and the Global Energy Alliance for People and Planet
            (GEAPP), which aims to provide electricity access to 300 million Africans by 2030. This ambitious goal
            seeks to halve the current number of people without electricity on the continent, driving sustainable
            development through collaboration and innovative solutions.
          </Text>
        </View>
        <View>
          <Text style={[styles.coverPartnersLabel, { color: TEXT_MUTED }]}>In collaboration with</Text>
          <View style={styles.coverPartnerLogos}>
            <Image src={`${ASSET_BASE}/logo-worldbank.png`} style={{ width: 80, height: 27 }} />
            <Image src={`${ASSET_BASE}/logo-afdb.png`} style={{ width: 46, height: 23 }} />
            <Image src={`${ASSET_BASE}/logo-rockefeller.png`} style={{ width: 70, height: 24 }} />
            <Image src={`${ASSET_BASE}/logo-geapp.png`} style={{ width: 70, height: 24 }} />
          </View>
        </View>
      </View>
      <View style={styles.closingRight}>
        <Image src={`${ASSET_BASE}/technician.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </View>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

export function CompactProgressReportDocument({ data }: { data: CompactProgressReportData }) {
  return (
    <Document title={`${data.countryName} Compact Progress Report ${data.reportingPeriod}`}>
      <CoverPage data={data} />
      <GlossaryPage data={data} />
      <CompactStructurePage data={data} />
      <KeyTargetsPage data={data} />
      <ReformOverviewPage data={data} />
      <PriorityActionsPage data={data} />
      <ClosingPage data={data} />
    </Document>
  )
}
