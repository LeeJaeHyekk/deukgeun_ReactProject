/**
 * 변환 스크립트 타입 정의
 */

export interface ConversionOptions {
  projectRoot: string
  distPath: string
  verbose: boolean
  dryRun: boolean
  backup: boolean
  fixPathAliases: boolean
  fixDependencies: boolean
}

export interface ConversionStats {
  filesProcessed: number
  filesConverted: number
  pathAliasesFixed: number
  dependenciesFixed: number
  errors: number
}

export interface CachedFiles {
  jsFiles: string[]
  cjsFiles: string[]
  lastScan: number
}

export interface PathAliasMap {
  [alias: string]: string
}

export interface FileSearchResult {
  found: boolean
  relativePath: string
  absolutePath?: string
}

export interface PathResolutionContext {
  fromFile: string
  fromDir: string
  backendBackendDir: string
  distPath: string
}

