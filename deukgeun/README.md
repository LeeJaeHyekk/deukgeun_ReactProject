# 득근 득근 - React + TypeScript + Vite

득근 득근은 React, TypeScript, Vite를 사용한 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
cd src/backend && npm install
```

### 2. 환경변수 설정

프로젝트 루트와 백엔드 디렉토리에 `.env` 파일을 생성하세요.
자세한 설정 방법은 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)를 참조하세요.

### 3. 개발 서버 실행

```bash
# 프론트엔드와 백엔드를 동시에 실행 (권장)
npm run dev:all

# 또는 개별 실행
npm run dev:frontend  # 프론트엔드만 (포트 5173)
npm run dev:backend   # 백엔드만 (포트 5000)
```

## 📁 프로젝트 구조

```
src/
├── frontend/          # React 프론트엔드
│   ├── pages/        # 페이지 컴포넌트
│   ├── features/     # 기능별 모듈
│   ├── shared/       # 공통 컴포넌트
│   └── ...
└── backend/          # Express 백엔드
    ├── controllers/  # 컨트롤러
    ├── routes/       # 라우터
    ├── services/     # 비즈니스 로직
    └── ...
```

## 🔧 포트 설정

- **프론트엔드**: `http://localhost:5173`
- **백엔드**: `http://localhost:5000`

## 🛠️ 사용 기술

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, TypeScript, TypeORM, MySQL
- **Development**: ESLint, Prettier

## 🔧 문제 해결

### 포트 충돌 문제

```bash
# 포트 사용 현황 확인 및 프로세스 종료
npm run check-ports
```

### 환경변수 설정

자세한 설정 방법은 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)를 참조하세요.

### 일반적인 문제들

1. **포트가 이미 사용 중**: `npm run check-ports` 실행
2. **환경변수 누락**: `.env` 파일 생성 및 설정
3. **의존성 문제**: `npm install` 재실행
4. **데이터베이스 연결 실패**: MySQL 서비스 확인 및 설정

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
