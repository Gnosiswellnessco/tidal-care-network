'use client'

import { useEffect, useRef } from 'react'

type MapProvider = {
  id: string
  full_name: string
  credentials: string | null
  practice_name: string | null
  is_org: boolean
  latitude: number
  longitude: number
  label: string | null
  visibility: string
  categories: string[]
  tags: string[]
  bio: string | null
}

const teal = '#3e6a70'
const dark = '#2c4d52'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

declare global {
  interface Window { google?: any }
}

export default function DirectoryMap({
  providers,
  selectedIds = [],
  onAddToReferral,
}: {
  providers: MapProvider[]
  selectedIds?: string[]
  onAddToReferral?: (id: string) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObj = useRef<any>(null)
  const overlays = useRef<any[]>([])
  const infoWindow = useRef<any>(null)
  const cbRef = useRef(onAddToReferral)
  const selRef = useRef(selectedIds)

  useEffect(() => { cbRef.current = onAddToReferral }, [onAddToReferral])
  useEffect(() => { selRef.current = selectedIds }, [selectedIds])

  // Load the Google Maps script once
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (window.google && window.google.maps) { initMap(); return }
    const existing = document.getElementById('tcn-gmaps') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', initMap)
      return () => existing.removeEventListener('load', initMap)
    }
    const script = document.createElement('script')
    script.id = 'tcn-gmaps'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-draw overlays whenever the provider list changes
  useEffect(() => {
    if (mapObj.current) renderOverlays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers])

  function initMap() {
    if (!mapRef.current || !window.google) return
    if (!mapObj.current) {
      mapObj.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 32.7765, lng: -79.9311 },
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
      })
      infoWindow.current = new window.google.maps.InfoWindow()
    }
    renderOverlays()
  }

  function buildContent(p: MapProvider) {
    const title = p.is_org
      ? (p.practice_name || p.full_name)
      : `${p.full_name}${p.credentials ? ', ' + p.credentials : ''}`
    const practice = p.practice_name && !p.is_org
      ? `<div style="font-size:12px;color:#888;margin-bottom:6px;">${esc(p.practice_name)}</div>`
      : ''
    const cats = p.categories.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">${p.categories.slice(0, 4).map((c) => `<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;background:#e8eff0;color:${dark};">${esc(c)}</span>`).join('')}</div>`
      : ''
    const tags = p.tags.length
      ? `<div style="font-size:11px;color:#666;margin-bottom:6px;line-height:1.4;">${p.tags.slice(0, 6).map(esc).join(' &middot; ')}${p.tags.length > 6 ? ' &hellip;' : ''}</div>`
      : ''
    const bioSnippet = p.bio
      ? `<div style="font-size:12px;color:#555;line-height:1.5;margin-bottom:10px;">${esc(p.bio.length > 140 ? p.bio.slice(0, 140).trim() + '\u2026' : p.bio)}</div>`
      : ''
    const already = selRef.current.includes(p.id)
    const addBtn = `<button id="tcn-add-${p.id}" ${already ? 'disabled' : ''} style="font-size:12px;font-weight:600;padding:7px 12px;border-radius:8px;border:none;background:${already ? '#9bb7ba' : teal};color:white;cursor:${already ? 'default' : 'pointer'};">${already ? 'Added \u2713' : '+ Add to referral'}</button>`
    const viewLink = `<a href="/provider/${p.id}" style="font-size:12px;font-weight:600;color:${teal};text-decoration:none;padding:7px 4px;">View profile \u2192</a>`
    return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:240px;padding:2px 2px 4px;">
      <div style="font-size:15px;font-weight:700;color:${dark};margin-bottom:2px;">${esc(title)}</div>
      ${practice}${cats}${tags}${bioSnippet}
      <div style="display:flex;align-items:center;gap:8px;">${addBtn}${viewLink}</div>
    </div>`
  }

  function openInfo(p: MapProvider, position: any) {
    if (!infoWindow.current) return
    infoWindow.current.setContent(buildContent(p))
    infoWindow.current.setPosition(position)
    infoWindow.current.open(mapObj.current)
    window.google.maps.event.addListenerOnce(infoWindow.current, 'domready', () => {
      const btn = document.getElementById(`tcn-add-${p.id}`)
      if (btn) {
        btn.addEventListener('click', () => {
          if (cbRef.current) cbRef.current(p.id)
          btn.textContent = 'Added \u2713'
          ;(btn as HTMLButtonElement).disabled = true
          btn.style.background = '#9bb7ba'
          btn.style.cursor = 'default'
        })
      }
    })
  }

  function renderOverlays() {
    if (!window.google || !mapObj.current) return
    overlays.current.forEach((o) => o.setMap(null))
    overlays.current = []
    const bounds = new window.google.maps.LatLngBounds()
    let count = 0
    providers.forEach((p) => {
      const pos = { lat: p.latitude, lng: p.longitude }
      if (p.visibility === 'area' || p.visibility === 'telehealth_area') {
        // Privacy: soft area circle, no exact pin — but still clickable
        const circle = new window.google.maps.Circle({
          map: mapObj.current, center: pos, radius: 3000,
          strokeColor: teal, strokeOpacity: 0.4, strokeWeight: 1,
          fillColor: teal, fillOpacity: 0.12,
        })
        circle.addListener('click', () => openInfo(p, pos))
        overlays.current.push(circle)
      } else {
        const marker = new window.google.maps.Marker({ map: mapObj.current, position: pos, title: p.full_name })
        marker.addListener('click', () => openInfo(p, pos))
        overlays.current.push(marker)
      }
      bounds.extend(pos)
      count++
    })
    if (count > 1) mapObj.current.fitBounds(bounds)
    else if (count === 1) { mapObj.current.setCenter(bounds.getCenter()); mapObj.current.setZoom(13) }
  }

  return <div ref={mapRef} style={{ width: '100%', height: 560, borderRadius: 12, border: '1px solid #e5e3dc' }} />
}