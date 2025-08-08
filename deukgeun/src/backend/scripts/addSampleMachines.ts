import axios from "axios";
import { createTokens } from "../utils/jwt";

const BASE_URL = "http://localhost:5000/api";

// 테스트용 토큰 생성
function createTestTokens(role: "user" | "admin") {
  return createTokens(1, role);
}

// 샘플 기구 데이터
const sampleMachines = [
  {
    machine_key: "chin_up_dip_station_001",
    name_ko: "친업 앤 딥 스테이션",
    name_en: "Chin-up and Dip Station",
    image_url:
      "http://localhost:5000/img/machine/plate_chin-up-and-dip-station.png",
    short_desc: "상체 근력을 종합적으로 발달시키는 기구입니다.",
    detail_desc:
      "친업과 딥스 운동을 할 수 있는 복합 운동 기구로, 가슴, 등, 삼두근 등 상체 전반의 근력을 발달시키는데 매우 효과적입니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["광배근", "대흉근", "삼두근", "이두근"],
    positive_effect: "상체 근력 향상, 코어 강화, 전반적인 근지구력 향상",
    video_url: "https://example.com/videos/chin_up_dip.mp4",
  },
  {
    machine_key: "chest_press_001",
    name_ko: "체스트 프레스",
    name_en: "Chest Press",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "가슴 근육을 강화하는 대표적인 운동 기구입니다.",
    detail_desc:
      "체스트 프레스는 가슴 근육(대흉근)을 주로 발달시키는 운동 기구입니다. 앉아서 하는 운동으로 안정적이고 효과적인 가슴 운동을 할 수 있습니다.",
    category: "상체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대흉근", "삼두근", "삼각근"],
    positive_effect: "가슴 근육 발달, 상체 근력 향상, 자세 개선",
    video_url: "https://example.com/videos/chest_press.mp4",
  },
  {
    machine_key: "lat_pulldown_001",
    name_ko: "랫 풀다운",
    name_en: "Lat Pulldown",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "등 근육을 발달시키는 효과적인 운동 기구입니다.",
    detail_desc:
      "랫 풀다운은 광배근을 주로 발달시키는 운동 기구입니다. 넓은 등 근육을 만드는 데 매우 효과적이며, 자세 개선에도 도움이 됩니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["광배근", "승모근", "이두근"],
    positive_effect: "등 근육 발달, 자세 개선, 상체 근력 향상",
    video_url: "https://example.com/videos/lat_pulldown.mp4",
  },
  {
    machine_key: "leg_press_001",
    name_ko: "레그 프레스",
    name_en: "Leg Press",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "하체 근력을 발달시키는 대표적인 운동 기구입니다.",
    detail_desc:
      "레그 프레스는 하체 근육을 종합적으로 발달시키는 운동 기구입니다. 무릎 관절에 부담을 줄이면서도 효과적인 하체 운동을 할 수 있습니다.",
    category: "하체" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대퇴사두근", "햄스트링", "둔근"],
    positive_effect: "하체 근력 향상, 체력 증진, 기초 대사량 증가",
    video_url: "https://example.com/videos/leg_press.mp4",
  },
  {
    machine_key: "shoulder_press_001",
    name_ko: "숄더 프레스",
    name_en: "Shoulder Press",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "어깨 근육을 발달시키는 효과적인 운동 기구입니다.",
    detail_desc:
      "숄더 프레스는 어깨 근육(삼각근)을 발달시키는 운동 기구입니다. 상체의 균형 잡힌 발달을 위해 중요한 운동입니다.",
    category: "상체" as const,
    difficulty_level: "중급" as const,
    target_muscle: ["삼각근", "삼두근", "승모근"],
    positive_effect: "어깨 근육 발달, 상체 균형 개선, 자세 교정",
    video_url: "https://example.com/videos/shoulder_press.mp4",
  },
  {
    machine_key: "squat_rack_001",
    name_ko: "스쿼트 랙",
    name_en: "Squat Rack",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "전신 근력을 발달시키는 기본 운동 기구입니다.",
    detail_desc:
      "스쿼트 랙은 스쿼트 운동을 위한 기구로, 전신 근력을 발달시키는 가장 효과적인 운동 중 하나입니다.",
    category: "전신" as const,
    difficulty_level: "고급" as const,
    target_muscle: ["대퇴사두근", "햄스트링", "둔근", "복근", "척추기립근"],
    positive_effect: "전신 근력 향상, 체력 증진, 기초 대사량 증가",
    video_url: "https://example.com/videos/squat.mp4",
  },
  {
    machine_key: "treadmill_001",
    name_ko: "러닝머신",
    name_en: "Treadmill",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    short_desc: "유산소 운동을 위한 기본적인 운동 기구입니다.",
    detail_desc:
      "러닝머신은 실내에서 달리기 운동을 할 수 있는 기구로, 심폐 지구력 향상과 체지방 감소에 효과적입니다.",
    category: "전신" as const,
    difficulty_level: "초급" as const,
    target_muscle: ["대퇴사두근", "비복근", "둔근"],
    positive_effect: "심폐 지구력 향상, 체지방 감소, 스트레스 해소",
    video_url: "https://example.com/videos/treadmill.mp4",
  },
];

async function addSampleMachines() {
  console.log("🏋️ 샘플 기구 데이터 추가 시작\n");

  const adminTokens = createTestTokens("admin");

  for (const machine of sampleMachines) {
    try {
      const response = await axios.post(`${BASE_URL}/machines`, machine, {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      });
      console.log(`✅ ${machine.name_ko} 추가 성공`);
    } catch (error: any) {
      if (
        error.response?.status === 500 &&
        error.response?.data?.error?.includes("이미 존재합니다")
      ) {
        console.log(`ℹ️ ${machine.name_ko}는 이미 존재함`);
      } else {
        console.log(
          `❌ ${machine.name_ko} 추가 실패:`,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  console.log("\n🎯 샘플 기구 데이터 추가 완료!");
}

// 스크립트 실행
if (require.main === module) {
  addSampleMachines().catch(console.error);
}

export { addSampleMachines };
