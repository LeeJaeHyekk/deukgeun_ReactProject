import { Repository } from "typeorm";
import { Machine } from "../entities/Machine";

// Machine Repository 타입 정의
export type MachineRepository = Repository<Machine>;

// Machine 생성 요청 타입
export interface CreateMachineRequest {
  machine_key: string;
  name_ko: string;
  name_en?: string;
  image_url: string;
  short_desc: string;
  detail_desc: string;
  positive_effect?: string;
  category: "상체" | "하체" | "전신" | "기타";
  target_muscle?: string[];
  difficulty_level?: "초급" | "중급" | "고급";
  video_url?: string;
}

// Machine 수정 요청 타입
export interface UpdateMachineRequest {
  machine_key?: string;
  name_ko?: string;
  name_en?: string;
  image_url?: string;
  short_desc?: string;
  detail_desc?: string;
  positive_effect?: string;
  category?: "상체" | "하체" | "전신" | "기타";
  target_muscle?: string[];
  difficulty_level?: "초급" | "중급" | "고급";
  video_url?: string;
}

// Machine 필터링 쿼리 타입
export interface MachineFilterQuery {
  category?: string;
  difficulty?: string;
  target?: string;
}

// Machine 응답 타입
export interface MachineResponse {
  message: string;
  data: Machine;
}

// Machine 목록 응답 타입
export interface MachineListResponse {
  message: string;
  data: Machine[];
  count: number;
}

// Machine 필터링 응답 타입
export interface MachineFilterResponse {
  message: string;
  data: Machine[];
  count: number;
  filters: MachineFilterQuery;
}
