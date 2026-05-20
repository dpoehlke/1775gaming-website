/**
 * GPX Parser — server-side (Node.js / Next.js API routes)
 * Uses fast-xml-parser instead of DOMParser which is browser-only.
 */
import { XMLParser } from 'fast-xml-parser'

export interface GPXData {
  name: string
  description: string
  waypoints: Array<{
    lat: number
    lon: number
    elevation: number
    name: string
    description: string
    timestamp?: string
  }>
  trackPoints: Array<{
    lat: number
    lon: number
    elevation: number
    timestamp?: string
  }>
  totalDistance: number
  estimatedDuration: number
}

export function parseGPXServer(gpxContent: string): GPXData {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['wpt', 'trkpt', 'trkseg'].includes(name),
  })

  const result = parser.parse(gpxContent)
  const gpx = result?.gpx ?? {}

  const name: string =
    gpx?.metadata?.name ?? gpx?.trk?.name ?? 'Unnamed Route'

  const description: string =
    gpx?.metadata?.desc ?? gpx?.trk?.desc ?? ''

  // Waypoints → AR anchor POIs
  const waypoints: GPXData['waypoints'] = (gpx?.wpt ?? []).map((wpt: Record<string, unknown>) => ({
    lat:         parseFloat(String(wpt['@_lat'] ?? 0)),
    lon:         parseFloat(String(wpt['@_lon'] ?? 0)),
    elevation:   parseFloat(String(wpt['ele']  ?? 0)),
    name:        String(wpt['name']  ?? ''),
    description: String(wpt['desc']  ?? ''),
    timestamp:   wpt['time'] ? String(wpt['time']) : undefined,
  }))

  // Track segments → flattened track points
  const segments: Record<string, unknown>[] = gpx?.trk?.trkseg ?? []
  const trackPoints: GPXData['trackPoints'] = segments.flatMap(
    (seg) => ((seg['trkpt'] as Record<string, unknown>[]) ?? []).map((pt) => ({
      lat:       parseFloat(String(pt['@_lat'] ?? 0)),
      lon:       parseFloat(String(pt['@_lon'] ?? 0)),
      elevation: parseFloat(String(pt['ele']   ?? 0)),
      timestamp: pt['time'] ? String(pt['time']) : undefined,
    }))
  )

  const totalDistance    = calculateDistance(trackPoints)
  const estimatedDuration = Math.round((totalDistance / 1000 / 5) * 60) // 5 km/h

  return { name, description, waypoints, trackPoints, totalDistance, estimatedDuration }
}

function calculateDistance(
  points: Array<{ lat: number; lon: number }>
): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat,     points[i].lon
    )
  }
  return total
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
