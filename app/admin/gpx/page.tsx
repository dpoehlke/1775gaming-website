'use client'
import { useState } from 'react'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadResult {
  success?: boolean
  route_id?: string
  name?: string
  waypoints_created?: number
  track_points_created?: number
  distance_meters?: number
  estimated_duration_minutes?: number
  error?: string
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#0D0D0D',
  border: '1px solid #333',
  color: 'white',
  padding: '10px 12px',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  color: '#B8860B',
  display: 'block',
  marginBottom: '8px',
  fontSize: '11px',
  letterSpacing: '0.12em',
  fontWeight: 600,
}

export default function GPXUploadPage() {
  const [file,   setFile]   = useState<File | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [form,   setForm]   = useState({
    name:       '',
    type:       'patrol',
    difficulty: 'normal',
    city:       '',
    state:      '',
    is_test:    'true',
  })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!file) return
    setStatus('uploading')
    setResult(null)

    const formData = new FormData()
    formData.append('gpx',        file)
    formData.append('name',       form.name)
    formData.append('type',       form.type)
    formData.append('difficulty', form.difficulty)
    formData.append('city',       form.city)
    formData.append('state',      form.state)
    formData.append('is_test',    form.is_test)

    try {
      const res  = await fetch('/api/admin/upload-gpx', { method: 'POST', body: formData })
      const data = await res.json() as UploadResult
      setResult(data)
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setResult({ error: 'Network error — check console' })
      setStatus('error')
    }
  }

  return (
    <div style={{
      color:      'white',
      fontFamily: 'IBM Plex Sans, sans-serif',
    }}>
      {/* Header */}
      <h1 style={{
        fontFamily:    'Bebas Neue, sans-serif',
        fontSize:      '42px',
        color:         '#CC0000',
        margin:        '0 0 4px',
        letterSpacing: '0.05em',
      }}>
        GPX MISSION UPLOADER
      </h1>
      <p style={{ color: '#666', margin: '0 0 32px', fontSize: '13px' }}>
        Upload GPX files to create mission routes and AR anchor points
      </p>

      {/* Upload Form */}
      <div style={{
        background:   '#1A1A1A',
        padding:      '32px',
        borderRadius: '8px',
        border:       '1px solid #333',
        maxWidth:     '620px',
      }}>

        {/* File picker */}
        <div style={{ marginBottom: '20px' }}>
          <label style={LABEL_STYLE}>GPX FILE</label>
          <input
            type="file"
            accept=".gpx,application/gpx+xml"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ color: '#C0C0C0', fontSize: '14px' }}
          />
          {file && (
            <p style={{ color: '#B8860B', fontSize: '12px', marginTop: '6px' }}>
              ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Text fields */}
        {([
          { key: 'name',  label: 'MISSION NAME (optional — overrides GPX name)' },
          { key: 'city',  label: 'CITY' },
          { key: 'state', label: 'STATE' },
        ] as const).map(({ key, label }) => (
          <div key={key} style={{ marginBottom: '20px' }}>
            <label style={LABEL_STYLE}>{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={set(key)}
              style={INPUT_STYLE}
            />
          </div>
        ))}

        {/* Select row */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap:                 '16px',
          marginBottom:        '28px',
        }}>
          {([
            {
              key: 'type', label: 'TYPE',
              options: [
                { value: 'patrol',      label: 'Patrol'      },
                { value: 'mission',     label: 'Mission'     },
                { value: 'exploration', label: 'Exploration' },
                { value: 'pvp',         label: 'PvP Zone'    },
              ],
            },
            {
              key: 'difficulty', label: 'DIFFICULTY',
              options: [
                { value: 'easy',       label: 'Easy'       },
                { value: 'normal',     label: 'Normal'     },
                { value: 'hard',       label: 'Hard'       },
                { value: 'legendary',  label: 'Legendary'  },
              ],
            },
            {
              key: 'is_test', label: 'MODE',
              options: [
                { value: 'true',  label: 'Test'       },
                { value: 'false', label: 'Production' },
              ],
            },
          ] as const).map(({ key, label, options }) => (
            <div key={key}>
              <label style={LABEL_STYLE}>{label}</label>
              <select value={form[key]} onChange={set(key)} style={INPUT_STYLE}>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={status === 'uploading' || !file}
          style={{
            width:         '100%',
            background:    status === 'uploading' ? '#555' : '#CC0000',
            color:         'white',
            border:        '2px solid #B8860B',
            padding:       '14px',
            fontSize:      '18px',
            fontFamily:    'Bebas Neue, sans-serif',
            letterSpacing: '0.12em',
            borderRadius:  '4px',
            cursor:        status === 'uploading' || !file ? 'not-allowed' : 'pointer',
            opacity:       !file ? 0.6 : 1,
            transition:    'background 0.2s',
          }}
        >
          {status === 'uploading' ? 'UPLOADING…' : 'UPLOAD MISSION ROUTE'}
        </button>
      </div>

      {/* Result panel */}
      {status === 'success' && result && (
        <div style={{
          marginTop:    '24px',
          background:   '#0D2E0D',
          border:       '1px solid #00AA00',
          padding:      '24px',
          borderRadius: '8px',
          maxWidth:     '620px',
        }}>
          <p style={{ color: '#00AA00', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', margin: '0 0 12px' }}>
            ✅ MISSION ROUTE UPLOADED
          </p>
          {[
            ['Name',       result.name],
            ['AR Anchors', result.waypoints_created],
            ['Track pts',  result.track_points_created],
            ['Distance',   result.distance_meters !== undefined
              ? `${(result.distance_meters / 1000).toFixed(2)} km` : '—'],
            ['Est. time',  result.estimated_duration_minutes !== undefined
              ? `${result.estimated_duration_minutes} min` : '—'],
          ].map(([k, v]) => (
            <p key={String(k)} style={{ color: '#C0C0C0', margin: '4px 0' }}>
              <span style={{ color: '#B8860B' }}>{k}:</span> {String(v)}
            </p>
          ))}
          <p style={{ color: '#B8860B', fontSize: '11px', marginTop: '12px', letterSpacing: '0.05em' }}>
            Route ID: {result.route_id}
          </p>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
            Route is INACTIVE. Go to Supabase → Table Editor → mission_routes and set is_active = true when ready.
          </p>
        </div>
      )}

      {status === 'error' && result && (
        <div style={{
          marginTop:    '24px',
          background:   '#2E0D0D',
          border:       '1px solid #CC0000',
          padding:      '20px',
          borderRadius: '8px',
          maxWidth:     '620px',
        }}>
          <p style={{ color: '#CC0000', margin: 0 }}>❌ {result.error}</p>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop:    '40px',
        background:   '#1A1A1A',
        padding:      '24px',
        borderRadius: '8px',
        border:       '1px solid #333',
        maxWidth:     '620px',
      }}>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#B8860B', margin: '0 0 16px', letterSpacing: '0.08em' }}>
          HOW TO USE
        </h2>
        <ol style={{ color: '#C0C0C0', lineHeight: 2, paddingLeft: '20px', margin: 0 }}>
          <li>Upload a GPX file exported from Google Maps, Strava, AllTrails, or a GPS device</li>
          <li>Named <code style={{ color: '#B8860B' }}>&lt;wpt&gt;</code> waypoints in the GPX become AR anchor points</li>
          <li>The <code style={{ color: '#B8860B' }}>&lt;trkpt&gt;</code> track becomes the walkable mission path</li>
          <li>Leave <strong>Mode = Test</strong> until the route is verified in-game</li>
          <li>After upload, go to <strong>Supabase → mission_routes</strong> and set <code style={{ color: '#B8860B' }}>is_active = true</code></li>
          <li>The game fetches routes via <code style={{ color: '#B8860B' }}>GET /api/routes/nearby?lat=&amp;lon=</code></li>
        </ol>
      </div>
    </div>
  )
}
