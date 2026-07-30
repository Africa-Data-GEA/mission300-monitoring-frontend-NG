import { describe, expect, it } from 'vitest'
import { NAVIGATION, READY_PILLARS } from '@/config/navigation'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

const allItems = NAVIGATION.flatMap((group) => group.items)

describe('NAVIGATION', () => {
  /*
   * The wireframe defined four groups; "Analytics" was added afterward on
   * stakeholder feedback to give the KPI Directory — a reference catalogue,
   * not a primary page — its own clearly-labelled section near the bottom
   * rather than sitting inside Monitoring & Analysis.
   */
  it('defines the five navigation groups', () => {
    expect(NAVIGATION.map((group) => group.label)).toEqual([
      'Monitoring & Analysis',
      'Delivery tracking',
      'Data operations',
      'Analytics',
      'Administration',
    ])
  })

  it('has no empty groups', () => {
    for (const group of NAVIGATION) {
      expect(group.items.length).toBeGreaterThan(0)
    }
  })

  /*
   * Duplicate paths would make NavLink highlight two entries at once.
   */
  it('has no duplicate routes', () => {
    const paths = allItems.map((item) => item.to)

    expect(new Set(paths).size).toBe(paths.length)
  })

  it('has no duplicate labels', () => {
    const labels = allItems.map((item) => item.label)

    expect(new Set(labels).size).toBe(labels.length)
  })

  it('gives every item an absolute route', () => {
    for (const item of allItems) {
      expect(item.to.startsWith('/')).toBe(true)
    }
  })

  it('gives every item an icon', () => {
    for (const item of allItems) {
      // Lucide icons are forwardRef objects, not plain functions, so assert
      // "is a renderable component" rather than a specific typeof.
      expect(item.icon, item.label).toBeDefined()
      expect(['function', 'object'], item.label).toContain(typeof item.icon)
    }
  })

  describe('readiness flags', () => {
    /*
     * `ready` drives whether an item renders as a link or a disabled button.
     * This test must be updated as pages ship, which is deliberate — it forces
     * the flag and the page to land together.
     */
    it('marks each implemented page as ready', () => {
      const ready = allItems.filter((item) => item.ready)

      expect(ready.map((item) => [item.label, item.to])).toEqual([
        ['Executive Overview', '/dashboard'],
        ['Pillar dashboards', '/pillars'],
        ['State & DisCo', '/state-disco'],
        ['Programs', '/programs'],
        ['Data submissions', '/data-submissions'],
        ['Reports & exports', '/reports'],
        ['KPI Directory', '/kpis'],
        ['Stakeholders', '/stakeholders'],
        ['User access', '/administration'],
      ])
    })
  })

  describe('pillar sub-navigation', () => {
    it('lists every Compact pillar', () => {
      const pillarItem = allItems.find(
        (item) => item.label === 'Pillar dashboards',
      )

      expect(pillarItem?.children).toHaveLength(PILLARS.length)
    })

    it('routes each pillar to its own dashboard', () => {
      const pillarItem = allItems.find(
        (item) => item.label === 'Pillar dashboards',
      )

      for (const pillar of PILLARS) {
        expect(pillarItem?.children).toContainEqual({
          label: PILLAR_LABELS[pillar],
          to: `/pillars/${pillar}`,
          ready: READY_PILLARS.has(pillar),
        })
      }
    })
  })
})

describe('PILLAR_LABELS', () => {
  it('labels every pillar', () => {
    for (const pillar of PILLARS) {
      expect(PILLAR_LABELS[pillar]).toBeTruthy()
    }
  })

  it('has no duplicate labels', () => {
    const labels = PILLARS.map((pillar) => PILLAR_LABELS[pillar])

    expect(new Set(labels).size).toBe(PILLARS.length)
  })

  it('defines exactly six pillars, as the Compact does', () => {
    expect(PILLARS).toHaveLength(6)
  })
})
