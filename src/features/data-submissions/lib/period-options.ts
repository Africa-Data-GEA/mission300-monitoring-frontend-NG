const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function periodChoices(frequency: string, current: string): string[] {
  const quarter = /^Q([1-4])\s+(\d{4})$/.exec(current)
  if (frequency === 'Quarterly' && quarter) {
    let index = (Number(quarter[2]) * 4) + Number(quarter[1]) - 1
    return Array.from({ length: 8 }, () => {
      const label = `Q${(index % 4) + 1} ${Math.floor(index / 4)}`
      index -= 1
      return label
    })
  }

  const month = /^([A-Za-z]+)\s+(\d{4})$/.exec(current)
  const monthIndex = month ? MONTHS.indexOf(month[1] as string) : -1
  if (frequency === 'Monthly' && month && monthIndex !== -1) {
    let index = (Number(month[2]) * 12) + monthIndex
    return Array.from({ length: 12 }, () => {
      const label = `${MONTHS[index % 12]} ${Math.floor(index / 12)}`
      index -= 1
      return label
    })
  }

  if (frequency === 'Annual' && /^\d{4}$/.test(current)) {
    return Array.from({ length: 5 }, (_, offset) => String(Number(current) - offset))
  }

  return [current]
}
