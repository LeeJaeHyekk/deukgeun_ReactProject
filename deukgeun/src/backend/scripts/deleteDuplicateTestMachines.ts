import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

async function deleteDuplicateTestMachines() {
  console.log("🗑️  중복/테스트 머신 삭제 시작\n");

  try {
    const list = await axios.get(`${BASE_URL}/machines`);
    const machines: any[] = list.data?.data || [];

    const targets = machines.filter((m) => {
      const nameKo: string = m.name_ko || "";
      const nameEn: string = (m.name_en || "") as string;
      const key: string = m.machine_key || "";
      return (
        nameKo === "중복 키 테스트 1" ||
        /duplicate key test/i.test(nameEn) ||
        /duplicate/i.test(key)
      );
    });

    if (targets.length === 0) {
      console.log("✅ 삭제 대상 없음 (이미 정리되었을 수 있습니다).");
      return;
    }

    for (const t of targets) {
      try {
        await axios.delete(`${BASE_URL}/machines/${t.id}`);
        console.log(`✅ 삭제됨: id=${t.id}, name_ko=${t.name_ko}`);
      } catch (err: any) {
        console.log(
          `❌ 삭제 실패: id=${t.id}, name_ko=${t.name_ko}`,
          err?.response?.data || err?.message
        );
      }
    }
  } catch (e: any) {
    console.error("❌ 목록 조회 실패:", e?.response?.data || e?.message);
  }

  console.log("\n🎯 삭제 작업 완료!");
}

if (require.main === module) {
  deleteDuplicateTestMachines().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { deleteDuplicateTestMachines };
