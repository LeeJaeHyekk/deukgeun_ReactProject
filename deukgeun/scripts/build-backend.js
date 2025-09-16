#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 Building backend...')

try {
  const projectRoot = path.join(__dirname, '..')
  const backendDir = path.join(projectRoot, 'src/backend')
  const distPath = path.join(projectRoot, 'dist/backend')

  // dist 디렉토리 생성
  if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
    fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true })
  }

  // 백엔드 의존성 확인 및 설치 (필요한 경우에만)
  const nodeModulesPath = path.join(backendDir, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing backend dependencies...')
    execSync('npm install', {
      cwd: backendDir,
      stdio: 'inherit',
    })
  } else {
    console.log('📦 Backend dependencies already installed, skipping...')
  }

  // 기존 빌드 결과 정리
  if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning previous build...')
    fs.rmSync(distPath, { recursive: true, force: true })
  }

  // 백엔드 빌드
  console.log('🏗️  Building backend TypeScript...')
  execSync('npx tsc -p tsconfig.json', {
    cwd: backendDir,
    stdio: 'inherit',
  })

  // .js 파일을 .cjs로 변경 (ES 모듈 문제 해결)
  console.log('📁 Converting .js files to .cjs for CommonJS compatibility...')
  const jsFiles = findJsFiles(distPath)
  for (const file of jsFiles) {
    const cjsFile = file.replace(/\.js$/, '.cjs')
    fs.renameSync(file, cjsFile)

    // 파일 내용에서 .js 참조를 .cjs로 변경
    let content = fs.readFileSync(cjsFile, 'utf8')

    // 상대 경로 .js 참조를 .cjs로 변경 (확장자가 없는 경우도 포함)
    content = content.replace(
      /require\(['"](\.\/[^'"]*?)\.js['"]\)/g,
      "require('$1.cjs')"
    )
    content = content.replace(
      /require\(['"](\.\.\/[^'"]*?)\.js['"]\)/g,
      "require('$1.cjs')"
    )

    // 확장자가 없는 상대 경로 참조를 .cjs로 변경 (백엔드 내부 모듈)
    content = content.replace(
      /require\(['"](\.\/[^'"]*?)['"]\)/g,
      (match, modulePath) => {
        // node_modules나 외부 모듈이 아닌 경우에만 .cjs 추가
        if (!modulePath.includes('/') && !modulePath.startsWith('@')) {
          // 디렉토리 참조인지 확인 (routes, controllers 등)
          const indexPath = path.join(
            path.dirname(cjsFile),
            modulePath,
            'index.cjs'
          )
          const directFile = path.join(
            path.dirname(cjsFile),
            `${modulePath}.cjs`
          )

          console.log(
            `🔍 Checking ${modulePath}: index=${fs.existsSync(indexPath)}, direct=${fs.existsSync(directFile)}`
          )

          if (fs.existsSync(indexPath)) {
            console.log(
              `✅ Converting ${modulePath} to ${modulePath}/index.cjs`
            )
            return `require('${modulePath}/index.cjs')`
          } else if (fs.existsSync(directFile)) {
            console.log(`✅ Converting ${modulePath} to ${modulePath}.cjs`)
            return `require('${modulePath}.cjs')`
          }
          return match // 외부 모듈은 그대로 유지
        }
        return `require('${modulePath}.cjs')`
      }
    )

    content = content.replace(
      /require\(['"](\.\.\/[^'"]*?)['"]\)/g,
      (match, modulePath) => {
        // node_modules나 외부 모듈이 아닌 경우에만 .cjs 추가
        if (!modulePath.includes('/') && !modulePath.startsWith('@')) {
          return match // 외부 모듈은 그대로 유지
        }
        return `require('${modulePath}.cjs')`
      }
    )

    fs.writeFileSync(cjsFile, content)
  }

  // 빌드된 파일을 올바른 위치로 이동
  const backendBuildPath = path.join(distPath, 'backend')
  if (fs.existsSync(backendBuildPath)) {
    console.log('📁 Moving backend build files...')
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
  }

  // 백엔드 node_modules를 dist/backend로 복사
  console.log('📦 Copying backend node_modules...')
  const backendNodeModules = path.join(backendDir, 'node_modules')
  const distNodeModules = path.join(distPath, 'node_modules')

  if (fs.existsSync(backendNodeModules)) {
    if (fs.existsSync(distNodeModules)) {
      fs.rmSync(distNodeModules, { recursive: true, force: true })
    }

    // node_modules 복사 (심볼릭 링크 문제 방지를 위해 cp 명령어 사용)
    try {
      // Windows와 Unix 모두 지원하는 복사 방법
      const isWindows = process.platform === 'win32'
      if (isWindows) {
        // Windows에서는 robocopy 또는 xcopy 사용
        try {
          execSync(
            `robocopy "${backendNodeModules}" "${distNodeModules}" /E /NFL /NDL /NJH /NJS /nc /ns /np`,
            {
              stdio: 'inherit',
              cwd: projectRoot,
            }
          )
        } catch (error) {
          // robocopy가 실패하면 xcopy 시도
          execSync(
            `xcopy "${backendNodeModules}" "${distNodeModules}" /E /I /H /Y`,
            {
              stdio: 'inherit',
              cwd: projectRoot,
            }
          )
        }
      } else {
        // Unix/Linux에서는 cp 사용
        execSync(`cp -r "${backendNodeModules}" "${distNodeModules}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
        })
      }
      console.log('✅ Backend node_modules copied successfully')
    } catch (error) {
      console.warn(
        '⚠️ Failed to copy node_modules with system commands, trying Node.js method...'
      )
      // 최후의 수단으로 Node.js로 복사
      copyDirectoryRecursive(backendNodeModules, distNodeModules)
    }
  } else {
    console.warn('⚠️ Backend node_modules not found, skipping copy')
  }

  // 빌드 결과 확인 및 검증
  if (fs.existsSync(distPath)) {
    console.log('✅ Backend build completed successfully!')
    console.log(`📁 Build output: ${distPath}`)

    // 빌드 통계 출력
    const buildStats = getBuildStats(distPath)
    console.log(`📊 Build stats: ${buildStats.files} files, ${buildStats.size}`)

    // 필수 파일 존재 확인
    const requiredFiles = [
      'index.cjs',
      'app.cjs',
      'config/database.cjs',
      'config/env.cjs',
      'routes/index.cjs',
    ]

    console.log('🔍 Verifying required files...')
    const missingFiles = []
    for (const file of requiredFiles) {
      const filePath = path.join(distPath, file)
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file)
      }
    }

    if (missingFiles.length > 0) {
      console.error('❌ Missing required files:')
      missingFiles.forEach(file => console.error(`   - ${file}`))
      throw new Error(
        `Build verification failed - missing ${missingFiles.length} required files`
      )
    }

    console.log('✅ All required files are present')

    // 모듈 의존성 검증
    console.log('🔍 Verifying module dependencies...')
    try {
      // app.cjs에서 routes 모듈이 올바르게 참조되는지 확인
      const appContent = fs.readFileSync(path.join(distPath, 'app.cjs'), 'utf8')
      if (appContent.includes("require('./routes.cjs')")) {
        console.warn('⚠️ Found incorrect routes reference in app.cjs')
        // 자동 수정
        const correctedContent = appContent.replace(
          "require('./routes.cjs')",
          "require('./routes/index.cjs')"
        )
        fs.writeFileSync(path.join(distPath, 'app.cjs'), correctedContent)
        console.log('✅ Fixed routes reference in app.cjs')
      }
    } catch (error) {
      console.warn('⚠️ Could not verify app.cjs dependencies:', error.message)
    }

    // .cjs 파일 개수 확인
    const cjsFiles = findCjsFiles(distPath)
    console.log(`📄 Converted ${cjsFiles.length} files to .cjs format`)
  } else {
    throw new Error('Backend build failed - dist directory not found')
  }
} catch (error) {
  console.error('❌ Backend build failed:', error.message)
  process.exit(1)
}

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

function getBuildStats(dir) {
  let files = 0
  let totalSize = 0

  function countFiles(currentPath) {
    const items = fs.readdirSync(currentPath)
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        countFiles(itemPath)
      } else {
        files++
        totalSize += stat.size
      }
    }
  }

  countFiles(dir)

  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)
  return { files, size: `${sizeInMB}MB` }
}
