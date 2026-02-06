import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for activities (replace with database in production)
let activities: any[] = []

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const activity = await request.json()
    activities.unshift(activity)

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
