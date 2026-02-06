import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (shared with main donations route)
const getDonations = () => {
  // This would normally come from a database
  // For now, returning mock data structure
  return []
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donations = getDonations()
    const donation = donations.find((d: any) => d.id === params.id)

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(donation)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}
