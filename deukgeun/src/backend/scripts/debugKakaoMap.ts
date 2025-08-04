import { chromium } from "playwright";

async function debugKakaoMap() {
  const browser = await chromium.launch({
    headless: false, // 브라우저를 보이게 실행
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    console.log("🔍 카카오맵 구조 분석 시작...");

    // 카카오맵으로 이동
    await page.goto("https://map.kakao.com/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("✅ 카카오맵 페이지 로드 완료");

    // 페이지의 모든 요소들을 확인
    const allElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("*");
      const elementInfo = [];

      for (let i = 0; i < Math.min(elements.length, 100); i++) {
        const el = elements[i];
        if (el.id || el.className) {
          elementInfo.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            text: el.textContent?.substring(0, 50) || "",
          });
        }
      }

      return elementInfo;
    });

    console.log("📋 페이지 요소들:");
    allElements.forEach((el, index) => {
      if (el.id.includes("search") || el.className.includes("search")) {
        console.log(
          `🔍 [${index}] ${el.tag} - id: "${el.id}", class: "${el.className}", text: "${el.text}"`
        );
      }
    });

    // 검색 관련 요소들 찾기
    const searchElements = await page.$$eval(
      'input, [id*="search"], [class*="search"]',
      (elements) => {
        return elements.map((el) => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          type: el.getAttribute("type"),
          placeholder: el.getAttribute("placeholder"),
        }));
      }
    );

    console.log("🔍 검색 관련 요소들:");
    searchElements.forEach((el, index) => {
      console.log(
        `  [${index}] ${el.tag} - id: "${el.id}", class: "${el.className}", type: "${el.type}", placeholder: "${el.placeholder}"`
      );
    });

    // 스크린샷 저장
    await page.screenshot({ path: "kakao-map-debug.png", fullPage: true });
    console.log("📸 스크린샷 저장됨: kakao-map-debug.png");

    // 10초 대기 (수동으로 확인할 수 있도록)
    console.log("⏳ 10초간 대기 중... (브라우저에서 수동으로 확인 가능)");
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await browser.close();
  }
}

debugKakaoMap();
