export interface Gym {
  id: string;
  name: string;
  type: "짐" | "피트니스" | "크로스핏"; // 또는 enum으로 추출 가능
  address: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
  latitude: number;
  longitude: number;
}
