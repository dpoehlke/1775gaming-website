/**
 * GET /api/routes/nearby?lat=XX&lon=YY&radius=50000
 *
 * Public endpoint the Omniverse mobile game calls to load
 * active mission routes and their AR anchor POIs.
 *
 * Query params:
 *   lat     — player latitude  (optional; omit to return all active routes)
 *   lon     — player longitude (optional)
 *   radius  — metres to search (default 50 000 = 50 km)
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { haversineDistance } from '@/lib/gpx-parser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const latParam    = searchParams.get('lat')
  const lonParam    = searchParams.get('lon')
  const radiusParam = searchParams.get('radius')

  const lat    = latParam    ? parseFloat(latParam)    : null
  const lon    = lonParam    ? parseFloat(lonParam)    : null
  const radius = radiusParam ? parseFloat(radiusParam) : 50_000

  try {
    const { data: routes, error } = await supabase
      .from('mission_routes')
      .select(`
        id,
        name,
        description,
        difficulty,
        mission_type,
        city,
        state,
        distance_meters,
        estimated_duration_minutes,
        points_of_interest (
          id,
          name,
          description,
          poi_type,
          latitude,
          longitude,
          sequence_order,
          ar_anchor,
          game_event
        )
      `)
      .eq('is_active', true)
      .eq('is_test',   false)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filter by proximity when coordinates are supplied
    const filtered =
      lat !== null && lon !== null
        ? (routes ?? []).filter((route) => {
            const pois = (route.points_of_interest ?? []) as Array<{
              latitude: number
              longitude: number
            }>
            if (pois.length === 0) return true
            return pois.some(
              (poi) => haversineDistance(lat, lon, poi.latitude, poi.longitude) <= radius
            )
          })
        : (routes ?? [])

    return NextResponse.json({
      success: true,
      count:   filtered.length,
      routes:  filtered,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
