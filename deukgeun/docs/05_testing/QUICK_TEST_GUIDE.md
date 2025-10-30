# 🚀 빠른 테스트 실행 가이드

## ✅ 올바른 실행 방법

### 방법 1: 브라우저 콘솔에서 실행 (권장)

**이 방법을 사용하세요!** `run-functional-tests.js`는 브라우저에서 실행하는 파일입니다.

#### 단계별 절차:

1. **프로젝트 실행**
   ```bash
   npm run dev
   ```

2. **브라우저 열기**
   - http://localhost:5173 (또는 설정된 포트)
   - 커뮤니티 페이지로 이동: http://localhost:5173/community

3. **DevTools 열기**
   - `F12` 키 누르기
   - 또는 마우스 우클릭 → "검사" (Inspect)

4. **Console 탭 선택**

5. **테스트 스크립트 실행**
   
   옵션 A: 파일 내용 복사하여 붙여넣기
   ```bash
   # 터미널에서 파일 내용 확인
   cat run-functional-tests.js
   
   # 또는 파일 열어서 전체 내용 복사 (Ctrl+A, Ctrl+C)
   ```
   
   그 다음 브라우저 콘솔에 붙여넣고 `Enter` 누르기

   옵션 B: verification 도구 직접 사용 (더 간단)
   ```javascript
   // 브라우저 콘솔에 직접 입력:
   verification.start()
   // 페이지 새로고침 또는 동작 수행
   verification.runAll()
   ```

---

## 🔧 대안: 간단한 테스트 명령어

### 브라우저 콘솔에서 빠르게 테스트하기

**커뮤니티 페이지에서 DevTools Console 열기 후:**

```javascript
// 1. 모니터링 시작
verification.start()

// 2. 페이지 새로고침 (F5)

// 3. 검증 실행
verification.runAll()
```

**또는 단계별로:**

```javascript
// Verification 도구 확인
typeof window.verification

// 네트워크 모니터링 시작
verification.start()

// GET /api/posts 호출 횟수 확인
verification.testPosts()

// GET /api/comments/:postId 호출 횟수 확인  
verification.testComments()

// Authorization 헤더 확인
verification.testAuthHeader()

// 토큰 소스 확인
verification.testTokenSource()

// 요청 로그 확인
verification.getLog()
```

---

## 📝 파일 기반 테스트 (선택사항)

터미널에서 파일 내용을 확인하려면:

```bash
# 파일 내용 확인
cat run-functional-tests.js

# 또는 Windows에서
type run-functional-tests.js
```

그 다음 브라우저 콘솔에 복사하여 붙여넣기

---

## 🎯 가장 빠른 방법

**1. 프로젝트 실행:**
```bash
npm run dev
```

**2. 브라우저에서:**
- http://localhost:5173/community 열기
- F12 (DevTools)
- Console 탭
- 아래 명령어 입력:

```javascript
verification.start(); verification.runAll()
```

**끝!** 테스트 결과가 콘솔에 표시됩니다.

---

**핵심**: `run-functional-tests.js`는 **브라우저에서 실행**하는 파일입니다. npm 스크립트가 아닙니다!

