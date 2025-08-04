#!/usr/bin/env node

const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

const PORTS = {
  frontend: 5173,
  backend: 3001,
};

async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    return stdout
      .trim()
      .split("\n")
      .filter((line) => line.includes(`:${port}`));
  } catch (error) {
    return [];
  }
}

async function killProcess(pid) {
  try {
    await execAsync(`taskkill /F /PID ${pid}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🔍 포트 사용 현황 확인 중...\n");

  for (const [service, port] of Object.entries(PORTS)) {
    const processes = await checkPort(port);

    if (processes.length > 0) {
      console.log(`⚠️  ${service} 포트 (${port})가 사용 중입니다:`);
      processes.forEach((process) => {
        const parts = process.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        console.log(`   PID: ${pid} - ${process}`);
      });

      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question(`\n이 프로세스들을 종료하시겠습니까? (y/N): `, resolve);
      });
      rl.close();

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        for (const process of processes) {
          const parts = process.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          const killed = await killProcess(pid);
          if (killed) {
            console.log(`✅ PID ${pid} 종료 완료`);
          } else {
            console.log(`❌ PID ${pid} 종료 실패`);
          }
        }
      }
    } else {
      console.log(`✅ ${service} 포트 (${port}) 사용 가능`);
    }
  }

  console.log("\n🎉 포트 확인 완료!");
  console.log("\n📝 다음 명령어로 서버를 실행하세요:");
  console.log("   npm run dev:all     # 프론트엔드 + 백엔드 동시 실행");
  console.log("   npm run dev:frontend # 프론트엔드만 실행");
  console.log("   npm run dev:backend  # 백엔드만 실행");
}

main().catch(console.error);
