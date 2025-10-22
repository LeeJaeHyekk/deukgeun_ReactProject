"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertWGS84ToTM = convertWGS84ToTM;
exports.convertTMToWGS84 = convertTMToWGS84;
const RE = 6371.00877;
const GRID = 5.0;
const SLAT1 = 30.0;
const SLAT2 = 60.0;
const OLON = 126.0;
const OLAT = 38.0;
const XO = 43;
const YO = 136;
function convertWGS84ToTM(lat, lon) {
    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;
    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
        Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);
    let rs;
    let theta;
    if (lat !== 0) {
        rs = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
        rs = (re * sf) / Math.pow(rs, sn);
    }
    else {
        rs = 0;
    }
    theta = lon * DEGRAD - olon;
    if (theta > Math.PI)
        theta -= 2.0 * Math.PI;
    if (theta < -Math.PI)
        theta += 2.0 * Math.PI;
    theta *= sn;
    const x = Math.floor(rs * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - rs * Math.cos(theta) + YO + 0.5);
    return { x, y };
}
function convertTMToWGS84(x, y) {
    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;
    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
        Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);
    const rs = ro - (y - YO);
    const theta = Math.atan((x - XO) / rs);
    const lon = theta / sn + olon;
    const lat = Math.atan(Math.pow((re * sf) / rs, 1 / sn)) * 2 - Math.PI * 0.5;
    return { lat: lat / DEGRAD, lon: lon / DEGRAD };
}
