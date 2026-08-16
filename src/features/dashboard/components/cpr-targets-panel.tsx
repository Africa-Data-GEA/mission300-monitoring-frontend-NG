import type { CprTarget } from '../types'

/**
 * Frames the four headline cards as the Compact Progress Report's tracked
 * targets — stakeholder feedback asked for the target section to be linked
 * to CPR-target achievement. A prior version repeated each card's title and
 * value in a second grid directly underneath the cards themselves, which
 * read as the page duplicating itself rather than adding information: every
 * card already states its own baseline and target behind its info icon (see
 * CompactOutcomeCard, AccessRateCard). This is a caption, not a second copy
 * of the cards — it adds the "these four are the CPR's targets" framing
 * without restating figures the cards above already show.
 */
export function CprTargetsPanel({ targets }: { targets: readonly CprTarget[] }) {
  if (targets.length === 0) return null

  return (
    <p className="text-xs text-text-muted">
      The four metrics above are the Compact Progress Report&apos;s (CPR) tracked targets — each
      card&apos;s info icon states its baseline and target.
    </p>
  )
}
