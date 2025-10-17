#!/usr/bin/env node
"use strict";
/**
 * 향상된 JS to CJS 변환 스크립트
 * - 더 상세하고 정확한 ESM to CommonJS 변환 패턴
 * - 경로 별칭 해석 및 변환
 * - 타입 정의 파일 처리
 * - 의존성 모듈 경로 수정
 * - 원본 파일을 절대 수정하지 않음
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedJsToCjsConverter = void 0;
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// 색상 출력을 위한 유틸리티
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}
function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}
function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}
function logError(message) {
    log(`❌ ${message}`, 'red');
}
function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}
/**
 * 기본 변환 옵션
 */
const defaultOptions = {
    projectRoot: process.cwd(),
    distPath: path.join(process.cwd(), 'dist'),
    verbose: false,
    dryRun: false,
    backup: true,
    fixPathAliases: true,
    fixDependencies: true
};
/**
 * 경로 별칭 매핑 (백엔드 tsconfig.json 기반)
 */
const pathAliases = {
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
    '@shared/*': '../shared/*',
    '@shared/utils/*': '../shared/utils/*',
    '@shared/utils/transform/*': '../shared/utils/transform/*',
    '@domains/*': './domains/*',
    '@infrastructure/*': './infrastructure/*',
    '@constants/*': '../shared/constants/*',
    '@validation/*': '../shared/validation/*',
    '@api/*': '../shared/api/*',
    '@/shared/*': '../shared/*',
    '@/shared/utils/*': '../shared/utils/*',
    '@/shared/utils/transform/*': '../shared/utils/transform/*'
};
/**
 * 향상된 JS to CJS 변환 클래스
 */
class EnhancedJsToCjsConverter {
    constructor(options) {
        this.conversionStats = {
            filesProcessed: 0,
            filesConverted: 0,
            pathAliasesFixed: 0,
            dependenciesFixed: 0,
            errors: 0
        };
        this.options = options;
        this.backupPath = path.join(options.projectRoot, '.conversion-backup');
    }
    /**
     * 변환 프로세스 실행
     */
    async execute() {
        const startTime = Date.now();
        try {
            log('🚀 향상된 JS to CJS 변환을 시작합니다...', 'bright');
            logSeparator('=', 60, 'bright');
            // 1. dist 폴더 확인
            if (!this.validateDistFolder()) {
                return false;
            }
            // 2. 백업 생성 (필요한 경우)
            if (this.options.backup) {
                await this.createBackup();
            }
            // 3. JS 파일 찾기
            const jsFiles = this.findJsFiles();
            if (jsFiles.length === 0) {
                logWarning('변환할 .js 파일이 없습니다.');
                return true;
            }
            log(`변환 대상: ${jsFiles.length}개 파일`, 'blue');
            // 4. 파일 변환
            await this.convertFiles(jsFiles);
            // 5. require 경로 수정
            await this.fixRequirePaths();
            // 6. 정리
            await this.cleanup();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logSuccess(`JS to CJS 변환이 완료되었습니다! (소요시간: ${duration}초)`);
            this.printStats();
            logSeparator('=', 60, 'green');
            return this.conversionStats.errors === 0;
        }
        catch (error) {
            logError(`변환 프로세스 실패: ${error.message}`);
            await this.emergencyRollback();
            return false;
        }
    }
    /**
     * dist 폴더 유효성 검사
     */
    validateDistFolder() {
        logStep('VALIDATE', 'dist 폴더 확인 중...');
        if (!fs.existsSync(this.options.distPath)) {
            logError(`dist 폴더가 존재하지 않습니다: ${this.options.distPath}`);
            logError('먼저 빌드를 실행해주세요.');
            return false;
        }
        logSuccess('dist 폴더 확인 완료');
        return true;
    }
    /**
     * 백업 생성
     */
    async createBackup() {
        logStep('BACKUP', '백업 생성 중...');
        if (this.options.dryRun) {
            log('백업 생성 (드라이 런)', 'yellow');
            return;
        }
        try {
            if (fs.existsSync(this.backupPath)) {
                fs.rmSync(this.backupPath, { recursive: true, force: true });
            }
            fs.cpSync(this.options.distPath, this.backupPath, { recursive: true });
            logSuccess('백업 생성 완료');
        }
        catch (error) {
            logWarning(`백업 생성 실패: ${error.message}`);
        }
    }
    /**
     * JS 파일 찾기
     */
    findJsFiles() {
        logStep('SCAN', 'JS 파일 스캔 중...');
        const jsFiles = [];
        this.scanDirectory(this.options.distPath, jsFiles);
        log(`발견된 JS 파일: ${jsFiles.length}개`, 'blue');
        return jsFiles;
    }
    /**
     * 디렉토리 스캔
     */
    scanDirectory(dir, jsFiles) {
        if (!fs.existsSync(dir)) {
            return;
        }
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                // 특정 디렉토리는 제외
                if (!['node_modules', '.git', '.conversion-backup'].includes(item)) {
                    this.scanDirectory(itemPath, jsFiles);
                }
            }
            else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
                jsFiles.push(itemPath);
            }
        }
    }
    /**
     * 파일들 변환
     */
    async convertFiles(jsFiles) {
        logStep('CONVERT', '파일 변환 중...');
        for (const jsFile of jsFiles) {
            try {
                this.conversionStats.filesProcessed++;
                if (await this.convertFile(jsFile)) {
                    this.conversionStats.filesConverted++;
                }
            }
            catch (error) {
                logError(`파일 변환 실패: ${jsFile} - ${error.message}`);
                this.conversionStats.errors++;
            }
        }
    }
    /**
     * 개별 파일 변환
     */
    async convertFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 빈 파일이나 "use strict"만 있는 파일 처리
            if (content.trim() === '' || content.trim() === '"use strict";') {
                if (this.options.dryRun) {
                    log(`빈 파일 삭제 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow');
                    return true;
                }
                // 빈 파일은 삭제
                fs.unlinkSync(filePath);
                log(`빈 파일 삭제됨: ${path.relative(this.options.distPath, filePath)}`, 'green');
                return true;
            }
            // 이미 변환된 파일인지 확인
            if (this.isAlreadyConverted(content)) {
                log(`이미 변환됨: ${path.relative(this.options.distPath, filePath)}`, 'yellow');
                return true;
            }
            // 변환 실행
            const convertedContent = this.convertContent(content, filePath);
            // .js 파일은 무조건 .cjs로 변환 (내용 변경 여부와 관계없이)
            if (this.options.dryRun) {
                log(`변환 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow');
                return true;
            }
            // .cjs 파일로 저장
            const cjsPath = filePath.replace('.js', '.cjs');
            fs.writeFileSync(cjsPath, convertedContent);
            // 원본 .js 파일 삭제
            fs.unlinkSync(filePath);
            log(`변환됨: ${path.relative(this.options.distPath, filePath)} → ${path.relative(this.options.distPath, cjsPath)}`, 'green');
            return true;
        }
        catch (error) {
            logError(`파일 변환 실패: ${filePath} - ${error.message}`);
            return false;
        }
    }
    /**
     * 이미 변환된 파일인지 확인
     */
    isAlreadyConverted(content) {
        // ESM 문법이 있으면 변환이 필요함 (minified 코드도 감지)
        const hasImport = /import\s*[^;]*from\s*['"]/.test(content) || content.includes('import ');
        const hasExport = /export\s*[^;]*from\s*['"]/.test(content) || content.includes('export ');
        const hasImportMeta = content.includes('import.meta');
        // 빈 export 문도 ESM 문법으로 간주 (export {}; export {};)
        const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content);
        // export default, export const, export function 등도 감지
        const hasExportDefault = /export\s+default/.test(content);
        const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content);
        // ESM 문법이 있으면 변환 필요
        if (hasImport || hasExport || hasImportMeta || hasEmptyExport || hasExportDefault || hasExportDeclaration) {
            return false;
        }
        // CommonJS 문법이 있어도 .js 파일이면 .cjs로 변환 필요
        // 이미 .cjs 파일인 경우에만 "이미 변환됨"으로 간주
        return false;
    }
    /**
     * 내용 변환 (향상된 버전)
     */
    convertContent(content, filePath) {
        let convertedContent = content;
        // 1. import.meta.env 변환
        convertedContent = this.convertImportMetaEnv(convertedContent);
        // 2. import/export 변환
        if (this.needsImportExportConversion(convertedContent)) {
            convertedContent = this.convertImportExport(convertedContent, filePath);
        }
        // 3. 경로 별칭 변환
        if (this.options.fixPathAliases) {
            convertedContent = this.convertPathAliases(convertedContent, filePath);
        }
        // 4. 의존성 모듈 경로 수정
        if (this.options.fixDependencies) {
            convertedContent = this.fixDependencyPaths(convertedContent);
        }
        // 5. 기타 ESM 문법 변환
        convertedContent = this.convertOtherEsmSyntax(convertedContent);
        // 6. 최종 정리 - 빈 줄과 불필요한 세미콜론 정리
        convertedContent = this.cleanupConvertedContent(convertedContent);
        return convertedContent;
    }
    /**
     * import.meta.env 변환
     */
    convertImportMetaEnv(content) {
        let convertedContent = content;
        if (convertedContent.includes('import.meta.env')) {
            // VITE_ 변수들 먼저 처리
            convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1');
            // 특수 변수들 처리
            convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV');
            convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"');
            convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"');
            // 일반 환경 변수들 처리
            convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1');
            // 나머지 import.meta.env 처리
            convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env');
        }
        return convertedContent;
    }
    /**
     * import/export 변환 (향상된 버전)
     */
    convertImportExport(content, filePath) {
        let convertedContent = content;
        // 1. 명명된 import 변환을 먼저 처리 (minified 코드도 처리)
        convertedContent = convertedContent.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g, (match, imports, modulePath) => {
            const resolvedPath = this.resolveModulePath(modulePath, filePath);
            // 'as' 키워드를 CommonJS 호환 형태로 변환
            const convertedImports = imports.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2');
            return `const { ${convertedImports} } = require('${resolvedPath}')`;
        });
        // 2. 기본 import 변환 (default import) - minified 코드도 처리
        convertedContent = convertedContent.replace(/import\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g, (match, importName, modulePath) => {
            const resolvedPath = this.resolveModulePath(modulePath, filePath);
            return `const ${importName} = require('${resolvedPath}')`;
        });
        // 3. import "module" 변환 (side-effect import) - minified 코드도 처리
        convertedContent = convertedContent.replace(/import\s*['"]([^'"]+)['"]/g, (match, modulePath) => {
            const resolvedPath = this.resolveModulePath(modulePath, filePath);
            return `require('${resolvedPath}')`;
        });
        // 4. 네임스페이스 import 변환 - minified 코드도 처리
        convertedContent = convertedContent.replace(/import\s*\*\s*as\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g, (match, namespaceName, modulePath) => {
            const resolvedPath = this.resolveModulePath(modulePath, filePath);
            return `const ${namespaceName} = require('${resolvedPath}')`;
        });
        // 5. 기본 export 변환
        convertedContent = convertedContent.replace(/export\s+default\s+([^;]+)/g, 'module.exports = $1');
        // 6. 명명된 export 변환 (as 키워드 처리)
        convertedContent = convertedContent.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match, exports) => {
            return exports.split(',').map(exp => {
                exp = exp.trim();
                // 'as' 키워드가 있는 경우 처리
                if (exp.includes(' as ')) {
                    const [original, alias] = exp.split(' as ').map(s => s.trim());
                    return `module.exports.${alias} = ${original}`;
                }
                return `module.exports.${exp} = ${exp}`;
            }).join('\n');
        });
        // 7. export * from 변환 - minified 코드도 처리
        convertedContent = convertedContent.replace(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g, (match, modulePath) => {
            const resolvedPath = this.resolveModulePath(modulePath, filePath);
            return `Object.assign(module.exports, require('${resolvedPath}'))`;
        });
        // 8. export const/let/var/function/class 변환
        convertedContent = convertedContent.replace(/export\s+(const|let|var|function|class)\s+(\w+)/g, (match, declaration, name) => {
            return `${declaration} ${name}\nmodule.exports.${name} = ${name}`;
        });
        // 9. export function 변환 (별도 처리)
        convertedContent = convertedContent.replace(/export\s+function\s+(\w+)/g, (match, name) => {
            return `function ${name}`;
        });
        // 10. export async function 변환
        convertedContent = convertedContent.replace(/export\s+async\s+function\s+(\w+)/g, (match, name) => {
            return `async function ${name}`;
        });
        // 11. 함수 선언 후 module.exports 추가 (더 정확한 패턴) - 비활성화
        // minified 코드에서는 함수 패턴이 복잡하므로 수동으로 처리하지 않음
        // convertedContent = convertedContent.replace(
        //   /(function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\})/g,
        //   (match, func, funcName) => {
        //     return `${func}\nmodule.exports.${funcName} = ${funcName}`
        //   }
        // )
        // 12. async 함수 선언 후 module.exports 추가 (더 정확한 패턴) - 비활성화
        // convertedContent = convertedContent.replace(
        //   /(async\s+function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\})/g,
        //   (match, func, funcName) => {
        //     return `${func}\nmodule.exports.${funcName} = ${funcName}`
        //   }
        // )
        // 13. 빈 export 문 제거 (더 포괄적인 패턴)
        convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;?/g, '');
        // 14. export {} 문 제거 (세미콜론이 있는 경우)
        convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;/g, '');
        // 15. export {} 문 제거 (세미콜론이 없는 경우)
        convertedContent = convertedContent.replace(/export\s*\{\s*\}/g, '');
        return convertedContent;
    }
    /**
     * 경로 별칭 변환
     */
    convertPathAliases(content, filePath) {
        let convertedContent = content;
        // 경로 별칭을 실제 상대 경로로 변환
        for (const [alias, realPath] of Object.entries(pathAliases)) {
            const aliasPattern = alias.replace('*', '([^"\']+)');
            const regex = new RegExp(`['"]${aliasPattern}['"]`, 'g');
            convertedContent = convertedContent.replace(regex, (match, subPath) => {
                const fullRealPath = realPath.replace('*', subPath);
                const relativePath = this.calculateRelativePath(filePath, fullRealPath);
                this.conversionStats.pathAliasesFixed++;
                return `'${relativePath}'`;
            });
        }
        return convertedContent;
    }
    /**
     * 의존성 모듈 경로 수정
     */
    fixDependencyPaths(content) {
        let convertedContent = content;
        // node_modules 경로 수정
        convertedContent = convertedContent.replace(/require\(['"]\.\.\/node_modules\/([^'"]+)['"]\)/g, "require('$1')");
        // 상대 경로에서 node_modules 제거
        convertedContent = convertedContent.replace(/require\(['"]\.\.\/\.\.\/node_modules\/([^'"]+)['"]\)/g, "require('$1')");
        this.conversionStats.dependenciesFixed++;
        return convertedContent;
    }
    /**
     * 기타 ESM 문법 변환
     */
    convertOtherEsmSyntax(content) {
        let convertedContent = content;
        // import() 동적 import 변환
        convertedContent = convertedContent.replace(/import\(['"]([^'"]+)['"]\)/g, "require('$1')");
        // __dirname, __filename 변환 (ESM에서는 사용 불가)
        if (convertedContent.includes('import.meta.url')) {
            convertedContent = convertedContent.replace(/import\.meta\.url/g, '__filename');
        }
        // __dirname 사용 시 CommonJS에서 정상 작동하도록 보장
        if (convertedContent.includes('__dirname')) {
            // __dirname이 사용되는 파일에 필요한 require 추가
            if (!convertedContent.includes('const path = require(') &&
                !convertedContent.includes('import path from')) {
                convertedContent = `const path = require('path');\n${convertedContent}`;
            }
        }
        return convertedContent;
    }
    /**
     * 변환된 내용 정리
     */
    cleanupConvertedContent(content) {
        let cleanedContent = content;
        // 연속된 빈 줄을 하나로 줄이기
        cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        // 파일 끝의 불필요한 세미콜론과 빈 줄 제거
        cleanedContent = cleanedContent.replace(/;\s*$/, '');
        cleanedContent = cleanedContent.replace(/\n\s*$/, '');
        // 빈 export 문이 남아있으면 제거
        cleanedContent = cleanedContent.replace(/export\s*\{\s*\}\s*;?/g, '');
        return cleanedContent;
    }
    /**
     * 모듈 경로 해석
     */
    resolveModulePath(modulePath, currentFilePath) {
        // 절대 경로나 node_modules는 그대로 반환
        if (modulePath.startsWith('/') || !modulePath.startsWith('.')) {
            return modulePath;
        }
        // 상대 경로는 .cjs 확장자로 변환
        if (modulePath.endsWith('.js')) {
            return modulePath.replace('.js', '.cjs');
        }
        return modulePath;
    }
    /**
     * 상대 경로 계산
     */
    calculateRelativePath(fromFile, toPath) {
        const fromDir = path.dirname(fromFile);
        const relativePath = path.relative(fromDir, toPath);
        return relativePath.replace(/\\/g, '/');
    }
    /**
     * import/export 변환이 필요한지 확인
     */
    needsImportExportConversion(content) {
        // minified 코드도 감지
        const hasImport = /import\s*[^;]*from\s*['"]/.test(content) || content.includes('import ');
        const hasExport = /export\s*[^;]*from\s*['"]/.test(content) || content.includes('export ');
        // 빈 export 문도 ESM 문법으로 간주 (export {}; export {};)
        const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content);
        // export default, export const, export function 등도 감지
        const hasExportDefault = /export\s+default/.test(content);
        const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content);
        // import.meta도 ESM 문법
        const hasImportMeta = content.includes('import.meta');
        return hasImport || hasExport || hasEmptyExport || hasExportDefault || hasExportDeclaration || hasImportMeta;
    }
    /**
     * require 경로 수정
     */
    async fixRequirePaths() {
        logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...');
        const cjsFiles = this.findCjsFiles();
        for (const cjsFile of cjsFiles) {
            try {
                const content = fs.readFileSync(cjsFile, 'utf8');
                let modifiedContent = content;
                // require 경로 수정 - 더 포괄적인 패턴
                modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")');
                modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)"\)/g, (match, moduleName) => {
                    // .cjs 파일이 존재하는지 확인
                    const cjsPath = path.join(path.dirname(cjsFile), `${moduleName}.cjs`);
                    if (fs.existsSync(cjsPath)) {
                        return `require("./${moduleName}.cjs")`;
                    }
                    return match;
                });
                modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")');
                modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)"\)/g, (match, moduleName) => {
                    // .cjs 파일이 존재하는지 확인
                    const cjsPath = path.join(path.dirname(cjsFile), '..', `${moduleName}.cjs`);
                    if (fs.existsSync(cjsPath)) {
                        return `require("../${moduleName}.cjs")`;
                    }
                    return match;
                });
                // 더 깊은 상대 경로 처리
                modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)\.js"\)/g, 'require("../../$1.cjs")');
                modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)"\)/g, (match, moduleName) => {
                    const cjsPath = path.join(path.dirname(cjsFile), '..', '..', `${moduleName}.cjs`);
                    if (fs.existsSync(cjsPath)) {
                        return `require("../../${moduleName}.cjs")`;
                    }
                    return match;
                });
                if (modifiedContent !== content) {
                    if (!this.options.dryRun) {
                        fs.writeFileSync(cjsFile, modifiedContent, 'utf8');
                    }
                    log(`require 경로 수정됨: ${path.relative(this.options.distPath, cjsFile)}`, 'green');
                }
            }
            catch (error) {
                logWarning(`require 경로 수정 실패: ${cjsFile} - ${error.message}`);
            }
        }
    }
    /**
     * CJS 파일 찾기
     */
    findCjsFiles() {
        const cjsFiles = [];
        this.scanDirectoryForCjs(this.options.distPath, cjsFiles);
        return cjsFiles;
    }
    /**
     * CJS 파일 스캔
     */
    scanDirectoryForCjs(dir, cjsFiles) {
        if (!fs.existsSync(dir)) {
            return;
        }
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                if (!['node_modules', '.git', '.conversion-backup'].includes(item)) {
                    this.scanDirectoryForCjs(itemPath, cjsFiles);
                }
            }
            else if (item.endsWith('.cjs')) {
                cjsFiles.push(itemPath);
            }
        }
    }
    /**
     * 정리 작업
     */
    async cleanup() {
        logStep('CLEANUP', '정리 작업 중...');
        try {
            // 백업 폴더 정리 (선택적)
            if (this.options.backup && fs.existsSync(this.backupPath)) {
                // 백업은 유지 (안전을 위해)
                log('백업 폴더는 유지됩니다.', 'blue');
            }
            logSuccess('정리 완료');
        }
        catch (error) {
            logWarning(`정리 중 오류: ${error.message}`);
        }
    }
    /**
     * 긴급 롤백
     */
    async emergencyRollback() {
        logStep('EMERGENCY_ROLLBACK', '긴급 롤백 중...');
        try {
            if (fs.existsSync(this.backupPath)) {
                // 백업에서 복원
                fs.rmSync(this.options.distPath, { recursive: true, force: true });
                fs.cpSync(this.backupPath, this.options.distPath, { recursive: true });
                logSuccess('긴급 롤백 완료');
            }
            else {
                logWarning('백업이 없어 롤백할 수 없습니다.');
            }
        }
        catch (error) {
            logError(`긴급 롤백 실패: ${error.message}`);
        }
    }
    /**
     * 변환 통계 출력
     */
    printStats() {
        log('\n📊 변환 통계:', 'bright');
        log(`  • 처리된 파일: ${this.conversionStats.filesProcessed}개`, 'blue');
        log(`  • 변환된 파일: ${this.conversionStats.filesConverted}개`, 'green');
        log(`  • 경로 별칭 수정: ${this.conversionStats.pathAliasesFixed}개`, 'cyan');
        log(`  • 의존성 경로 수정: ${this.conversionStats.dependenciesFixed}개`, 'cyan');
        if (this.conversionStats.errors > 0) {
            log(`  • 오류: ${this.conversionStats.errors}개`, 'red');
        }
    }
}
exports.EnhancedJsToCjsConverter = EnhancedJsToCjsConverter;
/**
 * 명령행 인수 파싱
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--project-root':
            case '-p':
                options.projectRoot = args[++i];
                break;
            case '--dist-path':
            case '-d':
                options.distPath = args[++i];
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--no-backup':
                options.backup = false;
                break;
            case '--no-path-aliases':
                options.fixPathAliases = false;
                break;
            case '--no-dependencies':
                options.fixDependencies = false;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }
    return options;
}
/**
 * 도움말 출력
 */
function printHelp() {
    console.log(`
사용법: node enhanced-js-to-cjs-converter.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -d, --dist-path <path>      dist 폴더 경로
  -v, --verbose               상세 로그 활성화
  --dry-run                   드라이 런 모드
  --no-backup                 백업 생성하지 않음
  --no-path-aliases           경로 별칭 변환 건너뛰기
  --no-dependencies           의존성 경로 수정 건너뛰기
  -h, --help                  도움말 출력

예시:
  node enhanced-js-to-cjs-converter.ts --verbose
  node enhanced-js-to-cjs-converter.ts --dry-run
  node enhanced-js-to-cjs-converter.ts --no-backup
`);
}
/**
 * 구분선 출력
 */
function logSeparator(char, length, color = 'reset') {
    log(char.repeat(length), color);
}
/**
 * 메인 함수
 */
async function main() {
    try {
        const options = parseArguments();
        const finalOptions = { ...defaultOptions, ...options };
        const converter = new EnhancedJsToCjsConverter(finalOptions);
        const success = await converter.execute();
        if (success) {
            process.exit(0);
        }
        else {
            process.exit(1);
        }
    }
    catch (error) {
        logError(`변환 스크립트 실패: ${error.message}`);
        process.exit(1);
    }
}
// 스크립트 실행
async function runIfMain() {
    try {
        // CommonJS 환경에서는 __filename을 직접 사용
        const currentFile = __filename || process.argv[1];
        if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
            await main();
            return;
        }
    }
    catch (e) {
        // import.meta가 없는 환경에서 무시
    }
}
runIfMain().catch(error => {
    logError(`실행 실패: ${error.message}`);
    process.exit(1);
});
