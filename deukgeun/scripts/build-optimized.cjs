#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// 로그 함수
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${type}] ${message}\n`

  console.log(logMessage.trim())

  // 로그 파일에 기록
  const logFile = path.join(__dirname, '..', 'logs', 'build-debug.log')
  fs.appendFileSync(logFile, logMessage)
}

// 오류 로그 함수
function logError(error, context = '') {
  const timestamp = new Date().toISOString()
  const errorMessage = `[${timestamp}] [ERROR] ${context}: ${error.message}\n${error.stack}\n`

  console.error(`❌ ${context}: ${error.message}`)

  // 로그 파일에 기록
  const logFile = path.join(__dirname, '..', 'logs', 'build-debug.log')
  fs.appendFileSync(logFile, errorMessage)
}

// 경고 로그 함수
function logWarning(message, context = '') {
  const timestamp = new Date().toISOString()
  const warningMessage = `[${timestamp}] [WARN] ${context}: ${message}\n`

  console.warn(`⚠️  ${context}: ${message}`)

  // 로그 파일에 기록
  const logFile = path.join(__dirname, '..', 'logs', 'build-debug.log')
  fs.appendFileSync(logFile, warningMessage)
}

// 성공 로그 함수
function logSuccess(message, context = '') {
  const timestamp = new Date().toISOString()
  const successMessage = `[${timestamp}] [SUCCESS] ${context}: ${message}\n`

  console.log(`✅ ${context}: ${message}`)

  // 로그 파일에 기록
  const logFile = path.join(__dirname, '..', 'logs', 'build-debug.log')
  fs.appendFileSync(logFile, successMessage)
}

log('=== 최적화된 백엔드 빌드 시작 ===')

async function buildOptimizedBackend() {
  try {
    const projectRoot = path.join(__dirname, '..')
    const backendDir = path.join(projectRoot, 'src/backend')
    const distPath = path.join(projectRoot, 'dist/backend')

    // 환경 변수 설정
    const nodeEnv = process.env.NODE_ENV || 'production'
    log(`빌드 환경: ${nodeEnv}`)

    // 환경 변수 로깅
    log(`NODE_ENV: ${nodeEnv}`)
    log(`프로젝트 루트: ${projectRoot}`)
    log(`백엔드 소스: ${backendDir}`)
    log(`빌드 출력: ${distPath}`)

    // 0. 빌드 전 환경 검증
    log('빌드 환경 검증 시작...')

    // 백엔드 디렉토리 존재 확인
    if (!fs.existsSync(backendDir)) {
      throw new Error(`백엔드 소스 디렉토리가 존재하지 않습니다: ${backendDir}`)
    }

    // 백엔드 package.json 확인
    const backendPackageJson = path.join(backendDir, 'package.json')
    if (!fs.existsSync(backendPackageJson)) {
      throw new Error(
        `백엔드 package.json이 존재하지 않습니다: ${backendPackageJson}`
      )
    }

    // 백엔드 tsconfig.json 확인
    const backendTsConfig = path.join(backendDir, 'tsconfig.json')
    if (!fs.existsSync(backendTsConfig)) {
      throw new Error(
        `백엔드 tsconfig.json이 존재하지 않습니다: ${backendTsConfig}`
      )
    }

    // 백엔드 node_modules 확인
    const backendNodeModules = path.join(backendDir, 'node_modules')
    if (!fs.existsSync(backendNodeModules)) {
      logWarning(
        '백엔드 node_modules가 없습니다. npm install을 실행하세요.',
        '환경 검증'
      )
    }

    log('빌드 환경 검증 완료')

    // 1. 기존 빌드 결과 정리 (Windows 권한 문제 해결)
    if (fs.existsSync(distPath)) {
      log('기존 빌드 결과 정리 중...')
      try {
        // Windows에서 권한 문제가 있는 파일들을 우회하여 삭제
        const isWindows = process.platform === 'win32'
        if (isWindows) {
          // Windows에서는 rmdir 명령어 사용
          try {
            execSync(`rmdir /s /q "${distPath}"`, {
              stdio: 'pipe',
              cwd: projectRoot,
            })
            log('Windows rmdir로 빌드 결과 정리 완료')
          } catch (rmdirError) {
            logWarning('rmdir 실패, 개별 파일 삭제 시도', '빌드 정리')
            // 개별 파일 삭제 시도
            deleteDirectoryRecursive(distPath)
            log('개별 파일 삭제로 빌드 결과 정리 완료')
          }
        } else {
          fs.rmSync(distPath, { recursive: true, force: true })
          log('기존 빌드 결과 정리 완료')
        }
      } catch (error) {
        logWarning(`빌드 결과 정리 실패: ${error.message}`, '빌드 정리')
        // 정리 실패해도 계속 진행
        log('빌드 결과 정리 실패했지만 계속 진행합니다.')
      }
    }

    // 2. dist 디렉토리 생성
    if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
      fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true })
      log('dist 디렉토리 생성 완료')
    }

    // 3. TypeScript 컴파일
    log('TypeScript 컴파일 시작...')
    try {
      log(`백엔드 tsconfig.json 사용: ${backendTsConfig}`)
      execSync('npx tsc -p tsconfig.json', {
        cwd: backendDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: nodeEnv },
      })
      log('TypeScript 컴파일 완료')
    } catch (error) {
      logError(error, 'TypeScript 컴파일 실패')

      // 상세한 오류 정보 수집
      try {
        const errorOutput = execSync('npx tsc -p tsconfig.json --noEmit', {
          cwd: backendDir,
          stdio: 'pipe',
          encoding: 'utf8',
        })
        log(`TypeScript 오류 상세: ${errorOutput}`, 'DEBUG')
      } catch (tsError) {
        logError(tsError, 'TypeScript 상세 오류 수집 실패')
      }

      throw error
    }

    // 4. 빌드된 파일들을 올바른 위치로 이동
    const backendBuildPath = path.join(distPath, 'backend')
    if (fs.existsSync(backendBuildPath)) {
      log('빌드된 파일들을 올바른 위치로 이동 중...')
      const files = fs.readdirSync(backendBuildPath)
      for (const file of files) {
        const srcPath = path.join(backendBuildPath, file)
        const destPath = path.join(distPath, file)
        if (fs.statSync(srcPath).isDirectory()) {
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true })
          }
          fs.renameSync(srcPath, destPath)
        } else {
          fs.copyFileSync(srcPath, destPath)
        }
      }
      fs.rmSync(backendBuildPath, { recursive: true, force: true })
      log('파일 이동 완료')
    }

    // 5. JS 파일을 CJS로 변환
    log('JS 파일을 CJS로 변환 시작...')
    const jsFiles = findJsFiles(distPath)
    log(`변환할 JS 파일 수: ${jsFiles.length}`)

    for (const file of jsFiles) {
      const cjsFile = file.replace(/\.js$/, '.cjs')
      fs.renameSync(file, cjsFile)
      log(`변환: ${path.basename(file)} -> ${path.basename(cjsFile)}`)
    }
    log('JS to CJS 변환 완료')

    // 6. require 경로 수정
    log('require 경로 수정 시작...')
    const cjsFiles = findCjsFiles(distPath)
    log(`수정할 CJS 파일 수: ${cjsFiles.length}`)

    let fixedCount = 0
    let totalChanges = 0
    for (const file of cjsFiles) {
      if (file.includes('post.cjs')) {
        log(`처리 중인 파일: ${file}`, 'DEBUG')
      }
      const result = fixRequirePaths(file)
      if (result && result.modified) {
        fixedCount++
        // result가 객체인 경우 changeCount를 추가
        if (typeof result === 'object' && result.changeCount) {
          totalChanges += result.changeCount
        }
      }
    }
    log(
      `require 경로 수정 완료: ${fixedCount}개 파일 수정, 총 ${totalChanges}개 변경`
    )

    // 7. node_modules 복사
    log('node_modules 복사 시작...')
    const distNodeModules = path.join(distPath, 'node_modules')

    if (fs.existsSync(backendNodeModules)) {
      if (fs.existsSync(distNodeModules)) {
        fs.rmSync(distNodeModules, { recursive: true, force: true })
      }

      try {
        // Windows와 Unix 모두 지원하는 복사
        const isWindows = process.platform === 'win32'
        if (isWindows) {
          execSync(
            `xcopy "${backendNodeModules}" "${distNodeModules}" /E /I /H /Y`,
            {
              stdio: 'inherit',
              cwd: projectRoot,
            }
          )
        } else {
          execSync(`cp -r "${backendNodeModules}" "${distNodeModules}"`, {
            stdio: 'inherit',
            cwd: projectRoot,
          })
        }
        log('node_modules 복사 완료')
      } catch (error) {
        logError(error, 'node_modules 복사 실패')
        // 최후의 수단으로 Node.js로 복사
        copyDirectoryRecursive(backendNodeModules, distNodeModules)
        log('Node.js 방식으로 node_modules 복사 완료')
      }
    } else {
      log('백엔드 node_modules를 찾을 수 없음', 'WARN')
    }

    // 8. 빌드 검증
    log('빌드 결과 검증 시작...')
    const requiredFiles = [
      'index.cjs',
      'app.cjs',
      'config/database.cjs',
      'config/env.cjs',
      'config/envValidation.cjs',
      'routes/index.cjs',
      'entities/User.cjs',
      'entities/Post.cjs',
      'controllers/authController.cjs',
      'services/gymService.cjs',
      'utils/logger.cjs',
    ]

    const missingFiles = []
    const existingFiles = []

    for (const file of requiredFiles) {
      const filePath = path.join(distPath, file)
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file)
      } else {
        existingFiles.push(file)
      }
    }

    log(`검증된 파일: ${existingFiles.length}개`)
    if (existingFiles.length > 0) {
      log(
        `존재하는 파일: ${existingFiles.slice(0, 5).join(', ')}${existingFiles.length > 5 ? '...' : ''}`
      )
    }

    if (missingFiles.length > 0) {
      logWarning(`누락된 파일: ${missingFiles.join(', ')}`, '빌드 검증')
      // 필수 파일이 누락된 경우에만 오류 발생
      const criticalFiles = ['index.cjs', 'app.cjs', 'config/database.cjs']
      const criticalMissing = missingFiles.filter(file =>
        criticalFiles.includes(file)
      )

      if (criticalMissing.length > 0) {
        const error = new Error(`필수 파일 누락: ${criticalMissing.join(', ')}`)
        logError(error, '빌드 검증 실패')
        throw error
      }
    }

    // 9. require 경로 검증 (개선된 버전)
    log('require 경로 검증 시작...')
    const sampleFiles = ['index.cjs', 'app.cjs', 'config/database.cjs']
    let pathIssues = 0
    const pathIssueDetails = []

    for (const file of sampleFiles) {
      const filePath = path.join(distPath, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        // 확장자가 없는 상대 경로 require 문 검사 (개선된 로직)
        const allRequires =
          content.match(/require\(['"](\.\/[^'"]*?)['"]\)/g) || []
        const allRequires2 =
          content.match(/require\(['"](\.\.\/[^'"]*?)['"]\)/g) || []

        let filePathIssues = 0
        for (const match of allRequires) {
          const modulePath = match.match(/require\(['"](\.\/[^'"]*?)['"]\)/)[1]
          if (
            !hasFileExtension(modulePath) &&
            !modulePath.includes('node_modules') &&
            !modulePath.startsWith('@') &&
            !modulePath.startsWith('/') &&
            !modulePath.endsWith('/') &&
            modulePath.length > 0
          ) {
            filePathIssues++
            pathIssueDetails.push(`${file}: ${match}`)
          }
        }

        for (const match of allRequires2) {
          const modulePath = match.match(
            /require\(['"](\.\.\/[^'"]*?)['"]\)/
          )[1]
          if (
            !hasFileExtension(modulePath) &&
            !modulePath.includes('node_modules') &&
            !modulePath.startsWith('@') &&
            !modulePath.startsWith('/') &&
            !modulePath.endsWith('/') &&
            modulePath.length > 0
          ) {
            filePathIssues++
            pathIssueDetails.push(`${file}: ${match}`)
          }
        }

        if (filePathIssues > 0) {
          pathIssues += filePathIssues
          logWarning(
            `경로 문제 발견: ${file} (${filePathIssues}개)`,
            'require 경로 검증'
          )
        }
      }
    }

    if (pathIssues > 0) {
      logWarning(
        `${pathIssues}개의 require 경로 문제 발견`,
        'require 경로 검증'
      )
      // 상세 정보 로깅 (처음 10개만)
      const detailsToLog = pathIssueDetails.slice(0, 10)
      for (const detail of detailsToLog) {
        log(`  - ${detail}`, 'DEBUG')
      }
      if (pathIssueDetails.length > 10) {
        log(`  - ... 및 ${pathIssueDetails.length - 10}개 더`, 'DEBUG')
      }
    } else {
      logSuccess('require 경로 검증 통과', '빌드 검증')
    }

    // 10. 빌드 통계
    const buildStats = getBuildStats(distPath)
    logSuccess(
      `빌드 완료: ${buildStats.files}개 파일, ${buildStats.size}`,
      '빌드 통계'
    )
    log(
      `파일 타입별 통계: CJS(${buildStats.cjsFiles}), JS(${buildStats.jsFiles}), 기타(${buildStats.otherFiles})`
    )

    // 11. 최종 검증 요약
    log('=== 빌드 검증 요약 ===')
    log(`✅ TypeScript 컴파일: 성공`)
    log(`✅ JS to CJS 변환: ${jsFiles.length}개 파일`)
    log(`✅ require 경로 수정: ${fixedCount}개 파일`)
    log(`✅ node_modules 복사: 완료`)
    log(
      `✅ 빌드 검증: ${existingFiles.length}/${requiredFiles.length}개 파일 확인`
    )
    if (pathIssues > 0) {
      logWarning(`⚠️  require 경로 문제: ${pathIssues}개 발견`)
    } else {
      logSuccess(`✅ require 경로 검증: 통과`)
    }

    log('=== 최적화된 백엔드 빌드 완료 ===')
    return true
  } catch (error) {
    logError(error, '빌드 프로세스 실패')
    throw error
  }
}

// JS 파일 찾기
function findJsFiles(dir) {
  const jsFiles = []

  function findFiles(currentPath) {
    const items = fs.readdirSync(currentPath)
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        findFiles(itemPath)
      } else if (item.endsWith('.js')) {
        jsFiles.push(itemPath)
      }
    }
  }

  findFiles(dir)
  return jsFiles
}

// CJS 파일 찾기
function findCjsFiles(dir) {
  const cjsFiles = []

  function findFiles(currentPath) {
    const items = fs.readdirSync(currentPath)
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        findFiles(itemPath)
      } else if (item.endsWith('.cjs')) {
        cjsFiles.push(itemPath)
      }
    }
  }

  findFiles(dir)
  return cjsFiles
}

// 파일 확장자 확인 함수
function hasFileExtension(filePath) {
  // 마지막 점 이후에 확장자가 있는지 확인
  const lastDotIndex = filePath.lastIndexOf('.')
  if (lastDotIndex === -1) return false

  // 점이 마지막 문자가 아니고, 점 이후에 문자가 있는지 확인
  const extension = filePath.substring(lastDotIndex + 1)

  // 실제 파일 확장자들 (이미 확장자가 있는 경우)
  const realExtensions = ['cjs', 'js', 'ts', 'json', 'mjs']
  if (realExtensions.includes(extension)) {
    return true
  }

  // 특별한 패턴들은 확장자가 아닌 파일명의 일부로 처리
  const specialPatterns = [
    'controller',
    'service',
    'transformer',
    'dto',
    'entity',
    'middleware',
    'util',
    'helper',
  ]

  if (specialPatterns.includes(extension)) {
    return false
  }

  return (
    extension.length > 0 &&
    !extension.includes('/') &&
    !extension.includes('\\')
  )
}

// require 경로 수정 - 개선된 버전
function fixRequirePaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    const originalContent = content
    const currentDir = path.dirname(filePath)

    // 파일 존재 여부 확인 헬퍼 함수
    function checkFileExists(relativePath) {
      const fullPath = path.join(currentDir, relativePath)
      return fs.existsSync(fullPath)
    }

    // 디렉토리 존재 여부 확인 헬퍼 함수 (개선된 버전)
    function checkDirectoryExists(relativePath) {
      const fullPath = path.join(currentDir, relativePath)
      if (!fs.existsSync(fullPath)) {
        return false
      }

      try {
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          // 디렉토리 내에 index.cjs 파일이 있는지도 확인
          const indexPath = path.join(fullPath, 'index.cjs')
          return fs.existsSync(indexPath)
        }
        return false
      } catch (error) {
        return false
      }
    }

    // Node.js 내장 모듈과 npm 패키지 목록
    const builtInModules = new Set([
      'reflect-metadata',
      'typeorm',
      'express',
      'cors',
      'helmet',
      'bcrypt',
      'jsonwebtoken',
      'multer',
      'nodemailer',
      'axios',
      'cheerio',
      'dotenv',
      'winston',
      'pm2',
      'mysql2',
      'class-validator',
      'class-transformer',
      'uuid',
      'moment',
      'lodash',
      'crypto',
      'fs',
      'path',
      'os',
      'util',
      'stream',
      'events',
      'http',
      'https',
      'url',
      'querystring',
      'child_process',
      'cluster',
      'worker_threads',
      'perf_hooks',
      'async_hooks',
      'timers',
      'buffer',
      'string_decoder',
      'readline',
      'tty',
      'net',
      'dgram',
      'dns',
      'zlib',
      'tls',
      'assert',
      'constants',
      'domain',
      'punycode',
      'repl',
      'vm',
      'v8',
      'inspector',
      'trace_events',
      'diagnostics_channel',
      'test',
    ])

    // 1. .js 확장자를 .cjs로 변경
    const jsPattern = /require\(['"]([^'"]*?)\.js['"]\)/g
    content = content.replace(jsPattern, (match, modulePath) => {
      // 상대 경로인 경우에만 변경
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        modified = true
        return `require('${modulePath}.cjs')`
      }
      return match
    })

    // 1.5. .transformer 확장자를 .transformer.cjs로 변경
    const transformerPattern = /require\(['"]([^'"]*?)\.transformer['"]\)/g
    content = content.replace(transformerPattern, (match, modulePath) => {
      // 상대 경로인 경우에만 변경
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        modified = true
        return `require('${modulePath}.transformer.cjs')`
      }
      return match
    })

    // 2. 확장자가 없는 상대 경로에 .cjs 추가 (완전히 개선된 정규식)
    const relativePattern = /require\(['"](\.\/[^'"]*?)['"]\)/g
    content = content.replace(relativePattern, (match, modulePath) => {
      // 파일 확장자가 없고, 내장 모듈이 아닌 경우
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        if (modulePath.includes('post.controller')) {
          log(`post.controller 처리 시작: ${modulePath}`, 'DEBUG')
        }
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            log(
              `특별패턴 매칭: ${modulePath} -> ${newPath}, 파일존재: ${checkFileExists(newPath)}`,
              'DEBUG'
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `require 경로 수정 (특별패턴): ${match} -> require('${newPath}')`,
                'DEBUG'
              )
              return `require('${newPath}')`
            }
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `require 경로 수정 (트랜스포머 파일): ${match} -> require('${transformerFile}')`,
              'DEBUG'
            )
            return `require('${transformerFile}')`
          }
        }

        // 특별한 케이스: ../transformers/user.transformer -> ../transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `require 경로 수정 (트랜스포머 경로): ${match} -> require('${transformerFile}')`,
              'DEBUG'
            )
            return `require('${transformerFile}')`
          }
        }

        // 특별한 케이스: post.service -> post.service.cjs
        if (modulePath.includes('.service') && !modulePath.endsWith('.cjs')) {
          const serviceFile = `${modulePath}.cjs`
          if (checkFileExists(serviceFile)) {
            modified = true
            log(
              `require 경로 수정 (서비스 파일): ${match} -> require('${serviceFile}')`,
              'DEBUG'
            )
            return `require('${serviceFile}')`
          }
        }

        // 특별한 케이스: ../services/post.service -> ../services/post.service.cjs
        if (
          modulePath.includes('/services/') &&
          modulePath.includes('.service') &&
          !modulePath.endsWith('.cjs')
        ) {
          const serviceFile = `${modulePath}.cjs`
          if (checkFileExists(serviceFile)) {
            modified = true
            log(
              `require 경로 수정 (서비스 경로): ${match} -> require('${serviceFile}')`,
              'DEBUG'
            )
            return `require('${serviceFile}')`
          }
        }

        // 특별한 케이스: post.service -> post.service.cjs (더 강력한 매칭)
        if (modulePath.endsWith('.service') && !modulePath.endsWith('.cjs')) {
          const serviceFile = `${modulePath}.cjs`
          if (checkFileExists(serviceFile)) {
            modified = true
            log(
              `require 경로 수정 (서비스 파일 강력매칭): ${match} -> require('${serviceFile}')`,
              'DEBUG'
            )
            return `require('${serviceFile}')`
          }
        }

        // 특별한 케이스: ../services/post.service -> ../services/post.service.cjs (더 강력한 매칭)
        if (
          modulePath.includes('services/') &&
          modulePath.endsWith('.service') &&
          !modulePath.endsWith('.cjs')
        ) {
          const serviceFile = `${modulePath}.cjs`
          if (checkFileExists(serviceFile)) {
            modified = true
            log(
              `require 경로 수정 (서비스 경로 강력매칭): ${match} -> require('${serviceFile}')`,
              'DEBUG'
            )
            return `require('${serviceFile}')`
          }
        }

        // 특별한 케이스: post.transformer -> post.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `require 경로 수정 (트랜스포머 파일): ${match} -> require('${transformerFile}')`,
              'DEBUG'
            )
            return `require('${transformerFile}')`
          }
        }

        // 특별한 디렉토리 케이스들 처리 (우선순위 높음)
        const specialDirectories = [
          'transformers',
          'controllers',
          'services',
          'entities',
          'middlewares',
          'utils',
          'routes',
          'config',
        ]

        for (const dir of specialDirectories) {
          if (modulePath === dir || modulePath.endsWith(`/${dir}`)) {
            if (checkDirectoryExists(modulePath)) {
              modified = true
              log(
                `require 경로 수정 (특별디렉토리): ${match} -> require('${modulePath}/index.cjs')`,
                'DEBUG'
              )
              return `require('${modulePath}/index.cjs')`
            }
          }
        }

        // transformers.cjs 같은 특별한 케이스 처리
        if (
          modulePath === 'transformers' ||
          modulePath.endsWith('/transformers')
        ) {
          const transformersPath = modulePath.endsWith('/transformers')
            ? modulePath
            : `./${modulePath}`
          if (checkDirectoryExists(transformersPath)) {
            modified = true
            log(
              `require 경로 수정 (transformers 디렉토리): ${match} -> require('${transformersPath}/index.cjs')`,
              'DEBUG'
            )
            return `require('${transformersPath}/index.cjs')`
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `require 경로 수정 (디렉토리): ${match} -> require('${modulePath}/index.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}/index.cjs')`
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `require 경로 수정 (파일): ${match} -> require('${modulePath}.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}.cjs')`
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `require 경로 수정 (기본): ${match} -> require('${modulePath}.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}.cjs')`
        }
      }
      return match
    })

    // 3. ../ 경로 처리 (완전히 개선된 정규식)
    const relativePattern2 = /require\(['"](\.\.\/[^'"]*?)['"]\)/g
    content = content.replace(relativePattern2, (match, modulePath) => {
      // 파일 확장자가 없고, 내장 모듈이 아닌 경우
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        if (modulePath.includes('post.controller')) {
          log(`post.controller ../ 처리 시작: ${modulePath}`, 'DEBUG')
        }
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `require ../ 경로 수정 (특별패턴): ${match} -> require('${newPath}')`,
                'DEBUG'
              )
              return `require('${newPath}')`
            }
          }
        }

        // 특별한 케이스: ../transformers/user.transformer -> ../transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `require ../ 경로 수정 (트랜스포머 경로): ${match} -> require('${transformerFile}')`,
              'DEBUG'
            )
            return `require('${transformerFile}')`
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `require ../ 경로 수정 (트랜스포머 파일): ${match} -> require('${transformerFile}')`,
              'DEBUG'
            )
            return `require('${transformerFile}')`
          }
        }

        // 특별한 디렉토리 케이스들 처리 (우선순위 높음)
        const specialDirectories = [
          'transformers',
          'controllers',
          'services',
          'entities',
          'middlewares',
          'utils',
          'routes',
          'config',
        ]

        for (const dir of specialDirectories) {
          if (modulePath === dir || modulePath.endsWith(`/${dir}`)) {
            if (checkDirectoryExists(modulePath)) {
              modified = true
              log(
                `require ../ 경로 수정 (특별디렉토리): ${match} -> require('${modulePath}/index.cjs')`,
                'DEBUG'
              )
              return `require('${modulePath}/index.cjs')`
            }
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `require ../ 경로 수정 (디렉토리): ${match} -> require('${modulePath}/index.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}/index.cjs')`
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `require ../ 경로 수정 (파일): ${match} -> require('${modulePath}.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}.cjs')`
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `require ../ 경로 수정 (기본): ${match} -> require('${modulePath}.cjs')`,
            'DEBUG'
          )
          return `require('${modulePath}.cjs')`
        }
      }
      return match
    })

    // 4. import 문도 처리 (ES6 모듈) - ./ 경로
    const importPattern = /import\s+.*?\s+from\s+['"](\.\/[^'"]*?)['"]/g
    content = content.replace(importPattern, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `import ./ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `import ./ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: ./transformers/user.transformer -> ./transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `import ./ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `import ./ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `import ./ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `import ./ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    // 5. import 문 ../ 경로 처리
    const importPattern2 = /import\s+.*?\s+from\s+['"](\.\.\/[^'"]*?)['"]/g
    content = content.replace(importPattern2, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `import ../ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: ../transformers/user.transformer -> ../transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `import ../ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `import ../ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `import ../ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `import ../ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `import ../ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    // 6. 추가 패턴: TypeScript 컴파일러가 생성하는 변수 할당 패턴
    // const something = require("./path") 패턴
    const constRequirePattern =
      /const\s+\w+\s*=\s*require\(['"](\.\/[^'"]*?)['"]\)/g
    content = content.replace(constRequirePattern, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `const require ./ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `const require ./ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: ./transformers/user.transformer -> ./transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `const require ./ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `const require ./ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `const require ./ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `const require ./ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    const constRequirePattern2 =
      /const\s+\w+\s*=\s*require\(['"](\.\.\/[^'"]*?)['"]\)/g
    content = content.replace(constRequirePattern2, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `const require ../ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: ../transformers/user.transformer -> ../transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `const require ../ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `const require ../ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `const require ../ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `const require ../ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `const require ../ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    // 7. __importDefault 패턴 처리
    const importDefaultPattern =
      /__importDefault\(require\(['"](\.\/[^'"]*?)['"]\)\)/g
    content = content.replace(importDefaultPattern, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `__importDefault ./ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `__importDefault ./ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: ./transformers/user.transformer -> ./transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `__importDefault ./ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `__importDefault ./ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `__importDefault ./ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `__importDefault ./ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    const importDefaultPattern2 =
      /__importDefault\(require\(['"](\.\.\/[^'"]*?)['"]\)\)/g
    content = content.replace(importDefaultPattern2, (match, modulePath) => {
      if (
        !hasFileExtension(modulePath) &&
        !modulePath.includes('node_modules') &&
        !modulePath.startsWith('@') &&
        !modulePath.startsWith('/') &&
        !builtInModules.has(modulePath) &&
        !modulePath.endsWith('/') &&
        modulePath.length > 0
      ) {
        // 특별한 패턴들 처리 (transformer, controller, service 등)
        const specialPatterns = [
          { pattern: /\.transformer$/, extension: '.transformer.cjs' },
          { pattern: /\.controller$/, extension: '.controller.cjs' },
          { pattern: /\.service$/, extension: '.service.cjs' },
          { pattern: /\.dto$/, extension: '.dto.cjs' },
          { pattern: /\.entity$/, extension: '.entity.cjs' },
          { pattern: /\.middleware$/, extension: '.middleware.cjs' },
          { pattern: /\.util$/, extension: '.util.cjs' },
          { pattern: /\.helper$/, extension: '.helper.cjs' },
          // 추가 패턴들 - 정확한 매칭
          { pattern: /^transformer$/, extension: '.transformer.cjs' },
          { pattern: /^controller$/, extension: '.controller.cjs' },
          { pattern: /^service$/, extension: '.service.cjs' },
          { pattern: /^dto$/, extension: '.dto.cjs' },
          { pattern: /^entity$/, extension: '.entity.cjs' },
          { pattern: /^middleware$/, extension: '.middleware.cjs' },
          { pattern: /^util$/, extension: '.util.cjs' },
          { pattern: /^helper$/, extension: '.helper.cjs' },
        ]

        // 특별한 패턴 확인
        for (const specialPattern of specialPatterns) {
          if (specialPattern.pattern.test(modulePath)) {
            // .controller, .service 등의 패턴을 .controller.cjs, .service.cjs로 변경
            const newPath = modulePath.replace(
              specialPattern.pattern,
              specialPattern.extension
            )
            if (checkFileExists(newPath)) {
              modified = true
              log(
                `__importDefault ../ 경로 수정 (특별패턴): ${match} -> ${match.replace(modulePath, newPath)}`,
                'DEBUG'
              )
              return match.replace(modulePath, newPath)
            }
          }
        }

        // 특별한 케이스: ../transformers/user.transformer -> ../transformers/user.transformer.cjs
        if (
          modulePath.includes('/transformers/') &&
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `__importDefault ../ 경로 수정 (트랜스포머 경로): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 특별한 케이스: user.transformer -> user.transformer.cjs
        if (
          modulePath.includes('.transformer') &&
          !modulePath.endsWith('.cjs')
        ) {
          const transformerFile = `${modulePath}.cjs`
          if (checkFileExists(transformerFile)) {
            modified = true
            log(
              `__importDefault ../ 경로 수정 (트랜스포머 파일): ${match} -> ${match.replace(modulePath, transformerFile)}`,
              'DEBUG'
            )
            return match.replace(modulePath, transformerFile)
          }
        }

        // 디렉토리가 존재하는지 먼저 확인 (파일보다 우선)
        if (checkDirectoryExists(modulePath)) {
          modified = true
          log(
            `__importDefault ../ 경로 수정 (디렉토리): ${match} -> ${match.replace(modulePath, `${modulePath}/index.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}/index.cjs`)
        }
        // 파일이 존재하는지 확인
        else if (checkFileExists(`${modulePath}.cjs`)) {
          modified = true
          log(
            `__importDefault ../ 경로 수정 (파일): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
        // 기본적으로 .cjs 확장자 추가
        else {
          modified = true
          log(
            `__importDefault ../ 경로 수정 (기본): ${match} -> ${match.replace(modulePath, `${modulePath}.cjs`)}`,
            'DEBUG'
          )
          return match.replace(modulePath, `${modulePath}.cjs`)
        }
      }
      return match
    })

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      log(`require 경로 수정: ${path.basename(filePath)}`)
      return { modified: true, changeCount: 0 } // changeCount는 나중에 추가할 수 있음
    }
    return { modified: false, changeCount: 0 }
  } catch (error) {
    logError(error, `require 경로 수정 실패: ${filePath}`)
    return { modified: false, changeCount: 0 }
  }
}

// 디렉토리 재귀 복사
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const items = fs.readdirSync(src)
  for (const item of items) {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 디렉토리 재귀 삭제 (Windows 권한 문제 해결)
function deleteDirectoryRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return
  }

  try {
    const items = fs.readdirSync(dirPath)
    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        deleteDirectoryRecursive(itemPath)
      } else {
        try {
          fs.unlinkSync(itemPath)
        } catch (error) {
          // 개별 파일 삭제 실패는 무시하고 계속 진행
          logWarning(`파일 삭제 실패 (무시): ${itemPath}`, '디렉토리 삭제')
        }
      }
    }

    try {
      fs.rmdirSync(dirPath)
    } catch (error) {
      // 디렉토리 삭제 실패는 무시
      logWarning(`디렉토리 삭제 실패 (무시): ${dirPath}`, '디렉토리 삭제')
    }
  } catch (error) {
    logWarning(`디렉토리 읽기 실패: ${dirPath}`, '디렉토리 삭제')
  }
}

// 빌드 통계 - 개선된 버전
function getBuildStats(dir) {
  let files = 0
  let totalSize = 0
  let cjsFiles = 0
  let jsFiles = 0
  let otherFiles = 0

  function countFiles(currentPath) {
    try {
      const items = fs.readdirSync(currentPath)
      for (const item of items) {
        const itemPath = path.join(currentPath, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          countFiles(itemPath)
        } else {
          files++
          totalSize += stat.size

          // 파일 타입별 카운트
          if (item.endsWith('.cjs')) {
            cjsFiles++
          } else if (item.endsWith('.js')) {
            jsFiles++
          } else {
            otherFiles++
          }
        }
      }
    } catch (error) {
      logWarning(`디렉토리 읽기 실패: ${currentPath}`, '빌드 통계')
    }
  }

  countFiles(dir)

  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)
  return {
    files,
    size: `${sizeInMB}MB`,
    cjsFiles,
    jsFiles,
    otherFiles,
  }
}

// 파일 존재 여부 검증
function validateFileExists(filePath, context = '') {
  if (!fs.existsSync(filePath)) {
    const error = new Error(`파일이 존재하지 않음: ${filePath}`)
    logError(error, context)
    return false
  }
  return true
}

// 디렉토리 생성 (안전한 버전)
function ensureDirectoryExists(dirPath, context = '') {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      log(`디렉토리 생성: ${dirPath}`, context)
    }
    return true
  } catch (error) {
    logError(error, `디렉토리 생성 실패: ${dirPath}`)
    return false
  }
}

// 메인 실행
if (require.main === module) {
  buildOptimizedBackend()
    .then(() => {
      log('빌드 성공적으로 완료됨')
      process.exit(0)
    })
    .catch(error => {
      logError(error, '빌드 실패')
      process.exit(1)
    })
}

module.exports = { buildOptimizedBackend }
