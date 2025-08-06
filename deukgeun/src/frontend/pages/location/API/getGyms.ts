import { Gym } from "../types";
import { GYM_CONFIG } from "@shared/lib/env";

const API_KEY = GYM_CONFIG.API_KEY;
const SERVICE_NAME = "LOCALDATA_104201";
const DATA_TYPE = "json";
const START_INDEX = 1;
const END_INDEX = 999;

export const getGyms = async (): Promise<Gym[]> => {
  const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/${DATA_TYPE}/${SERVICE_NAME}/${START_INDEX}/${END_INDEX}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch gym list from Seoul OpenAPI");
  }

  const jsonData = await response.json();

  // 실제 데이터가 어느 위치에 있는지 API 스펙에 따라 다를 수 있음
  // 예를 들어, jsonData.LOCALDATA_104201.row 에 배열이 있다고 가정
  const gymsRaw = jsonData?.LOCALDATA_104201?.row;

  if (!gymsRaw || !Array.isArray(gymsRaw)) {
    throw new Error("Invalid data format from Seoul OpenAPI");
  }

  // Gym 타입에 맞게 데이터 매핑 (필요한 필드만 변환)
  const gyms: Gym[] = gymsRaw.map((item: any) => ({
    id: item.MGTNO, // 관리번호를 id로 사용
    name: item.BPLCNM, // 사업장명
    type: "짐", // API 데이터에 따라 수정 필요
    address: item.RDNWHLADDR || item.SITEWHLADDR, // 도로명주소 우선, 없으면 지번주소
    phone: item.SITETEL,
    openTime: undefined, // 필요시 별도 파싱
    closeTime: undefined,
    latitude: Number(item.Y), // Y 좌표 (위도)
    longitude: Number(item.X), // X 좌표 (경도)
  }));

  return gyms;
};
