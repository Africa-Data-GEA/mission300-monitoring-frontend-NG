import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { pdf } from '@react-pdf/renderer'
import type { CompactProgressReportData } from './compact-progress-report-data'
import './pdf-fonts'

/**
 * A bespoke, fixed-layout PDF matching the real Mission 300 Compact Progress
 * Report's design and structure (see `public/nigeria_mission-300_compact-
 * progress-report_q12026.pdf`, the reference this was built against) —
 * populated with this app's own data rather than that document's specific
 * point-in-time content. See `compact-progress-report-data.ts` for what
 * backs each page and why Programmes/Projects stand in for "Reform Actions".
 *
 * Deliberately NOT the generic `ReportDocument` (report-document.tsx): this
 * layout isn't filterable and isn't built from generic tabular sections, so
 * forcing it through that contract would either lose the design entirely or
 * contort `reportSectionSchema` into something it was never meant to hold.
 * Reached only from the fixed "Compact Progress Report" quick-export card,
 * never the configurable builder — see `use-reports-page.ts`.
 */

const NAVY = '#002036'
const BLUE = '#065a89'
const GOLD = '#ffb800'
const BORDER = '#d9dfe5'
const TEXT_MUTED = '#5b6472'
const ASSET_BASE = '/reports/compact-progress'

const STATUS_COLORS: Record<string, string> = {
  'On track': '#00764a',
  'At risk': '#8f5605',
  Delayed: '#a8201a',
  Blocked: '#a8201a',
  Completed: '#00764a',
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Google Sans', fontSize: 9, color: '#1a1f29' },
  pageHeader: {
    fontSize: 7,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: TEXT_MUTED,
  },
  h1Row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  h1Dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#7cb928' },
  h1: { fontSize: 18, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY },

  // Cover page
  coverPage: { padding: 0, flexDirection: 'row' },
  coverLeft: { width: '55%', backgroundColor: NAVY, color: '#ffffff', padding: 40, justifyContent: 'space-between' },
  coverRight: { width: '45%' },
  coverLogosRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  coverTitle: { fontSize: 30, fontFamily: 'Google Sans', fontWeight: 700, color: GOLD, lineHeight: 1.15, marginTop: 24 },
  coverSubtitle: { fontSize: 12, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff', marginTop: 10 },
  coverFlagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  coverCountry: { fontSize: 13, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },
  coverDate: { fontSize: 10, fontFamily: 'Google Sans', fontWeight: 700, color: GOLD, marginTop: 20 },
  coverDisclaimer: { fontSize: 8, lineHeight: 1.5, color: '#dbe4ea', marginTop: 8 },
  coverPartnersLabel: { fontSize: 7, color: '#9fb3c2', marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  coverPartnerLogos: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  externalUseBadge: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalUseText: { fontSize: 7, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY, textAlign: 'center', lineHeight: 1.2 },

  // Generic content page
  contentPage: { padding: 36, fontFamily: 'Google Sans', fontSize: 9, color: '#1a1f29' },
  twoCol: { flexDirection: 'row', gap: 18 },
  col: { flex: 1 },
  navyBox: { backgroundColor: NAVY, color: '#ffffff', padding: 18, borderRadius: 10 },
  goldBorderBox: { borderWidth: 1, borderColor: GOLD, padding: 18, borderRadius: 10 },
  boxTitle: { fontSize: 10, fontFamily: 'Google Sans', fontWeight: 700, marginBottom: 8 },
  boxTitleNavy: { fontSize: 10, fontFamily: 'Google Sans', fontWeight: 700, marginBottom: 8, color: NAVY },
  bodyText: { fontSize: 8, lineHeight: 1.55 },
  bodyTextLight: { fontSize: 8, lineHeight: 1.55, color: '#dbe4ea' },
  legendRow: { flexDirection: 'row', gap: 4, marginBottom: 3 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  glossaryGrid: { flexDirection: 'row', gap: 20, marginTop: 10 },
  glossaryCol: { flex: 1 },
  glossaryRow: { flexDirection: 'row', gap: 4, marginBottom: 3 },
  glossaryTerm: { fontSize: 8, fontFamily: 'Google Sans', fontWeight: 700, width: 62 },
  glossaryDef: { fontSize: 8, flex: 1, color: '#333' },

  // Compact-structure page (org chart)
  targetNode: {
    alignSelf: 'center',
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  targetNodeText: { fontSize: 9, fontFamily: 'Google Sans', fontWeight: 700, color: GOLD, textAlign: 'center' },
  targetCardsRow: { flexDirection: 'row', gap: 10 },
  targetCard: { flex: 1, backgroundColor: '#fdf3d8', borderWidth: 1, borderColor: GOLD, borderRadius: 12, padding: 12 },
  targetCardIcon: { width: 18, height: 18, marginBottom: 6 },
  targetCardLabel: { fontSize: 8, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY, marginBottom: 4 },
  targetCardDesc: { fontSize: 7, lineHeight: 1.4, color: '#333' },
  pillarBoxesRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  pillarBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 10, padding: 10 },
  pillarBoxLabel: { fontSize: 7, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY, textAlign: 'center', lineHeight: 1.3 },

  // Key targets table
  keyTargetsTable: { borderWidth: 1, borderColor: GOLD, borderRadius: 12, marginTop: 16, width: '100%', overflow: 'hidden' },
  keyTargetsHeaderRow: { flexDirection: 'row', backgroundColor: NAVY },
  keyTargetsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  ktCellHeader: { flex: 1, padding: 8, fontSize: 7.5, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },
  ktCellHeaderFirst: { flex: 1.6, padding: 8, fontSize: 7.5, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },
  ktCell: { flex: 1, padding: 8, fontSize: 8 },
  ktCellFirst: { flex: 1.6, padding: 8 },
  ktCellFirstLabel: { fontSize: 8, fontFamily: 'Google Sans', fontWeight: 700 },
  ktCellFirstUnit: { fontSize: 7, color: TEXT_MUTED, marginTop: 2 },
  mapBox: { alignItems: 'center', marginTop: 6, marginBottom: 6 },

  // Reform-status cross-tab
  crossTabTable: { borderWidth: 1, borderColor: NAVY, borderRadius: 12, marginTop: 14, overflow: 'hidden' },
  crossTabHeaderRow: { flexDirection: 'row', backgroundColor: NAVY },
  crossTabHeaderCell: { flex: 1, padding: 7, fontSize: 7, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center' },
  crossTabFirstHeaderCell: { flex: 1.2, padding: 7, fontSize: 7, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },
  crossTabRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  crossTabCell: { flex: 1, padding: 7, fontSize: 7.5, textAlign: 'center' },
  crossTabFirstCell: { flex: 1.2, padding: 7, fontSize: 7.5, fontFamily: 'Google Sans', fontWeight: 700 },
  crossTabTotalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: NAVY, backgroundColor: '#fdf3d8' },

  // Priority actions detail table
  detailTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, marginTop: 14, overflow: 'hidden' },
  detailHeaderRow: { flexDirection: 'row', backgroundColor: NAVY },
  detailHeaderCell: { padding: 7, fontSize: 6.5, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },
  detailRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  detailCell: { padding: 7, fontSize: 7 },
  statusBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 6.5, fontFamily: 'Google Sans', fontWeight: 700, color: '#ffffff' },

  // Closing page
  closingPage: { padding: 0, flexDirection: 'row' },
  closingLeft: { width: '55%', padding: 40, justifyContent: 'space-between' },
  closingRight: { width: '45%' },
  closingTitle: { fontSize: 16, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY, marginBottom: 12 },
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

function CoverPage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size="A4" orientation="landscape" style={styles.coverPage}>
      <View style={styles.coverLeft}>
        <View>
          <View style={styles.coverLogosRow}>
            <Image src={`${ASSET_BASE}/logo-worldbank.png`} style={{ width: 70, height: 24 }} />
            <Image src={`${ASSET_BASE}/logo-afdb.png`} style={{ width: 40, height: 20 }} />
          </View>

          <Text style={styles.coverTitle}>
            MISSION 300{'\n'}COMPACT{'\n'}PROGRESS REPORT
          </Text>
          <Text style={styles.coverSubtitle}>SECOND CYCLE OF DATA COLLECTION 2025</Text>

          <View style={styles.coverFlagRow}>
            <Image src={`${ASSET_BASE}/nigeria-flag-icon.png`} style={{ width: 16, height: 16, borderRadius: 8 }} />
            <Text style={styles.coverCountry}>{data.countryName.toUpperCase()}</Text>
          </View>

          <Text style={styles.coverDate}>{data.reportingPeriod.toUpperCase()} · GENERATED {data.generatedAtLabel.toUpperCase()}</Text>
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
            <Image src={`${ASSET_BASE}/logo-rockefeller.png`} style={{ width: 60, height: 20 }} />
            <Image src={`${ASSET_BASE}/logo-geapp.png`} style={{ width: 60, height: 20 }} />
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
  'ON TRACK: Implementation progressing well, no issues to be reported',
  'AT RISK: In progress but major challenges, high risk of delay expected',
  'DELAYED: Deadlines passed and activities remain incomplete',
  'COMPLETED: All implementation activities concluded',
]

function GlossaryPage({ data }: { data: CompactProgressReportData }) {
  return (
    <Page size="A4" orientation="landscape" style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={styles.twoCol}>
        <View style={[styles.col, styles.navyBox]}>
          <Text style={styles.boxTitle}>DATA SOURCES AND DISCLAIMER</Text>
          <Text style={styles.bodyTextLight}>
            Progress on this Compact is monitored through data submitted by the Compact Delivery and Monitoring
            Unit (CDMU), covering both delivery actions and key targets across the Mission 300 pillars. This
            report presents the latest {data.countryName}-reported data as of {data.generatedAtLabel} and reflects
            the current reporting cycle. The data provided is country-reported and based on national
            methodologies, which may limit direct comparisons across countries.
          </Text>
        </View>

        <View style={[styles.col, styles.goldBorderBox]}>
          <Text style={styles.boxTitleNavy}>DEFINITIONS &amp; METHODOLOGY</Text>
          <Text style={[styles.bodyText, { fontFamily: 'Google Sans', fontWeight: 700, marginBottom: 4 }]}>
            Reform Action Status
          </Text>
          {STATUS_LEGEND.map((line) => (
            <View style={styles.legendRow} key={line}>
              <View style={[styles.legendDot, { backgroundColor: BLUE }]} />
              <Text style={styles.bodyText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.glossaryGrid}>
        <Text style={[styles.boxTitleNavy, { width: '100%' }]}>GLOSSARY</Text>
      </View>
      <View style={styles.glossaryGrid}>
        {[GLOSSARY.slice(0, Math.ceil(GLOSSARY.length / 2)), GLOSSARY.slice(Math.ceil(GLOSSARY.length / 2))].map(
          (col, colIndex) => (
            <View style={styles.glossaryCol} key={colIndex}>
              {col.map(([term, def]) => (
                <View style={styles.glossaryRow} key={term}>
                  <Text style={styles.glossaryTerm}>{term}</Text>
                  <Text style={styles.glossaryDef}>{def}</Text>
                </View>
              ))}
            </View>
          ),
        )}
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
    <Page size="A4" orientation="landscape" style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={styles.h1Row}>
        <View style={styles.h1Dot} />
        <Text style={styles.h1}>{data.countryName.toUpperCase()} NATIONAL ENERGY COMPACT</Text>
      </View>

      <Text style={[styles.bodyText, { marginBottom: 14, maxWidth: '45%' }]}>
        Under the Mission 300 initiative, {data.countryName} committed to accelerating electricity access and
        mobilizing private investment. This Compact Progress Report tracks {data.countryName}&apos;s progress
        against these commitments using data submitted by the Compact Delivery and Monitoring Unit (CDMU), current
        as of {data.generatedAtLabel}.
      </Text>

      <View style={styles.targetNode}>
        <Text style={styles.targetNodeText}>
          {data.reportingPeriod} {data.countryName.toUpperCase()}{'\n'}NATIONAL ENERGY COMPACT TARGETS
        </Text>
      </View>

      <View style={styles.targetCardsRow}>
        {data.pillarTargets.map((target) => (
          <View key={target.pillarId} style={styles.targetCard}>
            <Image src={`${ASSET_BASE}/${ICON_FILES[target.icon]}`} style={styles.targetCardIcon} />
            <Text style={styles.targetCardLabel}>{target.label.toUpperCase()}</Text>
            <Text style={styles.targetCardDesc}>{target.description}</Text>
          </View>
        ))}
      </View>

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
    <Page size="A4" orientation="landscape" style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={styles.h1Row}>
        <View style={styles.h1Dot} />
        <Text style={styles.h1}>KEY TARGETS</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bodyText}>
            The reporting period covers progress as of {data.generatedAtLabel}.
          </Text>
        </View>
        <View style={[styles.goldBorderBox, { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 18 }]}>
          <Text style={[styles.boxTitleNavy, { marginBottom: 4 }]}>{data.countryName.toUpperCase()}</Text>
          <Image src={`${ASSET_BASE}/nigeria-flag-icon.png`} style={{ width: 40, height: 40, borderRadius: 20 }} />
        </View>
      </View>

      <View style={styles.keyTargetsTable}>
        <View style={styles.keyTargetsHeaderRow}>
          <Text style={styles.ktCellHeaderFirst}>Key target</Text>
          <Text style={styles.ktCellHeader}>Baseline</Text>
          <Text style={styles.ktCellHeader}>Progress to date</Text>
          <Text style={styles.ktCellHeader}>Target</Text>
        </View>
        {data.keyTargets.map((target) => (
          <View style={styles.keyTargetsRow} key={target.label}>
            <View style={styles.ktCellFirst}>
              <Text style={styles.ktCellFirstLabel}>{target.label}</Text>
              <Text style={styles.ktCellFirstUnit}>({target.unit})</Text>
            </View>
            <Text style={styles.ktCell}>{target.baselineLabel}</Text>
            <Text style={styles.ktCell}>{target.currentLabel}</Text>
            <Text style={styles.ktCell}>{target.targetLabel}</Text>
          </View>
        ))}
      </View>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function ReformOverviewPage({ data }: { data: CompactProgressReportData }) {
  const totalOther = data.statusByPillar.reduce((sum, row) => sum + row.otherCount, 0)
  const totalPriority = data.statusByPillar.reduce((sum, row) => sum + row.priorityCount, 0)

  return (
    <Page size="A4" orientation="landscape" style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={styles.h1Row}>
        <View style={styles.h1Dot} />
        <Text style={styles.h1}>OVERVIEW OF DELIVERY ACTIONS STATUS</Text>
      </View>

      <View style={styles.crossTabTable}>
        <View style={styles.crossTabHeaderRow}>
          <Text style={styles.crossTabFirstHeaderCell}>{data.countryName}</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={styles.crossTabHeaderCell}>
              {row.pillarLabel}
            </Text>
          ))}
          <Text style={styles.crossTabHeaderCell}>Total</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={styles.crossTabHeaderCell}>
              {entry.label}
            </Text>
          ))}
        </View>

        <View style={styles.crossTabRow}>
          <Text style={styles.crossTabFirstCell}>Priority actions</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={styles.crossTabCell}>
              {row.priorityCount}
            </Text>
          ))}
          <Text style={styles.crossTabCell}>{totalPriority}</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={styles.crossTabCell} />
          ))}
        </View>

        <View style={styles.crossTabRow}>
          <Text style={styles.crossTabFirstCell}>Other actions</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={styles.crossTabCell}>
              {row.otherCount}
            </Text>
          ))}
          <Text style={styles.crossTabCell}>{totalOther}</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={styles.crossTabCell} />
          ))}
        </View>

        <View style={styles.crossTabTotalRow}>
          <Text style={[styles.crossTabFirstCell, { color: NAVY }]}>Total</Text>
          {data.statusByPillar.map((row) => (
            <Text key={row.pillarId} style={[styles.crossTabCell, { fontFamily: 'Google Sans', fontWeight: 700 }]}>
              {row.total}
            </Text>
          ))}
          <Text style={[styles.crossTabCell, { fontFamily: 'Google Sans', fontWeight: 700 }]}>{data.totalActions}</Text>
          {data.statusTotals.map((entry) => (
            <Text key={entry.status} style={[styles.crossTabCell, { fontFamily: 'Google Sans', fontWeight: 700 }]}>
              {entry.count}
            </Text>
          ))}
        </View>
      </View>

      <Text style={[styles.bodyText, { marginTop: 14 }]}>
        {data.countryName}&apos;s National Energy Compact tracks {data.totalActions} delivery actions across its
        five pillars, of which {data.totalPriorityActions} are Priority actions subject to enhanced monitoring.
        The status breakdown above reflects Programmes and Projects currently on record — the same population the
        Programs module and pillar dashboards track — grouped by pillar and by current execution status.
      </Text>
      <Footer label={`${data.countryName} Compact Progress Report`} />
    </Page>
  )
}

function PriorityActionsPage({ data }: { data: CompactProgressReportData }) {
  const columns = [
    { key: 'pillar', label: 'Pillar', flex: 1.3 },
    { key: 'commitment', label: 'Commitment / Indicator', flex: 2 },
    { key: 'action', label: 'Priority Action', flex: 2.4 },
    { key: 'deadline', label: 'Deadline', flex: 0.9 },
    { key: 'current', label: 'Current Status', flex: 1 },
    { key: 'previous', label: 'Previous Status', flex: 1 },
  ] as const

  return (
    <Page size="A4" orientation="landscape" style={styles.contentPage}>
      <PageHeader data={data} />
      <View style={styles.h1Row}>
        <View style={styles.h1Dot} />
        <Text style={styles.h1}>FOCUS ON PRIORITY ACTIONS STATUS</Text>
      </View>

      {data.priorityActions.length === 0 ? (
        <Text style={styles.bodyText}>No priority-flagged programmes are currently on record.</Text>
      ) : (
        <View style={styles.detailTable}>
          <View style={styles.detailHeaderRow}>
            {columns.map((col) => (
              <Text key={col.key} style={[styles.detailHeaderCell, { flex: col.flex }]}>
                {col.label}
              </Text>
            ))}
          </View>
          {data.priorityActions.map((action) => (
            <View key={action.id} style={styles.detailRow} wrap={false}>
              <Text style={[styles.detailCell, { flex: 1.3 }]}>{action.pillarLabel}</Text>
              <Text style={[styles.detailCell, { flex: 2 }]}>{action.commitment}</Text>
              <Text style={[styles.detailCell, { flex: 2.4 }]}>{action.actionText}</Text>
              <Text style={[styles.detailCell, { flex: 0.9 }]}>{action.deadlineLabel}</Text>
              <View style={[styles.detailCell, { flex: 1 }]}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[action.currentStatusLabel] ?? TEXT_MUTED }]}>
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
    <Page size="A4" orientation="landscape" style={styles.closingPage}>
      <View style={styles.closingLeft}>
        <View>
          <Text style={styles.closingTitle}>ABOUT MISSION 300</Text>
          <Text style={styles.bodyText}>
            Mission 300 is a joint initiative by the World Bank Group and the African Development Bank (AfDB),
            supported by The Rockefeller Foundation, SEforALL and the Global Energy Alliance for People and
            Planet (GEAPP), which aims to provide electricity access to 300 million Africans by 2030. This
            ambitious goal seeks to halve the current number of people without electricity on the continent,
            driving sustainable development through collaboration and innovative solutions.
          </Text>
        </View>
        <View>
          <Text style={[styles.coverPartnersLabel, { color: TEXT_MUTED }]}>In collaboration with</Text>
          <View style={styles.coverPartnerLogos}>
            <Image src={`${ASSET_BASE}/logo-worldbank.png`} style={{ width: 60, height: 20 }} />
            <Image src={`${ASSET_BASE}/logo-afdb.png`} style={{ width: 34, height: 17 }} />
            <Image src={`${ASSET_BASE}/logo-rockefeller.png`} style={{ width: 50, height: 17 }} />
            <Image src={`${ASSET_BASE}/logo-geapp.png`} style={{ width: 50, height: 17 }} />
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

/** Renders the Compact Progress Report to a real PDF file, client-side —
 * mirrors `buildReportPdf`'s `pdf(...).toBlob()` pattern in export-pdf.tsx. */
export async function buildCompactProgressReportPdf(data: CompactProgressReportData): Promise<Blob> {
  return pdf(<CompactProgressReportDocument data={data} />).toBlob()
}
