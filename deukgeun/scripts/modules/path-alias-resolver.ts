/**
 * 경로 별칭 해석 모듈
 */

import * as fs from 'fs'
import * as path from 'path'
import { PathAliasMap } from './converter-types'
import { PathFinder, PathResolutionContext } from './path-finder'

/**
 * 경로 별칭 매핑 (dist/backend/backend 기준)
 */
export const pathAliases: PathAliasMap = {
  // 백엔드 모듈 경로
  '@backend/*': './*',
  '@backend/config/*': './config/*',
  '@backend/controllers/*': './controllers/*',
  '@backend/entities/*': './entities/*',
  '@backend/middlewares/*': './middlewares/*',
  '@backend/routes/*': './routes/*',
  '@backend/services/*': './services/*',
  '@backend/utils/*': './utils/*',
  '@backend/transformers/*': './transformers/*',
  '@backend/transformers': './transformers/index',
  '@backend/modules/*': './modules/*',
  '@backend/modules/server/*': './modules/server/*',
  '@backend/types/*': './types/*',
  
  // 공유 모듈 경로
  '@shared/*': '../shared/*',
  '@shared/types/*': '../shared/types/*',
  '@shared/types/dto/*': '../shared/types/dto/*',
  '@shared/types/dto': '../shared/types/dto/index',
  '@shared/utils/*': '../shared/utils/*',
  '@shared/utils/transform/*': '../shared/utils/transform/*',
  '@shared/constants/*': '../shared/constants/*',
  '@shared/validation/*': '../shared/validation/*',
  '@shared/api/*': '../shared/api/*',
  
  // 레거시 별칭들
  '@types/*': '../shared/types/*',
  '@config/*': './config/*',
  '@controllers/*': './controllers/*',
  '@entities/*': './entities/*',
  '@middlewares/*': './middlewares/*',
  '@routes/*': './routes/*',
  '@services/*': './services/*',
  '@utils/*': './utils/*',
  '@transformers/*': './transformers/*',
  '@transformers': './transformers/index',
  '@dto/*': '../shared/types/dto/*',
  '@dto': '../shared/types/dto/index',
  '@domains/*': './domains/*',
  '@infrastructure/*': './infrastructure/*',
  '@constants/*': '../shared/constants/*',
  '@validation/*': '../shared/validation/*',
  '@api/*': '../shared/api/*',
  '@/shared/*': '../shared/*',
  '@/shared/utils/*': '../shared/utils/*',
  '@/shared/utils/transform/*': '../shared/utils/transform/*'
}

export class PathAliasResolver {
  /**
   * 경로 별칭을 실제 상대 경로로 변환
   */
  static convertPathAliases(
    content: string,
    filePath: string,
    distPath: string
  ): string {
    let convertedContent = content
    const backendBackendDir = path.resolve(distPath, 'backend', 'backend')

    for (const [alias, realPath] of Object.entries(pathAliases)) {
      const aliasPattern = alias.replace('*', '([^"\']+)')
      const regex = new RegExp(`['"]${aliasPattern}['"]`, 'g')

      convertedContent = convertedContent.replace(regex, (match, subPath) => {
        const fullRealPath = realPath.replace('*', subPath)
        const relativePath = this.calculateRelativePath(
          filePath,
          fullRealPath,
          backendBackendDir
        )
        return `'${relativePath}'`
      })
    }

    return convertedContent
  }

  /**
   * 상대 경로 계산
   */
  private static calculateRelativePath(
    fromFile: string,
    toPath: string,
    backendBackendDir: string
  ): string {
    const fromDir = path.dirname(fromFile)
    let relativePath: string

    if (toPath.startsWith('./')) {
      const targetPath = path.resolve(backendBackendDir, toPath.substring(2))

      if (fs.existsSync(targetPath) || fs.existsSync(targetPath + '.cjs')) {
        relativePath = path.relative(fromDir, targetPath)
      } else {
        const fromFileDir = path.dirname(fromFile)
        const backendBackendBase = path.resolve(backendBackendDir)

        if (fromFileDir.startsWith(backendBackendBase)) {
          const targetFromBase = path.resolve(backendBackendBase, toPath.substring(2))
          if (fs.existsSync(targetFromBase) || fs.existsSync(targetFromBase + '.cjs')) {
            relativePath = path.relative(fromDir, targetFromBase)
          } else {
            relativePath = path.relative(fromDir, path.join(fromDir, toPath.substring(2)))
          }
        } else {
          relativePath = path.relative(fromDir, path.join(fromDir, toPath.substring(2)))
        }
      }
    } else if (toPath.startsWith('../shared/')) {
      const sharedPath = path.join(path.dirname(fromDir), '..', toPath.substring(3))
      relativePath = path.relative(fromDir, sharedPath)
    } else {
      const targetPath = path.resolve(backendBackendDir, toPath)
      if (fs.existsSync(targetPath) || fs.existsSync(targetPath + '.cjs')) {
        relativePath = path.relative(fromDir, targetPath)
      } else {
        relativePath = path.relative(fromDir, toPath)
      }
    }

    let normalizedPath = relativePath.replace(/\\/g, '/')
    if (!normalizedPath.startsWith('.')) {
      normalizedPath = './' + normalizedPath
    }

    return normalizedPath
  }

  /**
   * 경로 별칭 require 경로 변환 (utils/*, config/* 등)
   */
  static fixPathAliasRequires(
    content: string,
    filePath: string,
    distPath: string
  ): string {
    let modifiedContent = content
    const fileDir = path.dirname(filePath)
    const backendBackendDir = path.resolve(distPath, 'backend', 'backend')

    const pathAliasPatterns = [
      {
        pattern: /require\(['"]utils\/([^'"]+)['"]\)/g,
        resolve: (moduleName: string) => {
          const possiblePaths = [
            path.join(fileDir, '..', 'utils', `${moduleName}.cjs`),
            path.join(fileDir, '..', '..', 'utils', `${moduleName}.cjs`),
            path.join(fileDir, 'utils', `${moduleName}.cjs`),
            path.join(backendBackendDir, 'utils', `${moduleName}.cjs`),
          ]

          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              const relativePath = path.relative(fileDir, possiblePath).replace(/\\/g, '/')
              return `require('${relativePath}')`
            }
          }

          const defaultPath = path.join(fileDir, '..', 'utils', `${moduleName}.cjs`)
          const relativePath = path.relative(fileDir, defaultPath).replace(/\\/g, '/')
          return `require('${relativePath}')`
        }
      },
      {
        pattern: /require\(['"]config\/([^'"]+)['"]\)/g,
        resolve: (moduleName: string) => {
          const possiblePaths = [
            path.join(fileDir, '..', 'config', `${moduleName}.cjs`),
            path.join(fileDir, '..', '..', 'config', `${moduleName}.cjs`),
            path.join(fileDir, 'config', `${moduleName}.cjs`),
            path.join(backendBackendDir, 'config', `${moduleName}.cjs`),
          ]

          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              const relativePath = path.relative(fileDir, possiblePath).replace(/\\/g, '/')
              return `require('${relativePath}')`
            }
          }

          const defaultPath = path.join(fileDir, '..', 'config', `${moduleName}.cjs`)
          const relativePath = path.relative(fileDir, defaultPath).replace(/\\/g, '/')
          return `require('${relativePath}')`
        }
      },
      {
        pattern: /require\(['"](controllers|middlewares|routes|services|entities|transformers|modules)\/([^'"]+)['"]\)/g,
        resolve: (dirName: string, moduleName: string) => {
          const possiblePaths = [
            path.join(fileDir, '..', dirName, `${moduleName}.cjs`),
            path.join(fileDir, '..', '..', dirName, `${moduleName}.cjs`),
            path.join(fileDir, dirName, `${moduleName}.cjs`),
            path.join(backendBackendDir, dirName, `${moduleName}.cjs`),
          ]

          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              const relativePath = path.relative(fileDir, possiblePath).replace(/\\/g, '/')
              return `require('${relativePath}')`
            }
          }

          const defaultPath = path.join(fileDir, '..', dirName, `${moduleName}.cjs`)
          const relativePath = path.relative(fileDir, defaultPath).replace(/\\/g, '/')
          return `require('${relativePath}')`
        }
      }
    ]

    for (const { pattern, resolve } of pathAliasPatterns) {
      modifiedContent = modifiedContent.replace(pattern, (match, ...args: string[]) => {
        const resolved = (resolve as (...args: string[]) => string)(...(args as [string, ...string[]]))
        return resolved
      })
    }

    return modifiedContent
  }
}

