// import { useEffect, useRef } from "react";
// import { Gym } from "../../types/index";

// interface Props {
//   position: { lat: number; lng: number } | null;
//   gyms: Gym[];
// }

// useEffect(() => {
//   if (window.kakao && window.kakao.maps) return;

//   const script = document.createElement("script");
//   script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
//     import.meta.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY
//   }&autoload=false`;
//   script.async = true;
//   script.onload = () => {
//     window.kakao.maps.load(() => {
//       console.log("Kakao Maps SDK loaded");
//     });
//   };
//   document.head.appendChild(script);
// }, []);

// export const MapView = ({ position, gyms }: Props) => {
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!position || !window.kakao || !mapRef.current) return;

//     const map = new window.kakao.maps.Map(mapRef.current, {
//       center: new window.kakao.maps.LatLng(position.lat, position.lng),
//       level: 4,
//     });

//     gyms.forEach((gym) => {
//       const marker = new window.kakao.maps.Marker({
//         position: new window.kakao.maps.LatLng(gym.y, gym.x),
//       });
//       marker.setMap(map);
//     });
//   }, [position, gyms]);

//   return (
//     <div id="map" ref={mapRef} style={{ width: "100%", height: "400px" }} />
//   );
// };

import { useEffect, useRef } from "react";
import { Gym } from "../../types/index";
import { KAKAO_CONFIG } from "@shared/lib/env";

interface Props {
  position: { lat: number; lng: number } | null;
  gyms: Gym[];
}

export const MapView = ({ position, gyms }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // ✅ SDK 로딩은 컴포넌트 내부에서 수행
  useEffect(() => {
    if (window.kakao && window.kakao.maps) return;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_CONFIG.JAVASCRIPT_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("Kakao Maps SDK loaded");
      });
    };
    document.head.appendChild(script);
  }, []);

  // ✅ 지도 생성 및 마커 렌더링
  useEffect(() => {
    if (!position || !window.kakao || !mapRef.current || !window.kakao.maps)
      return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(position.lat, position.lng),
      level: 4,
    });

    gyms.forEach((gym) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(gym.y, gym.x),
      });
      marker.setMap(map);
    });
  }, [position, gyms]);

  return (
    <div id="map" ref={mapRef} style={{ width: "100%", height: "400px" }} />
  );
};
