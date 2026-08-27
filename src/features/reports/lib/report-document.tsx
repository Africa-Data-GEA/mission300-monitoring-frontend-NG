import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReportPreview } from '@/api/schemas/reports'
import './pdf-fonts'
import type { Orientation } from './types'

/**
 * Navy/gold — the same fixed Mission 300 palette the bespoke Compact
 * Progress Report PDF uses (compact-progress-report-document.tsx), not the
 * admin-configurable `--color-brand-*` tokens: every report this app
 * generates should read as one consistent, modern document family rather
 * than the builder's output looking like a different product from the CPR
 * quick-export.
 */
const NAVY = '#002036'
const GOLD = '#FFB800'
const MUTED = '#5B6472'
const BORDER = '#D8DCE3'
const MARGIN = 40

const styles = StyleSheet.create({
  page: { padding: MARGIN, fontSize: 9, fontFamily: 'Google Sans', color: '#1A1F29' },

  // Cover page — full-bleed colour band up top, meta grid below.
  coverPage: { padding: 0, fontFamily: 'Google Sans', color: '#1A1F29' },
  coverBand: {
    backgroundColor: NAVY,
    color: '#FFFFFF',
    paddingHorizontal: MARGIN,
    paddingTop: 44,
    paddingBottom: 44,
  },
  coverWordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coverWordmarkDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: GOLD },
  coverWordmark: { fontSize: 10, fontFamily: 'Google Sans', fontWeight: 700, color: '#FFFFFF', letterSpacing: 2 },
  coverWordmarkSub: { fontSize: 8, color: '#FFFFFF', opacity: 0.8, marginTop: 3 },
  coverTitle: {
    fontSize: 25,
    fontFamily: 'Google Sans',
    fontWeight: 700,
    color: GOLD,
    lineHeight: 1.25,
    marginTop: 60,
    maxWidth: '85%',
  },
  coverSubtitle: { fontSize: 12, color: '#FFFFFF', opacity: 0.9, marginTop: 8 },
  coverMetaBlock: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: MARGIN,
    paddingVertical: 28,
  },
  coverMetaRow: { flexDirection: 'row', width: '50%', marginBottom: 8, paddingRight: 12 },
  coverMetaLabel: { width: 110, fontFamily: 'Google Sans', fontWeight: 700, color: MUTED, fontSize: 8 },
  coverMetaValue: { flex: 1, fontSize: 9 },

  // Content pages
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 9, fontFamily: 'Google Sans', fontWeight: 700 },
  headerMeta: { fontSize: 8, color: MUTED },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Google Sans',
    fontWeight: 700,
    color: NAVY,
    marginTop: 12,
    marginBottom: 6,
  },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', backgroundColor: NAVY },
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  cellHeader: {
    flex: 1,
    padding: 8,
    fontFamily: 'Google Sans',
    fontWeight: 700,
    fontSize: 8,
    color: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: NAVY,
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  emptyNote: { padding: 8, color: MUTED, fontStyle: 'italic', fontSize: 8 },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: MUTED,
  },

  // Closing page
  closingAccentBar: { width: 48, height: 5, borderRadius: 3, backgroundColor: GOLD, marginBottom: 18 },
  closingTitle: { fontSize: 20, fontFamily: 'Google Sans', fontWeight: 700, color: NAVY, marginBottom: 18 },
  closingBlock: { marginBottom: 16 },
  closingLabel: { fontSize: 8, fontFamily: 'Google Sans', fontWeight: 700, color: MUTED, marginBottom: 3 },
  closingText: { fontSize: 9, lineHeight: 1.5 },
})

function CoverPage({ preview, orientation }: { preview: ReportPreview; orientation: Orientation }) {
  const { metadata } = preview

  return (
    <Page size="A4" orientation={orientation} style={styles.coverPage}>
      <View style={styles.coverBand}>
        <View style={styles.coverWordmarkRow}>
          <View style={styles.coverWordmarkDot} />
          <Text style={styles.coverWordmark}>MISSION 300</Text>
        </View>
        <Text style={styles.coverWordmarkSub}>Monitoring &amp; Evaluation Dashboard</Text>

        <Text style={styles.coverTitle}>{metadata.title}</Text>
        <Text style={styles.coverSubtitle}>{metadata.reportingPeriod}</Text>
      </View>

      <View style={styles.coverMetaBlock}>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Generated</Text>
          <Text style={styles.coverMetaValue}>{new Date(metadata.generatedAt).toLocaleString()}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Data version</Text>
          <Text style={styles.coverMetaValue}>{metadata.dataVersion}</Text>
        </View>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>Validation status</Text>
          <Text style={styles.coverMetaValue}>{metadata.validationStatus}</Text>
        </View>
        {metadata.appliedFilters.map((filter) => (
          <View style={styles.coverMetaRow} key={filter.label}>
            <Text style={styles.coverMetaLabel}>{filter.label}</Text>
            <Text style={styles.coverMetaValue}>{filter.value}</Text>
          </View>
        ))}
      </View>
    </Page>
  )
}

function ClosingPage({ preview, orientation }: { preview: ReportPreview; orientation: Orientation }) {
  const { metadata } = preview

  return (
    <Page size="A4" orientation={orientation} style={styles.page}>
      <View style={styles.closingAccentBar} />
      <Text style={styles.closingTitle}>End of report</Text>

      <View style={styles.closingBlock}>
        <Text style={styles.closingLabel}>Data source</Text>
        <Text style={styles.closingText}>{metadata.sourceNotes}</Text>
      </View>
      <View style={styles.closingBlock}>
        <Text style={styles.closingLabel}>Units</Text>
        <Text style={styles.closingText}>{metadata.units}</Text>
      </View>
      <View style={styles.closingBlock}>
        <Text style={styles.closingLabel}>Limitations</Text>
        <Text style={styles.closingText}>{metadata.limitations}</Text>
      </View>

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `Mission 300 M&E Dashboard  ·  Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  )
}

/** The PDF document for a report preview — a cover page, one page group per
 * content section, and a closing page, matching the on-screen preview. */
export function ReportDocument({
  preview,
  orientation,
}: {
  preview: ReportPreview
  orientation: Orientation
}) {
  const { metadata, sections } = preview

  return (
    <Document title={metadata.title}>
      <CoverPage preview={preview} orientation={orientation} />

      <Page size="A4" orientation={orientation} style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>{metadata.title}</Text>
          <Text style={styles.headerMeta}>{metadata.reportingPeriod}</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.rows.length === 0 ? (
              <Text style={styles.emptyNote}>No records match the applied filters.</Text>
            ) : (
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  {section.columns.map((column, index) => (
                    <Text key={index} style={styles.cellHeader}>
                      {column}
                    </Text>
                  ))}
                </View>
                {section.rows.map((row, rowIndex) => (
                  <View style={styles.row} key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Text key={cellIndex} style={styles.cell}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Mission 300 M&E Dashboard  ·  Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>

      <ClosingPage preview={preview} orientation={orientation} />
    </Document>
  )
}
