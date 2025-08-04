import { config } from "../config";

// reCAPTCHA 타입 정의
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
      render: (container: string | HTMLElement, options: any) => number;
    };
  }
}

// reCAPTCHA 스크립트 로드
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA 스크립트 로드 실패"));

    document.head.appendChild(script);
  });
};

// reCAPTCHA 토큰 생성
export const executeRecaptcha = async (
  action: string = "login"
): Promise<string> => {
  try {
    await loadRecaptchaScript();

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            config.RECAPTCHA_SITE_KEY,
            {
              action: action,
            }
          );
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    throw new Error("reCAPTCHA 실행 실패");
  }
};

// reCAPTCHA 위젯 렌더링 (v2용)
export const renderRecaptchaWidget = (
  container: string | HTMLElement,
  callback: (token: string) => void,
  options: any = {}
): number => {
  const defaultOptions = {
    sitekey: config.RECAPTCHA_SITE_KEY,
    callback: callback,
    "expired-callback": () => console.log("reCAPTCHA expired"),
    "error-callback": () => console.log("reCAPTCHA error"),
    ...options,
  };

  return window.grecaptcha.render(container, defaultOptions);
};

// reCAPTCHA 검증 (개발용 더미 토큰)
export const getDummyRecaptchaToken = (): string => {
  if (
    config.RECAPTCHA_SITE_KEY.includes(
      "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    )
  ) {
    // Test key인 경우 더미 토큰 반환
    return "dummy-recaptcha-token-for-development";
  }
  return "";
};
