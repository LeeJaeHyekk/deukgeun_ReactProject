import { connectDatabase } from "../config/database"
import { MachineService } from "../services/machineService"
import type { CreateMachineRequest } from "../../types/machine"

/**
 * Machine 데이터 임포트 스크립트
 * list.json의 데이터를 Machine DB에 추가합니다.
 */
const machineDataList: CreateMachineRequest[] = [
  {
    machine_key: "ground_base_combo_incline",
    name_ko: "그라운드 베이스 콤보 인클라인",
    name_en: "Ground‑Base Combo Incline",
    image_url: "/img/machine/ground_base_combo_incline.png",
    short_desc:
      "양쪽 반응형 핸들로 회전 동작과 인클라인 프레스를 동시에 수행 가능한 복합 상체 머신.",
    detail_desc:
      "Hammer Strength(또는 360 Sports)의 Ground‑Base Combo Incline는 반대 방향으로 로딩되는 핸들을 통해 인클라인 프레스, 푸쉬‑풀, 하이 로우 등 다양한 상체 운동이 가능하도록 설계되었습니다. 사용자는 단단히 발을 바닥에 고정한 상태에서 회전성 있는 경사 동작을 수행하며, 이는 운동 시 폭발적인 힘 전달과 전신 안정성을 모두 향상시킵니다.",
    positive_effect:
      "자세 안정성을 유지하면서 상체 힘과 코어 안정, 협응력을 동시에 강화할 수 있습니다. 단일 또는 양측 동작으로 근육 발달과 균형성 모두 향상됩니다.",
    category: "상체",
    target_muscle: ["가슴 상부", "어깨", "삼두근", "광배근", "코어"],
    difficulty_level: "중급",
    video_url: undefined,
  },
  {
    machine_key: "chin_up_and_dip_station",
    name_ko: "친업 & 딥 스테이션",
    name_en: "Plate‑Loaded Assisted Chin‑Up and Dip Station",
    image_url: "/img/machine/chin_up_and_dip_station.png",
    short_desc:
      "체중의 일부를 보조하여 친업과 딥을 모두 수행할 수 있는 플레이트 로드 방식의 복합 상체 기구.",
    detail_desc:
      "Titan Fitness의 Plate‑Loaded Assisted Chin‑Up and Dip Machine은 사용자의 체중 일부를 보조할 수 있는 플레이트 로드 방식을 채택해, 처음부터 완전 체중 동작이 어려운 운동자에게도 친업과 딥 동작을 수행하게 해 줍니다. 접이식 무릎 패드, 다양한 그립 옵션, 부드러운 나일론 롤러와 풀리 시스템을 통해 안정적이고 매끄러운 동작이 가능합니다.",
    positive_effect:
      "근력 수준이 낮은 사용자도 기술 향상이 가능한 상태에서 상체 근육(등, 이두근, 삼두근, 가슴)을 단계적으로 강화할 수 있습니다.",
    category: "상체",
    target_muscle: ["광배근", "이두근", "삼두근", "대흉근", "코어"],
    difficulty_level: "초급",
    video_url: undefined,
  },
  {
    machine_key: "ground_base_combo_incline2",
    name_ko: "그라운드 베이스 콤보 인클라인 2",
    name_en: "Ground‑Base Combo Incline (Version 2)",
    image_url: "/img/machine/ground_base_combo_incline2.png",
    short_desc:
      "반대 방향으로 하중이 걸리며 비틀림 동작을 가능한 인클라인 복합 상체 머신.",
    detail_desc:
      "Ground‑Base Combo Incline은 반대 지점에 하중을 걸어 경사진 평면에서 비틀림 동작을 수행할 수 있도록 설계된 플레이트 로드 머신입니다. 인클라인 프레스, 푸쉬‑풀, 하이 로우 등의 상체 운동이 가능하며, 단일 또는 양측 그립을 통해 코어 및 상체의 협응력을 강화할 수 있습니다. 사용자의 발은 바닥에 견고히 고정되어 폭발적인 힘 전달과 안정성을 제공합니다.",
    positive_effect:
      "운동 시 안정된 자세 유지, 상체 근력 및 코어 협응력 강화, 공간 효율적인 설계로 다양한 운동 구현 가능.",
    category: "상체",
    target_muscle: ["상부 가슴", "어깨", "삼두근", "광배근", "코어"],
    difficulty_level: "중급",
    video_url: undefined,
  },
  {
    machine_key: "selectorized_lat_pulldown",
    name_ko: "셀렉터라이즈드 랫 풀다운",
    name_en: "Selectorized Lat Pulldown Machine",
    image_url: "/img/machine/selectorized_lat_pulldown.png",
    short_desc: "광배근을 집중적으로 단련하는 셀렉터 핀 방식의 랫 풀다운 머신.",
    detail_desc:
      "셀렉터라이즈드 랫 풀다운 머신은 핀을 선택해 무게를 조절하는 방식으로 사용자가 안전하고 편리하게 다양한 부하로 광배근 운동을 수행할 수 있게 설계된 장비입니다. 앉아서 손잡이를 잡고 아래로 끌어내리는 동작을 통해 등 근육을 효과적으로 강화합니다. 대부분의 체육관에 흔히 설치되어 있으며, 운동 초보자부터 전문가까지 폭넓게 사용됩니다.",
    positive_effect:
      "광배근과 상부 등 근육을 강화하며, 등 넓이를 키우는 데 효과적입니다. 운동 범위 조절이 용이해 부상 위험을 줄이고, 등 근육의 자세한 조절이 가능합니다.",
    category: "상체",
    target_muscle: ["광배근", "승모근", "이두근"],
    difficulty_level: "초급",
    video_url: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  },
  {
    machine_key: "selectorized_prone_leg_curl",
    name_ko: "셀렉터라이즈드 프론 레그 컬",
    name_en: "Selectorized Prone Leg Curl Machine",
    image_url: "/img/machine/selectorized_prone_leg_curl.png",
    short_desc:
      "햄스트링 근육을 집중적으로 단련하는 셀렉터 핀 방식의 프론 레그 컬 머신.",
    detail_desc:
      "셀렉터라이즈드 프론 레그 컬 머신은 핀 선택식 저항 조절 방식으로 사용자가 앉은 자세에서 다리 뒤쪽 근육인 햄스트링을 효과적으로 강화할 수 있도록 설계되었습니다. 프론(복부를 바닥에 대고 누운) 자세에서 무릎 아래 패드를 굴려 다리를 구부리는 운동을 반복하며, 무릎 관절 강화에도 도움을 줍니다.",
    positive_effect:
      "햄스트링 근육 강화 및 무릎 관절 안정성 향상에 효과적이며, 재활 운동에도 자주 활용됩니다.",
    category: "하체",
    target_muscle: ["햄스트링", "슬와근"],
    difficulty_level: "초급",
    video_url: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
  },
  {
    machine_key: "smith_machine",
    name_ko: "스미스 머신",
    name_en: "Smith Machine",
    image_url: "/img/machine/smith_machine.png",
    short_desc:
      "바벨이 고정된 레일에서 수직 또는 약간 경사진 경로로 움직이는 가이드 바벨 머신.",
    detail_desc:
      "스미스 머신은 바벨이 양쪽 레일에 고정되어 있어 안정적인 수직 혹은 약간 경사진 경로로만 움직이며, 다양한 운동(스쿼트, 벤치 프레스, 숄더 프레스 등)에 활용됩니다. 초보자도 쉽게 자세를 유지하며 무게를 조절할 수 있고, 운동 안전성을 높여줍니다.",
    positive_effect:
      "안전한 가이드 덕분에 초보자도 복합 운동을 쉽게 수행할 수 있으며, 보조자가 없어도 무거운 중량 훈련이 가능합니다.",
    category: "상체",
    target_muscle: ["대퇴사두근", "대흉근", "삼각근", "둔근"],
    difficulty_level: "초급",
    video_url: "https://www.youtube.com/watch?v=7J5jEYUvX-c",
  },
  {
    machine_key: "plate_loaded_shoulder_press",
    name_ko: "플레이트 로드 숄더 프레스",
    name_en: "Plate‑Loaded Shoulder Press",
    image_url: "/img/machine/plate_loaded_shoulder_press.png",
    short_desc:
      "플레이트 로드를 사용하여 어깨 근육을 집중적으로 강화하는 숄더 프레스 머신.",
    detail_desc:
      "플레이트 로드 숄더 프레스는 사용자가 앉은 상태에서 손잡이를 밀어 올려 어깨 근육(삼각근 전면, 측면)을 집중적으로 강화할 수 있는 장비입니다. 플레이트 로딩 방식으로 운동 강도를 자유롭게 조절할 수 있으며, 인체공학적 시트와 손잡이 위치가 안정적이고 자연스러운 운동 동작을 유도합니다.",
    positive_effect:
      "삼각근 및 상체 근력 강화에 효과적이며, 견관절 안정성 증진에도 도움을 줍니다.",
    category: "상체",
    target_muscle: ["삼각근(전면, 측면)", "승모근", "삼두근"],
    difficulty_level: "중급",
    video_url: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
  },
  {
    machine_key: "plate_loaded_bicep_curl",
    name_ko: "플레이트 로드 바이셉 컬",
    name_en: "Plate‑Loaded Bicep Curl",
    image_url: "/img/machine/plate_loaded_bicep_curl.png",
    short_desc:
      "플레이트 로드를 이용해 이두근을 집중적으로 단련하는 바이셉 컬 머신.",
    detail_desc:
      "플레이트 로드 바이셉 컬 머신은 사용자가 팔을 고정하고 손잡이를 당겨 이두근을 효과적으로 강화할 수 있도록 설계된 장비입니다. 플레이트 로딩 방식으로 운동 부하를 조절할 수 있으며, 편안한 시트와 팔 받침대가 안정적인 운동 자세를 지원합니다.",
    positive_effect:
      "이두근 발달에 효과적이며, 팔 힘 향상과 근육 균형 개선에 도움을 줍니다.",
    category: "상체",
    target_muscle: ["상완이두근"],
    difficulty_level: "초급",
    video_url: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  },
  {
    machine_key: "plate_loaded_kneeling_leg_curl",
    name_ko: "플레이트 로드 니링 레그 컬",
    name_en: "Plate‑Loaded Kneeling Leg Curl",
    image_url: "/img/machine/plate_loaded_kneeling_leg_curl.png",
    short_desc:
      "무릎 꿇은 자세에서 햄스트링을 집중적으로 강화하는 플레이트 로드 레그 컬 머신.",
    detail_desc:
      "플레이트 로드 니링 레그 컬 머신은 사용자가 무릎 꿇은 상태에서 다리 뒤쪽 근육인 햄스트링을 강화할 수 있도록 설계되었습니다. 플레이트 로딩 방식으로 부하를 조절하며, 인체공학적 패드와 핸들이 안정적이고 효과적인 운동 동작을 지원합니다.",
    positive_effect:
      "햄스트링 강화와 무릎 관절 안정성에 도움을 주며, 근력 균형 및 재활 운동에도 효과적입니다.",
    category: "하체",
    target_muscle: ["햄스트링", "슬와근"],
    difficulty_level: "중급",
    video_url: undefined,
  },
  {
    machine_key: "plate_loaded_multi_station_gym_equipment",
    name_ko: "플레이트 로드 멀티 스테이션 짐 장비",
    name_en: "Plate‑Loaded Multi-Station Gym Equipment",
    image_url: "/img/machine/plate_loaded_multi_station_gym_equipment.png",
    short_desc: "여러 운동 기능을 통합한 플레이트 로드 멀티 스테이션 짐 장비.",
    detail_desc:
      "플레이트 로드 멀티 스테이션 장비는 스쿼트, 벤치 프레스, 로우, 레그 컬 등 다양한 운동을 한 기기에서 수행할 수 있도록 설계되었습니다. 각 스테이션은 플레이트 로드 방식을 사용하여 부하를 쉽게 조절할 수 있으며, 공간 절약형 설계로 소규모 체육관에 적합합니다. 사용자는 복합 운동을 통해 전신 근력과 지구력을 효율적으로 향상시킬 수 있습니다.",
    positive_effect:
      "다양한 근육군을 한 장비에서 강화할 수 있어 운동 효율이 높고, 시간 절약과 공간 활용 면에서 유리합니다.",
    category: "전신",
    target_muscle: [
      "대퇴사두근",
      "햄스트링",
      "대흉근",
      "광배근",
      "삼두근",
      "이두근",
      "삼각근",
    ],
    difficulty_level: "중급",
    video_url: undefined,
  },
]

async function importFromList() {
  let connection

  try {
    // 데이터베이스 연결
    connection = await connectDatabase()
    console.log("데이터베이스에 연결되었습니다.")

    const machineService = new MachineService()
    const shouldUpdate = process.argv.includes("--update")

    console.log(`총 ${machineDataList.length}개의 머신을 처리합니다.`)
    if (shouldUpdate) {
      console.log("업데이트 모드로 실행됩니다.")
    }
    console.log("---")

    for (const machineData of machineDataList) {
      try {
        // 기존 데이터 확인 (machine_key로 중복 체크)
        const existingMachine = await machineService.getMachineByKey(
          machineData.machine_key
        )

        if (existingMachine) {
          console.log(`머신 키 '${machineData.machine_key}'가 이미 존재합니다.`)
          console.log("기존 머신 정보:", {
            id: existingMachine.id,
            name: existingMachine.nameKo,
            category: existingMachine.category,
            difficulty: existingMachine.difficulty,
          })

          if (shouldUpdate) {
            console.log("업데이트를 진행합니다...")
            const updatedMachine = await machineService.updateMachine(
              existingMachine.id,
              machineData as any
            )
            if (updatedMachine) {
              console.log(
                "✅ 머신이 성공적으로 업데이트되었습니다:",
                updatedMachine.nameKo
              )
            } else {
              console.log("❌ 머신 업데이트에 실패했습니다.")
            }
          } else {
            console.log("⏭️  건너뜁니다. (업데이트하려면 --update 플래그 사용)")
          }
        } else {
          // 새 머신 생성
          console.log(`새 머신 '${machineData.name_ko}'을 생성합니다...`)
          const newMachine = await machineService.createMachine(machineData)
          console.log(
            "✅ 새 머신이 성공적으로 생성되었습니다:",
            newMachine.nameKo
          )
          console.log("   생성된 머신 ID:", newMachine.id)
        }

        console.log("---")
      } catch (error) {
        console.error(`❌ 머신 '${machineData.name_ko}' 처리 중 오류:`, error)
        console.log("---")
      }
    }

    console.log("모든 머신 처리 완료!")
  } catch (error) {
    console.error("오류가 발생했습니다:", error)
  } finally {
    if (connection) {
      await connection.close()
      console.log("데이터베이스 연결이 종료되었습니다.")
    }
  }
}

// 스크립트 실행
importFromList().catch(console.error)
