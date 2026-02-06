import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for donations (replace with database in production)
let donations: any[] = []

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(donations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const donation = await request.json()
    donations.unshift(donation)

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}
