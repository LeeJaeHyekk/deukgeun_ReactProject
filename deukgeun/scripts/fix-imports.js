#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// dist/backend 디렉토리에서 모든 .cjs 파일 찾기
function findCjsFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      files.push(...findCjsFiles(itemPath))
    } else if (item.endsWith('.cjs')) {
      files.push(itemPath)
    }
  }

  return files
}

// 파일 내용에서 잘못된 import 경로 수정
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // ./routes.cjs -> ./routes/index.cjs
  if (content.includes("require('./routes.cjs')")) {
    content = content.replace(
      /require\(['"]\.\/routes\.cjs['"]\)/g,
      "require('./routes/index.cjs')"
    )
    modified = true
  }

  // ./config/database.cjs -> ./config/database.cjs (이미 올바름)
  // ./middlewares/errorHandler.cjs -> ./middlewares/errorHandler.cjs (이미 올바름)

  // 다른 잘못된 경로들도 수정
  const fixes = [
    // 상대 경로에서 .cjs가 잘못된 경우들
    {
      from: /require\(['"]\.\.\/([^'"]*?)\.cjs['"]\)/g,
      to: (match, modulePath) => {
        // 디렉토리인지 확인
        const dirPath = path.join(path.dirname(filePath), '..', modulePath)
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          const indexPath = path.join(dirPath, 'index.cjs')
          if (fs.existsSync(indexPath)) {
            return `require('../${modulePath}/index.cjs')`
          }
        }
        return match
      },
    },
    {
      from: /require\(['"]\.\/([^'"]*?)\.cjs['"]\)/g,
      to: (match, modulePath) => {
        // 디렉토리인지 확인
        const dirPath = path.join(path.dirname(filePath), modulePath)
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          const indexPath = path.join(dirPath, 'index.cjs')
          if (fs.existsSync(indexPath)) {
            return `require('./${modulePath}/index.cjs')`
          }
        }
        return match
      },
    },
  ]

  for (const fix of fixes) {
    const newContent = content.replace(fix.from, fix.to)
    if (newContent !== content) {
      content = newContent
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(
      `✅ Fixed imports in: ${path.relative(process.cwd(), filePath)}`
    )
  }
}

// 메인 실행
function main() {
  const distPath = path.join(__dirname, '../dist/backend')

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist/backend directory not found')
    process.exit(1)
  }

  console.log('🔧 Fixing import paths in .cjs files...')

  const cjsFiles = findCjsFiles(distPath)
  console.log(`📁 Found ${cjsFiles.length} .cjs files`)

  for (const file of cjsFiles) {
    fixImports(file)
  }

  console.log('✅ Import path fixing completed!')
}

main()
