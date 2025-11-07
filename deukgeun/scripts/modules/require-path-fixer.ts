/**
 * require 경로 수정 모듈
 */

import * as fs from 'fs'
import * as path from 'path'
import { PathResolutionContext } from './converter-types'
import { PathFinder } from './path-finder'
import { isExternalPath, normalizeRelativePath, removeExtension } from './converter-utils'
import { PathAliasResolver } from './path-alias-resolver'

export class RequirePathFixer {
  /**
   * require 경로 확장자를 .cjs로 수정 및 경로 검증
   */
  static fixRequireExtensions(
    content: string,
    filePath: string,
    distPath: string
  ): string {
    let convertedContent = content
    const fromDir = path.dirname(filePath)
    const backendBackendDir = path.resolve(distPath, 'backend', 'backend')

    const context: PathResolutionContext = {
      fromFile: filePath,
      fromDir,
      backendBackendDir,
      distPath
    }

    // 1. .js 확장자를 .cjs로 변경
    convertedContent = this.fixJsExtensions(convertedContent, context)

    // 2. 확장자가 없는 상대 경로 처리
    convertedContent = this.fixRelativePaths(convertedContent, context)

    return convertedContent
  }

  /**
   * .js 확장자를 .cjs로 변경
   */
  private static fixJsExtensions(
    content: string,
    context: PathResolutionContext
  ): string {
    let convertedContent = content

    // ./module.js -> .cjs
    convertedContent = convertedContent.replace(
      /require\(['"]\.\/([^'"]+)\.js['"]\)/g,
      (match, moduleName) => {
        const result = PathFinder.findActualFile(moduleName, context)
        if (result.found) {
          return `require('${result.relativePath}')`
        }
        return `require('./${moduleName}.cjs')`
      }
    )

    // ../module.js -> .cjs
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/([^'"]+)\.js['"]\)/g,
      (match, moduleName) => {
        const newContext = {
          ...context,
          fromDir: path.join(context.fromDir, '..')
        }
        const result = PathFinder.findActualFile(moduleName, newContext)
        if (result.found) {
          return `require('${result.relativePath}')`
        }
        return `require('../${moduleName}.cjs')`
      }
    )

    // ../../module.js -> .cjs
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/\.\.\/([^'"]+)\.js['"]\)/g,
      (match, moduleName) => {
        const newContext = {
          ...context,
          fromDir: path.join(context.fromDir, '..', '..')
        }
        const result = PathFinder.findActualFile(moduleName, newContext)
        if (result.found) {
          return `require('${result.relativePath}')`
        }
        return `require('../../${moduleName}.cjs')`
      }
    )

    return convertedContent
  }

  /**
   * 확장자가 없는 상대 경로 처리 (개선된 버전)
   */
  private static fixRelativePaths(
    content: string,
    context: PathResolutionContext
  ): string {
    let convertedContent = content

    // ./module (확장자 없음 또는 .cjs 포함)
    convertedContent = convertedContent.replace(
      /require\(['"]\.\/([^'"]+)['"]\)/g,
      (match, moduleName) => {
        // 이미 .cjs 확장자가 있으면 처리
        if (moduleName.endsWith('.cjs')) {
          // 확장자 제거하고 다시 처리
          const baseName = moduleName.replace(/\.cjs$/, '')
          const result = PathFinder.findActualFile(baseName, context)
          if (result.found) {
            return `require('${result.relativePath}')`
          }
          
          // 현재 디렉토리 확인
          const currentDirPath = path.join(context.fromDir, `${baseName}.cjs`)
          if (fs.existsSync(currentDirPath)) {
            return `require('./${baseName}.cjs')`
          }
          
          // 상위 디렉토리 확인 (1~3단계)
          for (let level = 1; level <= 3; level++) {
            const parentDir = path.join(context.fromDir, ...Array(level).fill('..'))
            const parentDirPath = path.join(parentDir, `${baseName}.cjs`)
            if (fs.existsSync(parentDirPath)) {
              const relativePath = path.relative(context.fromDir, parentDirPath)
              return `require('${normalizeRelativePath(relativePath)}')`
            }
          }
          
          return match
        }

        if (isExternalPath(moduleName)) {
          return match
        }

        const result = PathFinder.findActualFile(moduleName, context)
        if (result.found) {
          return `require('${result.relativePath}')`
        }

        // 현재 디렉토리 확인
        const currentDirPath = path.join(context.fromDir, `${moduleName}.cjs`)
        if (fs.existsSync(currentDirPath)) {
          return `require('./${moduleName}.cjs')`
        }

        // 상위 디렉토리 확인 (1~3단계)
        for (let level = 1; level <= 3; level++) {
          const parentDir = path.join(context.fromDir, ...Array(level).fill('..'))
          const parentDirPath = path.join(parentDir, `${moduleName}.cjs`)
          if (fs.existsSync(parentDirPath)) {
            const relativePath = path.relative(context.fromDir, parentDirPath)
            return `require('${normalizeRelativePath(relativePath)}')`
          }
        }

        return match
      }
    )

    // ../module (확장자 없음)
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/([^'"]+)['"]\)/g,
      (match, moduleName) => {
        if (moduleName.endsWith('.cjs') || isExternalPath(moduleName)) {
          return match
        }

        const newContext = {
          ...context,
          fromDir: path.join(context.fromDir, '..')
        }
        const result = PathFinder.findActualFile(moduleName, newContext)
        if (result.found) {
          return `require('${result.relativePath}')`
        }

        const parentDirPath = path.join(context.fromDir, '..', `${moduleName}.cjs`)
        if (fs.existsSync(parentDirPath)) {
          return `require('../${moduleName}.cjs')`
        }

        return match
      }
    )

    // ../../module (확장자 없음)
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/\.\.\/([^'"]+)['"]\)/g,
      (match, moduleName) => {
        if (moduleName.endsWith('.cjs') || isExternalPath(moduleName)) {
          return match
        }

        const newContext = {
          ...context,
          fromDir: path.join(context.fromDir, '..', '..')
        }
        const result = PathFinder.findActualFile(moduleName, newContext)
        if (result.found) {
          return `require('${result.relativePath}')`
        }

        const grandParentDirPath = path.join(context.fromDir, '..', '..', `${moduleName}.cjs`)
        if (fs.existsSync(grandParentDirPath)) {
          return `require('../../${moduleName}.cjs')`
        }

        return match
      }
    )

    return convertedContent
  }

  /**
   * 모든 require 경로 수정 (CJS 파일 대상)
   */
  static fixAllRequirePaths(
    content: string,
    filePath: string,
    distPath: string
  ): string {
    let modifiedContent = content

    // 1. 경로 별칭 변환 (가장 먼저 처리)
    modifiedContent = PathAliasResolver.fixPathAliasRequires(modifiedContent, filePath, distPath)

    // 2. require 경로 확장자 수정
    modifiedContent = this.fixRequireExtensions(modifiedContent, filePath, distPath)

    // 3. 추가 패턴 처리
    modifiedContent = this.fixAdditionalPatterns(modifiedContent, filePath)

    return modifiedContent
  }

  /**
   * 파일명에서 확장자 제거 (중복 방지)
   */
  private static removeCjsExtension(fileName: string): string {
    return fileName.replace(/\.cjs$/, '')
  }

  /**
   * 추가 패턴 처리 (path-errors.json 기반)
   */
  private static fixAdditionalPatterns(
    content: string,
    filePath: string
  ): string {
    let modifiedContent = content
    const fileDir = path.dirname(filePath)
    const normalizedFilePath = filePath.replace(/\\/g, '/')

    // 파일 경로 기반 패턴 감지
    const isModulesIndex = /modules\/[^/]+\/index\.cjs$/.test(normalizedFilePath)
    const isControllersFile = /controllers\/[^/]+\.cjs$/.test(normalizedFilePath)
    const isModulesServerFile = /modules\/server\/[^/]+\.cjs$/.test(normalizedFilePath)
    const isMiddlewaresFile = /middlewares\/[^/]+\.cjs$/.test(normalizedFilePath)

      // 1. modules/*/index.cjs 파일에서 ../controllers/* -> ../../controllers/*
      if (isModulesIndex) {
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/controllers\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'controllers', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../controllers/${baseFileName}.cjs')`
        }
      )

      // modules/*/index.cjs 파일에서 ../entities/* -> ../../entities/*
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/entities\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'entities', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../entities/${baseFileName}.cjs')`
        }
      )

      // modules/*/index.cjs 파일에서 ../services/* -> ../../services/*
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/services\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'services', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../services/${baseFileName}.cjs')`
        }
      )

      // modules/*/index.cjs 파일에서 ../routes/* -> ../../routes/*
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/routes\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'routes', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../routes/${baseFileName}.cjs')`
        }
      )

      // modules/*/index.cjs 파일에서 ../middlewares/* -> ../../middlewares/*
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/middlewares\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'middlewares', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../middlewares/${baseFileName}.cjs')`
        }
      )
    }

    // 2. controllers/*.cjs 파일에서 ./transformers/* -> ../transformers/*
    if (isControllersFile) {
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\/transformers\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', 'transformers', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../transformers/${baseFileName}.cjs')`
        }
      )

      // controllers/*.cjs 파일에서 ./services/* -> ../services/*
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\/services\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', 'services', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../services/${baseFileName}.cjs')`
        }
      )
    }

    // 2-1. modules/*/index.cjs 파일에서 ../controllers/* -> ../../controllers/* (추가 패턴)
    // modules/auth/index.cjs, modules/social/index.cjs 등에서 사용
    if (isModulesIndex) {
      // ../controllers/* 패턴이 이미 처리되었지만, 혹시 모를 경우를 대비해 다시 확인
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/controllers\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 ../../controllers/로 수정되었는지 확인
          if (match.includes('../../controllers/')) {
            return match
          }
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'controllers', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          return `require('../../controllers/${baseFileName}.cjs')`
        }
      )

      // ../entities/* 패턴도 다시 확인
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/entities\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 ../../entities/로 수정되었는지 확인
          if (match.includes('../../entities/')) {
            return match
          }
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'entities', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          return `require('../../entities/${baseFileName}.cjs')`
        }
      )

      // ../middlewares/* 패턴도 다시 확인
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/middlewares\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 ../../middlewares/로 수정되었는지 확인
          if (match.includes('../../middlewares/')) {
            return match
          }
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'middlewares', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          return `require('../../middlewares/${baseFileName}.cjs')`
        }
      )
    }

    // 3. modules/server/*.cjs 파일에서 ../config/* -> ../../config/*
    if (isModulesServerFile) {
      modifiedContent = modifiedContent.replace(
        /require\(['"]\.\.\/config\/([^'"]+)['"]\)/g,
        (match, fileName) => {
          // 이미 .cjs 확장자가 있으면 제거
          const baseFileName = this.removeCjsExtension(fileName)
          const correctPath = path.join(fileDir, '..', '..', 'config', `${baseFileName}.cjs`)
          if (fs.existsSync(correctPath)) {
            const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
          // 파일이 없어도 경로 수정 (일관성 유지)
          return `require('../../config/${baseFileName}.cjs')`
        }
      )
    }

    // 4. 같은 디렉토리 내 잘못된 경로 수정
    // 예: ./modules/crawling/sources/search/BaseSearchEngine -> ./BaseSearchEngine.cjs
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\/modules\/crawling\/sources\/search\/([^'"]+)['"]\)/g,
      (match, fileName) => {
        const sameDirPath = path.join(fileDir, `${fileName}.cjs`)
        if (fs.existsSync(sameDirPath)) {
          return `require('./${fileName}.cjs')`
        }
        return match
      }
    )

    // 5. ./modules/crawling/utils/* -> ../../utils/*
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\/modules\/crawling\/utils\/([^'"]+)['"]\)/g,
      (match, fileName) => {
        const utilsPath = path.join(fileDir, '..', '..', 'utils', `${fileName}.cjs`)
        if (fs.existsSync(utilsPath)) {
          const relativePath = path.relative(fileDir, utilsPath).replace(/\\/g, '/')
          return `require('${normalizeRelativePath(relativePath)}')`
        }
        return match
      }
    )

    // 6. ./modules/crawling/strategies/* -> ../../strategies/*
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\/modules\/crawling\/strategies\/([^'"]+)['"]\)/g,
      (match, fileName) => {
        const strategiesPath = path.join(fileDir, '..', '..', 'strategies', `${fileName}.cjs`)
        if (fs.existsSync(strategiesPath)) {
          const relativePath = path.relative(fileDir, strategiesPath).replace(/\\/g, '/')
          return `require('${normalizeRelativePath(relativePath)}')`
        }
        return match
      }
    )

    // 7. ./services/* -> ../services/* (일반적인 경우)
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\/services\/([^'"]+)['"]\)/g,
      (match, fileName) => {
        // 이미 .cjs 확장자가 있으면 제거
        const baseFileName = this.removeCjsExtension(fileName)
        // 현재 디렉토리에 services가 없으면 상위 디렉토리 확인
        const currentServicesPath = path.join(fileDir, 'services', `${baseFileName}.cjs`)
        if (!fs.existsSync(currentServicesPath)) {
          const parentServicesPath = path.join(fileDir, '..', 'services', `${baseFileName}.cjs`)
          if (fs.existsSync(parentServicesPath)) {
            const relativePath = path.relative(fileDir, parentServicesPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
        }
        return match
      }
    )

    // 8. ./entities/* -> ../entities/* (일반적인 경우)
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\/entities\/([^'"]+)['"]\)/g,
      (match, fileName) => {
        // 이미 .cjs 확장자가 있으면 제거
        const baseFileName = this.removeCjsExtension(fileName)
        // 현재 디렉토리에 entities가 없으면 상위 디렉토리 확인
        const currentEntitiesPath = path.join(fileDir, 'entities', `${baseFileName}.cjs`)
        if (!fs.existsSync(currentEntitiesPath)) {
          const parentEntitiesPath = path.join(fileDir, '..', 'entities', `${baseFileName}.cjs`)
          if (fs.existsSync(parentEntitiesPath)) {
            const relativePath = path.relative(fileDir, parentEntitiesPath).replace(/\\/g, '/')
            return `require('${normalizeRelativePath(relativePath)}')`
          }
        }
        return match
      }
    )

    // 9. ../shared/types/equipment.cjs -> ../../shared/types/equipment.cjs (services에서)
    modifiedContent = modifiedContent.replace(
      /require\(['"]\.\.\/shared\/types\/equipment\.cjs['"]\)/g,
      (match) => {
        const correctPath = path.join(fileDir, '..', '..', 'shared', 'types', 'equipment.cjs')
        if (fs.existsSync(correctPath)) {
          const relativePath = path.relative(fileDir, correctPath).replace(/\\/g, '/')
          return `require('${normalizeRelativePath(relativePath)}')`
        }
        return match
      }
    )

    // 10. 중복 .cjs 확장자 제거 (최종 정리)
    modifiedContent = modifiedContent.replace(
      /require\(['"]([^'"]+)\.cjs\.cjs['"]\)/g,
      (match, modulePath) => {
        return `require('${modulePath}.cjs')`
      }
    )

    return modifiedContent
  }
}

