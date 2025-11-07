/**
 * ESM 문법 변환 모듈
 */

export class EsmConverter {
  // ESM 문법 감지용 정규식 패턴
  private static readonly esmPatterns = {
    import: /import\s+[^;]*from\s*['"]|import\s*\(|import\s*\{|import\s*\*|import\s+React|import\s+type\s+/,
    export: /export\s+[^;]*from\s*['"]|export\s*\{|export\s*\*|export\s+default|export\s+(const|let|var|function|class|async\s+function)|export\s+enum\s+|export\s+interface\s+/,
    importMeta: /import\.meta/,
    emptyExport: /export\s*\{\s*\}\s*;?/,
    dynamicImport: /import\s*\(/
  }

  /**
   * ESM 문법이 있는지 확인
   */
  static hasEsmSyntax(content: string): boolean {
    return this.esmPatterns.import.test(content) ||
           this.esmPatterns.export.test(content) ||
           this.esmPatterns.importMeta.test(content) ||
           this.esmPatterns.emptyExport.test(content) ||
           this.esmPatterns.dynamicImport.test(content)
  }

  /**
   * 이미 CommonJS 형태인지 확인
   */
  static isAlreadyCommonJS(content: string): boolean {
    const hasUseStrict = content.includes('"use strict"')
    const hasRequire = /require\s*\(/.test(content)
    const hasExports = /exports\.|module\.exports/.test(content)
    const hasObjectDefineProperty = content.includes('Object.defineProperty(exports')
    
    return hasUseStrict && (hasRequire || hasExports || hasObjectDefineProperty)
  }

  /**
   * import/export 변환이 필요한지 확인
   */
  static needsImportExportConversion(content: string): boolean {
    const hasImport = /import\s*[^;]*from\s*['"]/.test(content) || content.includes('import ')
    const hasExport = /export\s*[^;]*from\s*['"]/.test(content) || content.includes('export ')
    const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content)
    const hasExportDefault = /export\s+default/.test(content)
    const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content)
    const hasImportMeta = content.includes('import.meta')
    
    return hasImport || hasExport || hasEmptyExport || hasExportDefault || hasExportDeclaration || hasImportMeta
  }

  /**
   * import.meta.env 변환
   */
  static convertImportMetaEnv(content: string): string {
    let convertedContent = content
    
    if (convertedContent.includes('import.meta.env')) {
      // VITE_ 변수들 먼저 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1')
      
      // 특수 변수들 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV')
      convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"')
      convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"')
      
      // 일반 환경 변수들 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1')
      
      // 나머지 import.meta.env 처리
      convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env')
    }
    
    return convertedContent
  }

  /**
   * import/export 변환
   */
  static convertImportExport(content: string, filePath: string): string {
    let convertedContent = content
    
    // 1. 명명된 import 변환
    convertedContent = convertedContent.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g,
      (match, imports, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        const convertedImports = imports.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2')
        return `const { ${convertedImports} } = require('${resolvedPath}')`
      }
    )
    
    // 2. 기본 import 변환
    convertedContent = convertedContent.replace(
      /import\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g,
      (match, importName, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `const ${importName} = require('${resolvedPath}')`
      }
    )
    
    // 3. import "module" 변환 (side-effect import)
    convertedContent = convertedContent.replace(
      /import\s*['"]([^'"]+)['"]/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `require('${resolvedPath}')`
      }
    )
    
    // 4. 네임스페이스 import 변환
    convertedContent = convertedContent.replace(
      /import\s*\*\s*as\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g,
      (match, namespaceName, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `const ${namespaceName} = require('${resolvedPath}')`
      }
    )
    
    // 5. 동적 import 변환
    convertedContent = convertedContent.replace(
      /import\s*\(['"]([^'"]+)['"]\)/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `require('${resolvedPath}')`
      }
    )
    
    // 6. 기본 export 변환
    convertedContent = convertedContent.replace(
      /export\s+default\s+([^;]+)/g,
      'module.exports = $1'
    )
    
    // 7. 명명된 export 변환
    convertedContent = convertedContent.replace(
      /export\s*\{\s*([^}]+)\s*\}/g,
      (match: string, exports: string) => {
        return exports.split(',').map(exp => {
          exp = exp.trim()
          if (exp.includes(' as ')) {
            const [original, alias] = exp.split(' as ').map(s => s.trim())
            return `module.exports.${alias} = ${original}`
          }
          return `module.exports.${exp} = ${exp}`
        }).join('\n')
      }
    )
    
    // 8. export * from 변환
    convertedContent = convertedContent.replace(
      /export\s*\*\s*from\s*['"]([^'"]+)['"]/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `Object.assign(module.exports, require('${resolvedPath}'))`
      }
    )
    
    // 9. export const/let/var/function/class 변환
    convertedContent = convertedContent.replace(
      /export\s+(const|let|var|function|class)\s+(\w+)/g,
      (match, declaration, name) => {
        return `${declaration} ${name}\nmodule.exports.${name} = ${name}`
      }
    )
    
    // 10. export function 변환
    convertedContent = convertedContent.replace(
      /export\s+function\s+(\w+)/g,
      (match, name) => {
        return `function ${name}`
      }
    )
    
    // 11. export async function 변환
    convertedContent = convertedContent.replace(
      /export\s+async\s+function\s+(\w+)/g,
      (match, name) => {
        return `async function ${name}`
      }
    )
    
    // 12-15. 빈 export 문 제거
    convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;?/g, '')
    convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;/g, '')
    convertedContent = convertedContent.replace(/export\s*\{\s*\}/g, '')
    convertedContent = convertedContent.replace(/export\s*\{\s*[^}]*\}/g, '')
    
    // 16-17. TypeScript 타입 전용 import/export 제거
    convertedContent = convertedContent.replace(/^import\s+type\s+[^;]+;?\s*$/gm, '')
    convertedContent = convertedContent.replace(/^export\s+type\s+[^;]+;?\s*$/gm, '')
    
    // 18. TypeScript interface export 제거
    convertedContent = convertedContent.replace(/^export\s+interface\s+[^{]*\{[^}]*\};?\s*$/gm, '')

    // 19. TypeScript enum export 변환
    convertedContent = convertedContent.replace(
      /export\s+enum\s+(\w+)\s*\{([^}]*)\}/g,
      (match, enumName, enumBody) => {
        const enumValues = enumBody.split(',').map((item: string) => {
          const trimmed = item.trim()
          if (trimmed.includes('=')) {
            return trimmed
          }
          return `${trimmed} = "${trimmed}"`
        }).join(', ')
        
        return `const ${enumName} = {\n  ${enumValues}\n}\nmodule.exports.${enumName} = ${enumName}`
      }
    )

    // 20-22. React import 변환
    convertedContent = convertedContent.replace(
      /import\s+React\s*,\s*\{([^}]+)\}\s*from\s*['"]react['"]/g,
      (match, reactImports) => {
        const imports = reactImports.split(',').map((imp: string) => imp.trim()).join(', ')
        return `const React = require('react')\nconst { ${imports} } = require('react')`
      }
    )

    convertedContent = convertedContent.replace(
      /import\s+React\s*from\s*['"]react['"]/g,
      'const React = require("react")'
    )

    convertedContent = convertedContent.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g,
      (match, hooks) => {
        const hookList = hooks.split(',').map((hook: string) => hook.trim()).join(', ')
        return `const { ${hookList} } = require('react')`
      }
    )

    // 23. 남은 export 문들 제거
    convertedContent = convertedContent.replace(/^export\s*\{\s*[^}]*\};?\s*$/gm, '')

    return convertedContent
  }

  /**
   * 모듈 경로 해석
   */
  private static resolveModulePath(modulePath: string, currentFilePath: string): string {
    if (modulePath.startsWith('/') || !modulePath.startsWith('.')) {
      return modulePath
    }
    
    if (modulePath.endsWith('.js')) {
      return modulePath.replace('.js', '.cjs')
    }
    
    return modulePath
  }

  /**
   * 기타 ESM 문법 변환
   */
  static convertOtherEsmSyntax(content: string): string {
    let convertedContent = content
    
    // import() 동적 import 변환
    convertedContent = convertedContent.replace(
      /import\(['"]([^'"]+)['"]\)/g,
      "require('$1')"
    )
    
    // import.meta.url 변환
    if (convertedContent.includes('import.meta.url')) {
      convertedContent = convertedContent.replace(
        /import\.meta\.url/g,
        '__filename'
      )
    }
    
    // __dirname 선언 제거는 별도 모듈에서 처리
    
    // path require 추가
    if (convertedContent.includes('__dirname') && 
        (convertedContent.includes('path.resolve') || convertedContent.includes('path.join'))) {
      if (!convertedContent.includes('const path = require(') && 
          !convertedContent.includes('import path from') &&
          !convertedContent.includes('require("path")') &&
          !convertedContent.includes("require('path')")) {
        convertedContent = `const path = require('path');\n${convertedContent}`
      }
    }
    
    return convertedContent
  }

  /**
   * 변환된 내용 정리
   */
  static cleanupConvertedContent(content: string): string {
    let cleanedContent = content
    
    // 연속된 빈 줄을 하나로 줄이기
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n')
    
    // 파일 끝의 불필요한 세미콜론과 빈 줄 제거
    cleanedContent = cleanedContent.replace(/;\s*$/, '')
    cleanedContent = cleanedContent.replace(/\n\s*$/, '')
    
    // 빈 export 문이 남아있으면 제거
    cleanedContent = cleanedContent.replace(/export\s*\{\s*\}\s*;?/g, '')
    
    return cleanedContent
  }
}

