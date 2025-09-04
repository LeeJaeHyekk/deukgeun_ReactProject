import { useEffect, useRef, useState } from "react"
import { Gym } from "../../types/index"
import { KAKAO_CONFIG } from "@shared/lib/env"

interface MapViewProps {
  gyms: Gym[]
  selectedGym?: Gym | null
  onGymSelect?: (gym: Gym) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

export const MapView = ({ gyms, selectedGym, onGymSelect, center, zoom }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  const KAKAO_API_KEY = KAKAO_CONFIG.API_KEY
  const CENTER_LAT = KAKAO_CONFIG.CENTER_LAT
  const CENTER_LNG = KAKAO_CONFIG.CENTER_LNG
  const DEFAULT_ZOOM = zoom || KAKAO_CONFIG.ZOOM_LEVEL

  // ✅ SDK 로딩은 컴포넌트 내부에서 수행
  useEffect(() => {
    if (window.kakao && window.kakao.maps) return

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => {
        // console.log("Kakao Maps SDK loaded") // 로그 제거
      })
    }
    document.head.appendChild(script)
  }, [KAKAO_API_KEY])

  // ✅ 지도 생성 및 마커 렌더링
  useEffect(() => {
    if (!center || !window.kakao || !mapRef.current || !window.kakao.maps)
      return

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: DEFAULT_ZOOM,
    })

    gyms.forEach(gym => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(gym.latitude, gym.longitude),
      })
      marker.setMap(map)
    })
  }, [center, gyms, DEFAULT_ZOOM])

  return (
    <div id="map" ref={mapRef} style={{ width: "100%", height: "400px" }} />
  )
}
