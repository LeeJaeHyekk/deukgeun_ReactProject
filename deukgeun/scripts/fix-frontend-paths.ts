#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface PathMapping {
  from: string
  to: string
}

// 프론트엔드와 공유 모듈의 경로 매핑
const pathMappings: PathMapping[] = [
  // 공유 모듈 경로들
  { from: '../../../shared/', to: '@shared/' },
  { from: '../../shared/', to: '@shared/' },
  { from: '../shared/', to: '@shared/' },
  { from: './shared/', to: '@shared/' },
  
  // 프론트엔드 내부 경로들
  { from: '../../../frontend/', to: '@frontend/' },
  { from: '../../frontend/', to: '@frontend/' },
  { from: '../frontend/', to: '@frontend/' },
  { from: './frontend/', to: '@frontend/' },
  
  // 상대경로 패턴들
  { from: '../../../', to: '@/' },
  { from: '../../', to: '@/' },
  { from: '../', to: '@/' },
  { from: './', to: '@/' },
]

// 특별한 경우들을 위한 경로 변환 함수
function convertRelativePath(filePath: string, importPath: string): string {
  // 이미 절대경로인 경우 그대로 반환
  if (importPath.startsWith('@') || importPath.startsWith('/') || importPath.startsWith('http')) {
    return importPath
  }

  // 상대경로가 아닌 경우 그대로 반환
  if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
    return importPath
  }

  const projectRoot = join(__dirname, '..')
  
  // 파일의 절대 경로 계산
  const absoluteFilePath = join(projectRoot, filePath)
  const absoluteFileDir = dirname(absoluteFilePath)
  
  // import 경로의 절대 경로 계산
  const absoluteImportPath = join(absoluteFileDir, importPath)
  
  // 프로젝트 루트 기준 상대 경로 계산
  const relativeToRoot = relative(projectRoot, absoluteImportPath)
  
  // 경로를 절대경로로 변환
  if (relativeToRoot.startsWith('src/shared/')) {
    return `@shared/${relativeToRoot.replace('src/shared/', '')}`
  } else if (relativeToRoot.startsWith('src/frontend/')) {
    return `@frontend/${relativeToRoot.replace('src/frontend/', '')}`
  } else if (relativeToRoot.startsWith('src/')) {
    return `@/${relativeToRoot.replace('src/', '')}`
  }
  
  return importPath
}

function processFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8')
    let modified = false
    let newContent = content

    // import/export 문에서 상대경로 찾기
    const importRegex = /(import\s+.*?\s+from\s+['"])([^'"]+)(['"])/g
    const exportRegex = /(export\s+.*?\s+from\s+['"])([^'"]+)(['"])/g
    
    // import 문 처리
    newContent = newContent.replace(importRegex, (match, prefix, importPath, suffix) => {
      const convertedPath = convertRelativePath(filePath, importPath)
      if (convertedPath !== importPath) {
        modified = true
        return `${prefix}${convertedPath}${suffix}`
      }
      return match
    })
    
    // export 문 처리
    newContent = newContent.replace(exportRegex, (match, prefix, importPath, suffix) => {
      const convertedPath = convertRelativePath(filePath, importPath)
      if (convertedPath !== importPath) {
        modified = true
        return `${prefix}${convertedPath}${suffix}`
      }
      return match
    })

    if (modified) {
      writeFileSync(filePath, newContent, 'utf-8')
      console.log(`✅ Updated: ${filePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
    return false
  }
}

function processDirectory(dirPath: string): number {
  let processedCount = 0
  
  try {
    const items = readdirSync(dirPath)
    
    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // node_modules, dist, .git 등은 제외
        if (!['node_modules', 'dist', '.git', '.next', 'build'].includes(item)) {
          processedCount += processDirectory(fullPath)
        }
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        if (processFile(fullPath)) {
          processedCount++
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error)
  }
  
  return processedCount
}

function main() {
  console.log('🚀 Starting frontend and shared module path conversion...')
  
  const projectRoot = join(__dirname, '..')
  const frontendPath = join(projectRoot, 'src', 'frontend')
  const sharedPath = join(projectRoot, 'src', 'shared')
  
  let totalProcessed = 0
  
  // 프론트엔드 처리
  if (statSync(frontendPath).isDirectory()) {
    console.log('\n📁 Processing frontend directory...')
    totalProcessed += processDirectory(frontendPath)
  }
  
  // 공유 모듈 처리
  if (statSync(sharedPath).isDirectory()) {
    console.log('\n📁 Processing shared directory...')
    totalProcessed += processDirectory(sharedPath)
  }
  
  console.log(`\n✨ Path conversion completed! Processed ${totalProcessed} files.`)
}

// ES 모듈에서 직접 실행
main()
