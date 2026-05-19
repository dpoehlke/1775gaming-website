import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields (form sends camelCase)
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('beta_signups')
      .select('id')
      .eq('email', body.email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already registered for beta testing' },
        { status: 409 }
      )
    }

    // Map camelCase form fields → snake_case DB columns
    const { error } = await supabase
      .from('beta_signups')
      .insert([{
        first_name:    body.firstName,
        last_name:     body.lastName,
        email:         body.email.toLowerCase().trim(),
        age_range:     body.ageRange    || null,
        platform:      body.platform    || null,
        hours_per_week: body.hoursPerWeek || null,
        genres:        body.genres       || [],
        prior_beta:    body.betaTested === 'yes',
        device_model:  body.deviceModel  || null,
        why_beta:      body.whyTest      || null,
        heard_from:    body.heardFrom    || null,
        nda_agreed:    body.agreeNDA     === true,
        status:        'pending',
      }])

    if (error) throw error

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error('Beta signup error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
