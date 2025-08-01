// src/utils/coordinateUtils.ts
export const tmToWgs84 = (
  x: number,
  y: number
): { lat: number; lng: number } => {
  const RE = 6371.00877; // Earth radius (km)
  const GRID = 5.0; // Grid spacing (km)
  const SLAT1 = 30.0; // Projection latitude1 (degree)
  const SLAT2 = 60.0; // Projection latitude2 (degree)
  const OLON = 126.0; // Origin longitude (degree)
  const OLAT = 38.0; // Origin latitude (degree)
  const XO = 43; // Origin X coordinate (GRID)
  const YO = 136; // Origin Y coordinate (GRID)

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  const sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  const snLog = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  const sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  const sfPow = (Math.pow(sf, snLog) * Math.cos(slat1)) / snLog;
  const ro =
    (re * sfPow) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), snLog);

  const xn = x - XO;
  const yn = ro - (y - YO);

  const ra = Math.sqrt(xn * xn + yn * yn);
  const theta = Math.atan2(xn, yn);

  const lat =
    2.0 * Math.atan(Math.pow((re * sfPow) / ra, 1.0 / snLog)) - Math.PI * 0.5;
  const lng = theta / snLog + olon;

  return {
    lat: lat * RADDEG,
    lng: lng * RADDEG,
  };
};
