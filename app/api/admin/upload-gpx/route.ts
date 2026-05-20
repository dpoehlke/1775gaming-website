/**
 * POST /api/admin/upload-gpx
 *
 * Parses a GPX file and inserts the route, AR anchor POIs,
 * and full track waypoints into Supabase.
 *
 * Password is checked server-side using ADMIN_PASSWORD
 * (no NEXT_PUBLIC_ prefix — never exposed to the browser).
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { parseGPXServer } from '@/lib/gpx-parser-server'

// Service-role client — bypasses RLS for admin writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData    = await request.formData()
    const password    = formData.get('password')   as string
    const file        = formData.get('gpx')        as File | null
    const missionName = formData.get('name')        as string | null
    const missionType = (formData.get('type')       as string) || 'patrol'
    const difficulty  = (formData.get('difficulty') as string) || 'normal'
    const city        = formData.get('city')        as string | null
    const state       = formData.get('state')       as string | null
    const isTest      = formData.get('is_test') === 'true'

    // ── Server-side auth ────────────────────────────────────────────────────
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No GPX file provided' }, { status: 400 })
    }

    // ── Parse GPX ───────────────────────────────────────────────────────────
    const gpxContent = await file.text()
    const gpxData    = parseGPXServer(gpxContent)

    // ── Insert mission route ────────────────────────────────────────────────
    const { data: route, error: routeError } = await supabaseAdmin
      .from('mission_routes')
      .insert([{
        name:                       (missionName?.trim() || gpxData.name).slice(0, 200),
        description:                gpxData.description || null,
        difficulty,
        mission_type:               missionType,
        city:                       city?.trim() || null,
        state:                      state?.trim() || null,
        distance_meters:            gpxData.totalDistance,
        estimated_duration_minutes: gpxData.estimatedDuration,
        is_active:                  false,  // admin activates manually in Supabase
        is_test:                    isTest,
        gpx_raw:                    gpxContent,
        metadata: {
          waypoint_count:    gpxData.waypoints.length,
          track_point_count: gpxData.trackPoints.length,
          uploaded_at:       new Date().toISOString(),
          original_filename: file.name,
        },
      }])
      .select()
      .single()

    if (routeError) throw routeError

    // ── Insert waypoints as AR anchor POIs ──────────────────────────────────
    if (gpxData.waypoints.length > 0) {
      const { error: poiError } = await supabaseAdmin
        .from('points_of_interest')
        .insert(
          gpxData.waypoints.map((wpt, i) => ({
            route_id:        route.id,
            name:            (wpt.name || `Waypoint ${i + 1}`).slice(0, 200),
            description:     wpt.description || null,
            poi_type:        'landmark',
            latitude:        wpt.lat,
            longitude:       wpt.lon,
            elevation_meters: wpt.elevation || null,
            sequence_order:  i + 1,
            ar_anchor:       true,
            is_active:       true,
          }))
        )
      if (poiError) throw poiError
    }

    // ── Insert track points in batches of 500 ──────────────────────────────
    if (gpxData.trackPoints.length > 0) {
      const allWaypoints = gpxData.trackPoints.map((pt, i) => ({
        route_id:           route.id,
        sequence_order:     i + 1,
        latitude:           pt.lat,
        longitude:          pt.lon,
        elevation_meters:   pt.elevation || null,
        timestamp_original: pt.timestamp || null,
      }))

      for (let i = 0; i < allWaypoints.length; i += 500) {
        const { error } = await supabaseAdmin
          .from('route_waypoints')
          .insert(allWaypoints.slice(i, i + 500))
        if (error) throw error
      }
    }

    return NextResponse.json({
      success:                     true,
      route_id:                    route.id,
      name:                        route.name,
      waypoints_created:           gpxData.waypoints.length,
      track_points_created:        gpxData.trackPoints.length,
      distance_meters:             gpxData.totalDistance,
      estimated_duration_minutes:  gpxData.estimatedDuration,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('[upload-gpx]', message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
