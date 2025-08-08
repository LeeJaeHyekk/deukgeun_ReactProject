import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// 등록된 정적 자산 목록과 파일명 매핑 (public/img/machine 기준)
// 키는 정규화된 이름(영문)이고 값은 실제 파일명입니다.
const fileNameMap: Record<string, string> = {
  // kebab-case 표준 파일명
  "bicep curl": "bicep-curl.png",
  "chest press": "chest-press.png",
  "chin up and dip station": "chin-up-and-dip-station.png",
  chinup: "chin-up.png",
  "kneeling leg curl": "kneeling-leg-curl.png",
  "leg extension": "leg-extension.png",
  "leg press": "leg-press.png",
  "lat pulldown": "lat-pulldown.png",
  "plate loaded leg press": "plate-loaded-leg-press.png",
  "plate loaded squat": "plate-loaded-squat.png",
  "shoulder press": "shoulder-press.png",
  "squat rack": "squat-rack.png",
  treadmill: "treadmill-running.gif",
  "wide full down": "plate-loaded-wide-pulldown.png",
};

// 추가 별칭(동의어) → 메인 키로 매핑
const aliasMap: Record<string, string> = {
  "chin-up and dip station": "chin up and dip station",
  "chin-up & dip station": "chin up and dip station",
  "lat pull down": "lat pulldown",
  "let pull down": "lat pulldown", // 파일명이 let 이라 안전하게 통일
  pulldown: "lat pulldown",
  // 매칭 실패한 머신들에 대한 유사 매핑 추가
  "plate loaded multi station gym equipment": "wide full down", // 임시로 wide_fullDown.png 사용
  "selectorized prone leg curl": "kneeling leg curl", // Kneeling Leg Curl.png와 유사
  "smith machine": "squat rack", // 임시로 Squat Rack.png 사용
  "ground base combo incline": "chest press", // 임시로 Chest Press.png 사용
  "ground base combo incline version 2": "chest press", // 임시로 Chest Press.png 사용
  "duplicate key test": "chest press", // 테스트 데이터는 임시로 Chest Press.png 사용
  // 정규화 후 매칭을 위한 추가 별칭
  "groundbase combo incline": "chest press",
  "groundbase combo incline version 2": "chest press",
  // 특수문자 제거 후 매칭 (정규화 과정에서 특수문자가 제거됨)
  "plate loaded wide pulldown": "wide full down",
  // 정규화 후 실제 문자열 매칭
  "plateloaded wide pulldown": "wide full down",
  "plate wide fulldown": "wide full down",
};

function normalize(source: string | undefined | null): string {
  if (!source) return "";
  return source
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKeyLike(source: string | undefined | null): string {
  // machine_key에서 숫자 시퀀스 제거 등 가벼운 정리
  const base = normalize(source);
  return base
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function applyAlias(key: string): string {
  return aliasMap[key] ?? key;
}

async function updateMachineImages() {
  console.log("🖼️  머신 이미지 URL 일괄 업데이트 시작\n");

  // 1) 전체 머신 조회
  const list = await axios.get(`${BASE_URL}/machines`);
  const machines: any[] = list.data?.data || [];
  if (machines.length === 0) {
    console.log("⚠️  업데이트할 머신 데이터가 없습니다.");
    return;
  }

  // 2) 파일명 키 세트 만들기 (정규화)
  const normalizedFileKeyToFileName = new Map<string, string>();
  Object.entries(fileNameMap).forEach(([key, fileName]) => {
    const norm = applyAlias(normalize(key));
    if (norm) normalizedFileKeyToFileName.set(norm, fileName);
  });

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  // 3) 각 머신에 대해 매칭 시도 후 업데이트
  for (const m of machines) {
    const byEn = applyAlias(normalize(m.name_en));
    const byKo = normalize(m.name_ko); // 한글은 보조
    const byKey = applyAlias(normalizeKeyLike(m.machine_key));

    // 후보 키들 (우선순위: 영문명 → 키 → 한글명의 영문 발음 유사 매칭은 제외)
    const candidates = [byEn, byKey];

    let matchedFile: string | undefined;
    for (const c of candidates) {
      if (!c) continue;
      if (normalizedFileKeyToFileName.has(c)) {
        matchedFile = normalizedFileKeyToFileName.get(c);
        break;
      }
      // 복합어 분해 후 부분일치 보정 (예: "plate loaded leg press" ⟷ "leg press")
      const words = c.split(" ");
      for (let size = Math.min(3, words.length); size >= 2; size--) {
        for (let start = 0; start + size <= words.length; start++) {
          const sub = words.slice(start, start + size).join(" ");
          const subAliased = applyAlias(sub);
          if (normalizedFileKeyToFileName.has(subAliased)) {
            matchedFile = normalizedFileKeyToFileName.get(subAliased);
            break;
          }
        }
        if (matchedFile) break;
      }
      if (matchedFile) break;
    }

    if (!matchedFile) {
      notFoundCount++;
      console.log(
        `- 매칭 실패: id=${m.id}, name_ko=${m.name_ko}, name_en=${
          m.name_en || "-"
        }`
      );
      // 디버깅: 정규화된 문자열들 출력
      console.log(`  디버깅 - byEn: "${byEn}", byKey: "${byKey}"`);
      continue;
    }

    const nextUrl = `/img/machine/${matchedFile}`;
    if (m.image_url === nextUrl) {
      skippedCount++;
      continue;
    }

    try {
      await axios.put(`${BASE_URL}/machines/${m.id}`, { image_url: nextUrl });
      updatedCount++;
      console.log(`✅ 업데이트: id=${m.id}, ${m.name_ko} → ${nextUrl}`);
    } catch (err: any) {
      console.log(
        `❌ 실패: id=${m.id}, ${m.name_ko} → ${nextUrl}`,
        err?.response?.data || err?.message
      );
    }
  }

  console.log("\n📊 결과 요약");
  console.log(`- 업데이트: ${updatedCount}`);
  console.log(`- 동일하여 스킵: ${skippedCount}`);
  console.log(`- 매칭 실패: ${notFoundCount}`);
  console.log("\n🎯 이미지 URL 업데이트 완료!");
}

if (require.main === module) {
  updateMachineImages().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { updateMachineImages };
