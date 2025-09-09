# Frontend 구조 최적화 계획

## 🎯 목표

- Feature-based Architecture 도입
- 코드 재사용성 및 유지보수성 향상
- 명확한 책임 분리

## 📁 최적화된 구조

```
src/frontend/
├── app/                          # 앱 레벨 설정
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── shared/                       # 공통 모듈
│   ├── components/               # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/                   # 기본 UI 컴포넌트
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── LoadingSpinner/
│   │   │   └── LoadingOverlay/
│   │   ├── forms/                # 폼 관련 컴포넌트
│   │   │   ├── FormField/
│   │   │   ├── FormButton/
│   │   │   └── FormValidation/
│   │   └── layout/               # 레이아웃 컴포넌트
│   │       ├── Navigation/
│   │       └── Layout/
│   ├── hooks/                    # 공통 훅
│   │   ├── useAuth.ts
│   │   ├── useRecaptcha.ts
│   │   └── index.ts
│   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── api-client.ts
│   │   ├── config.ts
│   │   ├── validation.ts
│   │   └── toast.ts
│   ├── types/                    # 공통 타입
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   └── constants/                # 공통 상수
│       ├── api.ts
│       ├── routes.ts
│       └── index.ts
├── features/                     # 기능별 모듈
│   ├── auth/                     # 인증 기능
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   ├── SignUpForm/
│   │   │   └── AuthLayout/
│   │   ├── hooks/
│   │   │   ├── useAuthForm.ts
│   │   │   └── useAuthRecaptcha.ts
│   │   ├── services/
│   │   │   └── authApi.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── pages/
│   │   │   ├── LoginPage/
│   │   │   ├── SignUpPage/
│   │   │   └── FindPasswordPage/
│   │   └── index.ts
│   ├── community/                # 커뮤니티 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── pages/
│   │   └── index.ts
│   ├── workout/                  # 운동 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── pages/
│   │   └── index.ts
│   ├── machine-guide/            # 머신 가이드 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── pages/
│   │   └── index.ts
│   ├── location/                 # 위치/헬스장 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── pages/
│   │   └── index.ts
│   ├── admin/                    # 관리자 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── pages/
│   │   └── index.ts
│   └── user/                     # 사용자 프로필 기능
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── pages/
│       └── index.ts
├── widgets/                      # 복합 위젯
│   ├── Navigation/
│   └── UserProfile/
├── contexts/                     # 전역 상태 관리
│   ├── AuthContext.tsx
│   ├── WorkoutTimerContext.tsx
│   └── index.ts
├── store/                        # 상태 관리
│   ├── userStore.ts
│   └── index.ts
└── config/                       # 설정 파일
    ├── apiEndpoints.ts
    └── index.ts
```

## 🔄 마이그레이션 계획

### 1단계: shared 폴더 생성 및 공통 모듈 이동

- `shared/components/ui/` - 기존 UI 컴포넌트들
- `shared/hooks/` - 공통 훅들
- `shared/lib/` - 유틸리티 라이브러리
- `shared/types/` - 공통 타입들
- `shared/constants/` - 공통 상수들

### 2단계: features 폴더 재구성

- 각 기능별로 완전한 모듈 구조 생성
- components, hooks, services, types, pages 포함

### 3단계: 기존 파일들 정리

- 중복 파일 제거
- import 경로 수정
- 인덱스 파일 생성

## 📋 장점

1. **명확한 책임 분리**: 각 기능이 독립적인 모듈로 구성
2. **재사용성 향상**: shared 모듈을 통한 코드 재사용
3. **유지보수성**: 기능별로 분리되어 수정이 용이
4. **확장성**: 새로운 기능 추가가 간단
5. **팀 협업**: 기능별로 개발자 분담 가능
