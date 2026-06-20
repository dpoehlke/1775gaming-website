import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email:     email.toLowerCase().trim(),
        source:    source || 'homepage',
        confirmed: false,
      }])

    if (error) {
      // Postgres unique constraint violation = duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { duplicate: true, message: 'You are already on the list!' },
          { status: 200 }
        )
      }
      throw error
    }

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error('Newsletter error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
