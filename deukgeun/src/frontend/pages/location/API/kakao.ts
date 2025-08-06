import { Gym } from "../types";
import { KAKAO_CONFIG } from "@shared/lib/env";

const KAKAO_API_KEY = KAKAO_CONFIG.REST_API_KEY;
console.log("Kakao REST API Key:", KAKAO_API_KEY);

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
