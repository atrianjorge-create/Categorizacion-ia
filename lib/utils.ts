import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with a fixed locale to prevent hydration mismatches.
 * The app is in Spanish so we use "es-ES" everywhere.
 */
export function fmtNum(value: number): string {
  return value.toLocaleString("es-ES")
}
