// Store central - simula conexion a base de datos
// En produccion esto se reemplazaria por llamadas a MySQL
import type { Profile, Content, AggregatedMetrics } from "./types"
import { SEED_PROFILES, SEED_CONTENTS, SEED_METRICS } from "./seed-data"

let profiles: Profile[] = [...SEED_PROFILES]
let contents: Content[] = [...SEED_CONTENTS]
let metrics: AggregatedMetrics[] = [...SEED_METRICS]

// ---- PROFILES ----
export function getProfiles(): Profile[] {
  return profiles
}

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id)
}

export function createProfile(profile: Profile): Profile {
  profiles.push(profile)
  return profile
}

export function updateProfile(
  id: string,
  data: Partial<Profile>
): Profile | undefined {
  const idx = profiles.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  profiles[idx] = { ...profiles[idx], ...data, updatedAt: new Date().toISOString().slice(0, 10) }
  return profiles[idx]
}

export function deleteProfile(id: string): boolean {
  const len = profiles.length
  profiles = profiles.filter((p) => p.id !== id)
  return profiles.length < len
}

// ---- CONTENTS ----
export function getContents(): Content[] {
  return contents
}

export function getContent(id: string): Content | undefined {
  return contents.find((c) => c.id === id)
}

export function addContent(content: Content): Content {
  contents.push(content)
  return content
}

export function addContents(newContents: Content[]): Content[] {
  contents.push(...newContents)
  return newContents
}

export function deleteContent(id: string): boolean {
  const len = contents.length
  contents = contents.filter((c) => c.id !== id)
  return contents.length < len
}

// ---- METRICS ----
export function getMetrics(): AggregatedMetrics[] {
  return metrics
}

export function getMetricsByProfile(profileId: string): AggregatedMetrics[] {
  return metrics.filter((m) => m.profileId === profileId)
}
