/**
 * GPX Parser — client-side (browser DOMParser)
 * Used in React components to preview GPX before upload.
 */

export interface GPXWaypoint {
  lat: number
  lon: number
  elevation?: number
  name?: string
  description?: string
  timestamp?: string
}

export interface GPXTrackPoint {
  lat: number
  lon: number
  elevation?: number
  timestamp?: string
}

export interface GPXData {
  name: string
  description?: string
  waypoints: GPXWaypoint[]
  trackPoints: GPXTrackPoint[]
  totalDistance: number
  estimatedDuration: number
}

export function parseGPX(gpxContent: string): GPXData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(gpxContent, 'application/xml')

  const name =
    doc.querySelector('metadata > name')?.textContent ||
    doc.querySelector('trk > name')?.textContent ||
    'Unnamed Route'

  const description =
    doc.querySelector('metadata > desc')?.textContent ||
    doc.querySelector('trk > desc')?.textContent ||
    ''

  // Parse waypoints (become AR anchor POIs)
  const waypoints: GPXWaypoint[] = Array.from(
    doc.querySelectorAll('wpt')
  ).map((wpt) => ({
    lat: parseFloat(wpt.getAttribute('lat') || '0'),
    lon: parseFloat(wpt.getAttribute('lon') || '0'),
    elevation: parseFloat(wpt.querySelector('ele')?.textContent || '0'),
    name: wpt.querySelector('name')?.textContent || '',
    description: wpt.querySelector('desc')?.textContent || '',
    timestamp: wpt.querySelector('time')?.textContent ?? undefined,
  }))

  // Parse track points (the full route path)
  const trackPoints: GPXTrackPoint[] = Array.from(
    doc.querySelectorAll('trkpt')
  ).map((trkpt) => ({
    lat: parseFloat(trkpt.getAttribute('lat') || '0'),
    lon: parseFloat(trkpt.getAttribute('lon') || '0'),
    elevation: parseFloat(trkpt.querySelector('ele')?.textContent || '0'),
    timestamp: trkpt.querySelector('time')?.textContent ?? undefined,
  }))

  const totalDistance = calculateDistance(trackPoints)
  const estimatedDuration = Math.round((totalDistance / 1000 / 5) * 60) // 5 km/h walk

  return { name, description, waypoints, trackPoints, totalDistance, estimatedDuration }
}

function calculateDistance(points: GPXTrackPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat,     points[i].lon
    )
  }
  return total
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6_371_000 // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
