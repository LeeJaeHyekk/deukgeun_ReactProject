# 프론트엔드 빌드 문제 수정 요약

## 📋 문제 분석

`npm run deploy:ec2` 실행 시 프론트엔드가 빌드되지 않는 문제가 발생했습니다.

## 🔍 원인 분석

1. **JS to CJS 변환 스크립트가 프론트엔드 빌드 결과를 변환하려고 시도**
   - `enhanced-js-to-cjs-converter.ts`가 `dist` 폴더 전체를 스캔
   - `dist/frontend` 디렉토리가 제외되지 않음

2. **빌드 후 정리 과정에서 프론트엔드 파일 삭제**
   - `prepareBuild()`에서 `dist` 폴더 전체 삭제
   - 프론트엔드 빌드 결과가 삭제됨

3. **빌드 결과 검증 로직 부족**
   - 프론트엔드 빌드 성공 여부 확인 미흡

## ✅ 수정 사항

### 1. 프론트엔드 디렉토리 제외 처리

#### `scripts/enhanced-js-to-cjs-converter.ts`
- `scanDirectory()` 메서드에서 `frontend` 디렉토리 제외 추가
```typescript
if (!['node_modules', '.git', '.conversion-backup', 'frontend'].includes(item)) {
  this.scanDirectory(itemPath, fileList, extensions)
}
```

#### `scripts/build-optimized.ts`
- `findJsFiles()` 메서드에서 `frontend` 디렉토리 제외 추가
- `findCjsFiles()` 메서드에서 `frontend` 디렉토리 제외 추가

### 2. 프론트엔드 빌드 결과 보존

#### `scripts/build-optimized.ts` - `prepareBuild()`
- dist 폴더 정리 시 프론트엔드 빌드 결과 백업/복원 로직 추가
- 기존 프론트엔드 빌드 결과를 `.frontend-backup`에 백업
- dist 폴더 삭제 후 프론트엔드 빌드 결과 복원

### 3. 프론트엔드 빌드 검증 강화

#### `scripts/build-optimized.ts` - `buildFrontend()`
- 빌드 후 결과 확인 로직 추가
- `dist/frontend` 디렉토리 존재 확인
- `index.html` 파일 존재 확인
- 생성된 파일 개수 확인
- 빌드 에러 시 상세 로그 출력

### 4. 배포 스크립트 로그 개선

#### `scripts/ec2-integrated-deploy.sh`
- `run_with_timeout()` 함수에 로그 저장 기능 추가
- 빌드 로그에서 프론트엔드 관련 메시지 확인
- 프론트엔드 빌드 검증 로직 강화

## 🎯 빌드 프로세스 흐름

```
1. prepareBuild()
   - dist 폴더 정리 전 프론트엔드 백업 (있다면)
   - dist 폴더 삭제
   - 프론트엔드 복원 (백업이 있다면)

2. buildBackend()
   - 백엔드 빌드 실행

3. buildFrontend()
   - Vite 빌드 실행
   - 빌드 결과 확인 (dist/frontend/index.html)
   - 파일 개수 확인

4. convertJsToCjs()
   - JS to CJS 변환 (frontend 제외)

5. cleanup()
   - 빌드 후 정리
```

## 📝 확인 방법

EC2에서 다음 명령어로 확인:

```bash
# 1. 배포 실행
npm run deploy:ec2

# 2. 빌드 결과 확인
ls -la dist/frontend/

# 3. index.html 확인
ls -la dist/frontend/index.html

# 4. 빌드 로그 확인
grep -i "프론트엔드\|frontend" logs/ec2-deploy-*.log | tail -n 20
```

## ⚠️ 주의사항

1. **프론트엔드 빌드 결과는 변환하지 않음**
   - Vite가 이미 최적화된 빌드를 생성
   - 추가 변환 불필요

2. **dist 폴더 정리 시 프론트엔드 보존**
   - 기존 프론트엔드 빌드 결과는 백업/복원
   - 새로 빌드하면 덮어쓰기됨

3. **빌드 타임아웃**
   - 프론트엔드 빌드는 최대 5분 (300초)
   - 타임아웃 발생 시 로그 확인 필요

## 🔧 추가 디버깅

프론트엔드 빌드가 여전히 실패하는 경우:

```bash
# 1. 수동으로 프론트엔드 빌드 실행
npm run build

# 2. Vite 빌드 직접 실행
npx vite build --mode production

# 3. 환경 변수 확인
echo $NODE_ENV
echo $MODE
echo $VITE_BACKEND_URL

# 4. 의존성 확인
npm list vite
npm list @vitejs/plugin-react-swc
```

