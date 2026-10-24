import { PLATFORM_NAME } from '@/config/platform'
import { useBrandConfig } from './api'

export const DEFAULT_CREST = '/Logos/geapp.png'

/**
 * The saved country identity, with the shipped defaults while it loads, so
 * every place that names the country reads from one source instead of
 * repeating the text.
 */
export function useBrandIdentity() {
  const { data } = useBrandConfig()
  const country = data?.countryName ?? 'Nigeria'
  return {
    country,
    officialName: data?.officialName ?? 'Federal Republic of Nigeria',
    agencyName: data?.agencyName ?? 'Federal Ministry of Power',
    crestUrl: data?.crestUrl ? data.crestUrl : DEFAULT_CREST,
    title: `${PLATFORM_NAME} · ${country}`,
  }
}
