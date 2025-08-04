import { Gym } from "../types";

const KAKAO_API_KEY = import.meta.env.VITE_LOCATION_REST_MAP_API_KEY;

export async function fetchGymsByKeyword(
  query: string,
  pos: { lat: number; lng: number }
): Promise<Gym[]> {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query
    )}&x=${pos.lng}&y=${pos.lat}&radius=5000`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    }
  );

  const data = await res.json();
  return data.documents;
}
