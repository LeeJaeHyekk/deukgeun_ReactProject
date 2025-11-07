/**
 * __dirname 선언 제거 모듈
 */

export class DirnameRemover {
  /**
   * __dirname 선언 제거 (정교한 버전)
   * 패턴 순서: 구체적인 패턴부터 일반적인 패턴 순서로 실행
   */
  static removeDirnameDeclarations(content: string): string {
    let convertedContent = content
    
    // ============================================================================
    // 1단계: 가장 구체적인 패턴부터 처리 (pathUtils_1.getDirname() 패턴)
    // ============================================================================
    
    // 패턴 1: const __dirname = (0, pathUtils_1.getDirname)(); (가장 구체적)
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*\(0,\s*pathUtils_\d+\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 2: const __dirname = (0, pathUtils_1.getDirname)(); (공백 허용)
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*\(0,\s*[^)]+\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 3: const __dirname = (0, pathUtils_1.getDirname)(); (공백 포함)
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*\(0,\s*[^)]*\)\s*\.\s*getDirname\s*\(\s*\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // ============================================================================
    // 2단계: pathUtils 관련 패턴 (getDirname() 호출 포함)
    // ============================================================================
    
    // 패턴 4: const __dirname = pathUtils_1.getDirname();
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*pathUtils_\w+\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 5: const __dirname = (pathUtils_1.getDirname)();
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*\([^)]*pathUtils[^)]*\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 6: getDirname() 호출이 있는 모든 __dirname 선언
    convertedContent = convertedContent.replace(
      /(const|let|var)\s+__dirname\s*=\s*[^)]*getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // ============================================================================
    // 3단계: require() 패턴
    // ============================================================================
    
    // 패턴 7: const __dirname = require('utils/pathUtils').getDirname();
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*require\(['"][^'"]*pathUtils[^'"]*['"]\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 8: const __dirname = require('path').dirname(__filename)
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*require\(['"]path['"]\)\.dirname\(__filename\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 9: const __dirname = require("path").dirname(__filename) (다른 따옴표)
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*require\(["']path["']\)\.dirname\(__filename\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // ============================================================================
    // 4단계: 기타 패턴
    // ============================================================================
    
    // 패턴 10: const __dirname = getDirname();
    convertedContent = convertedContent.replace(
      /const\s+__dirname\s*=\s*getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 11: let __dirname = ... 또는 var __dirname = ... (다른 선언 키워드)
    convertedContent = convertedContent.replace(
      /(let|var)\s+__dirname\s*=\s*[^;]+;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // ============================================================================
    // 5단계: 최종 포괄적 패턴 (모든 __dirname 선언 제거)
    // ============================================================================
    
    // 패턴 12: 모든 __dirname 선언 제거 (최종 포괄적 패턴)
    convertedContent = convertedContent.replace(
      /(const|let|var)\s+__dirname\s*=\s*[^;]+;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 13: multiline 패턴으로 재확인 (줄바꿈 포함)
    convertedContent = convertedContent.replace(
      /(const|let|var)\s+__dirname\s*=\s*[^;]+;?\s*/gm,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    return convertedContent
  }

  /**
   * __dirname 선언이 남아있는지 확인
   */
  static hasDirnameDeclaration(content: string): boolean {
    return content.includes('const __dirname') || 
           content.includes('let __dirname') || 
           content.includes('var __dirname')
  }
}

