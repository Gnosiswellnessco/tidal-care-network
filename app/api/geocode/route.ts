import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { address } = await req.json()
  if (!address || !address.trim()) {
    return NextResponse.json({ error: 'No address provided' }, { status: 400 })
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'Maps key not configured' }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status !== 'OK' || !data.results?.[0]) {
      return NextResponse.json({ error: 'Could not geocode', status: data.status }, { status: 200 })
    }
    const loc = data.results[0].geometry.location
    return NextResponse.json({ latitude: loc.lat, longitude: loc.lng })
  } catch {
    return NextResponse.json({ error: 'Geocoding request failed' }, { status: 500 })
  }
}
