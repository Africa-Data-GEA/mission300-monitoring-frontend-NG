import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names, resolving conflicts in favour of the last value.
 * Used by every component that accepts a `className` override.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
