"use strict";
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
exports.weeklyCrawlingScheduler = void 0;
const cron_1 = require("cron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const MAX_EXECUTION_TIME = 2 * 60 * 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 3;
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;
const EXECUTION_TIMEOUT = 2 * 60 * 60 * 1000;
class WeeklyCrawlingScheduler {
    constructor() {
        this.job = null;
        this.status = {
            isRunning: false,
            lastRun: null,
            nextRun: null,
            lastSuccess: false,
            lastError: null,
            lastRunDuration: null,
            consecutiveFailures: 0,
            totalRuns: 0,
            totalSuccesses: 0,
            totalFailures: 0
        };
        this.executionLock = false;
        this.currentProcess = null;
        this.executionTimeout = null;
    }
    validateCronSchedule(cronSchedule) {
        const trimmedSchedule = cronSchedule.trim();
        if (trimmedSchedule !== '0 6 * * 0') {
            console.error(`❌ 잘못된 cron 스케줄: ${trimmedSchedule}`);
            console.error('   정확한 스케줄만 허용: "0 6 * * 0" (매주 일요일 오전 6시)');
            console.error('   다른 날짜, 시간, 예외는 허용되지 않습니다.');
            return false;
        }
        return true;
    }
    getValidatedCronSchedule() {
        const defaultSchedule = '0 6 * * 0';
        const envSchedule = process.env.WEEKLY_CRAWLING_SCHEDULE;
        if (!envSchedule) {
            console.log(`📅 환경 변수 WEEKLY_CRAWLING_SCHEDULE이 설정되지 않았습니다. 기본값 사용: ${defaultSchedule}`);
            return defaultSchedule;
        }
        if (this.validateCronSchedule(envSchedule)) {
            console.log(`📅 환경 변수에서 가져온 cron 스케줄 검증 통과: ${envSchedule}`);
            return envSchedule;
        }
        else {
            console.warn(`⚠️ 환경 변수 cron 스케줄 검증 실패. 기본값 사용: ${defaultSchedule}`);
            return defaultSchedule;
        }
    }
    validateEnvironment() {
        const requiredEnvVars = ['NODE_ENV'];
        const missingVars = [];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            }
        }
        if (missingVars.length > 0) {
            console.error(`❌ 필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`);
            return false;
        }
        return true;
    }
    start() {
        try {
            if (!this.validateEnvironment()) {
                console.error('❌ 환경 변수 검증 실패로 스케줄러를 시작할 수 없습니다');
                return;
            }
            if (process.env.NODE_ENV !== 'production') {
                console.log('🔧 개발 환경: 주간 크롤링 스케줄러 비활성화');
                return;
            }
            if (this.job) {
                console.warn('⚠️ 주간 크롤링 스케줄러가 이미 실행 중입니다');
                return;
            }
            console.log('🕐 주간 크롤링 스케줄러 시작...');
            const cronSchedule = this.getValidatedCronSchedule();
            const scriptPath = this.getScriptPath();
            if (!scriptPath) {
                console.error('❌ 크롤링 스크립트를 찾을 수 없습니다');
                return;
            }
            if (!this.validateScriptPath(scriptPath)) {
                console.error('❌ 크롤링 스크립트 파일이 유효하지 않습니다');
                return;
            }
            try {
                this.job = cron_1.CronJob.from({
                    cronTime: cronSchedule,
                    onTick: () => {
                        this.safeExecuteCrawling(scriptPath).catch((error) => {
                            console.error('❌ 크롤링 실행 중 예외 발생:', error);
                            this.logError(error, 0);
                        });
                    },
                    start: true,
                    timeZone: 'Asia/Seoul'
                });
                try {
                    const nextDates = this.job.nextDates();
                    if (!nextDates) {
                        console.warn('⚠️ 다음 실행 시간을 가져올 수 없습니다');
                        this.status.nextRun = null;
                        return;
                    }
                    const nextRunRaw = Array.isArray(nextDates)
                        ? (nextDates[0] || null)
                        : (nextDates || null);
                    if (!nextRunRaw) {
                        console.warn('⚠️ 다음 실행 시간을 Date 객체로 변환할 수 없습니다');
                        this.status.nextRun = null;
                        return;
                    }
                    const nextRun = nextRunRaw instanceof Date ? nextRunRaw : new Date(nextRunRaw);
                    this.status.nextRun = nextRun;
                    const nextRunDay = nextRun.getDay();
                    const nextRunHour = nextRun.getHours();
                    const nextRunMinute = nextRun.getMinutes();
                    if (nextRunDay !== 0 || nextRunHour !== 6 || nextRunMinute !== 0) {
                        console.warn(`⚠️ 다음 실행 시간이 예상과 다릅니다: ${nextRun.toISOString()}`);
                        console.warn(`   예상: 일요일 오전 6시 0분`);
                        console.warn(`   실제: ${this.getDayName(nextRunDay)} ${nextRunHour}시 ${nextRunMinute}분`);
                    }
                    console.log('✅ 주간 크롤링 스케줄러 시작 완료');
                    console.log(`📅 Cron 스케줄: ${cronSchedule} (매주 일요일 오전 6시)`);
                    console.log(`📅 다음 실행 시간: ${nextRun.toISOString()} (${this.getDayName(nextRunDay)} ${nextRunHour}시 ${nextRunMinute}분)`);
                }
                catch (dateError) {
                    console.error('❌ 다음 실행 시간 계산 실패:', dateError);
                    this.status.nextRun = null;
                }
            }
            catch (error) {
                console.error('❌ CronJob 생성 실패:', error);
                console.error(`   Cron 스케줄: ${cronSchedule}`);
                if (error instanceof Error && error.stack) {
                    console.error('   스택 트레이스:', error.stack);
                }
                throw error;
            }
        }
        catch (error) {
            console.error('❌ 스케줄러 시작 실패:', error);
            if (error instanceof Error && error.stack) {
                console.error('   스택 트레이스:', error.stack);
            }
            throw error;
        }
    }
    getDayName(day) {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[day] || `요일${day}`;
    }
    getScriptPath() {
        try {
            const possiblePaths = [
                path.join(process.cwd(), 'src/backend/scripts/weeklyCrawlingCron.ts'),
                path.join(process.cwd(), 'dist/backend/backend/scripts/weeklyCrawlingCron.cjs'),
                path.join(process.cwd(), 'scripts/weeklyCrawlingCron.ts'),
            ];
            for (const scriptPath of possiblePaths) {
                try {
                    if (fs.existsSync(scriptPath)) {
                        fs.accessSync(scriptPath, fs.constants.R_OK);
                        return scriptPath;
                    }
                }
                catch (accessError) {
                    console.warn(`⚠️ 스크립트 파일 접근 불가: ${scriptPath}`, accessError);
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            console.error('❌ 스크립트 경로 찾기 실패:', error);
            return null;
        }
    }
    validateScriptPath(scriptPath) {
        try {
            if (!fs.existsSync(scriptPath)) {
                console.error(`❌ 스크립트 파일이 존재하지 않습니다: ${scriptPath}`);
                return false;
            }
            try {
                fs.accessSync(scriptPath, fs.constants.R_OK);
            }
            catch (accessError) {
                console.error(`❌ 스크립트 파일 읽기 권한이 없습니다: ${scriptPath}`);
                return false;
            }
            const stats = fs.statSync(scriptPath);
            if (!stats.isFile()) {
                console.error(`❌ 스크립트 경로가 파일이 아닙니다: ${scriptPath}`);
                return false;
            }
            if (stats.size === 0) {
                console.error(`❌ 스크립트 파일이 비어있습니다: ${scriptPath}`);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error(`❌ 스크립트 경로 검증 실패: ${scriptPath}`, error);
            return false;
        }
    }
    async safeExecuteCrawling(scriptPath) {
        if (this.executionLock || this.status.isRunning) {
            console.warn('⚠️ 크롤링이 이미 실행 중입니다. 중복 실행을 건너뜁니다.');
            return;
        }
        if (this.status.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.error(`❌ 연속 실패 횟수 초과 (${this.status.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}). 스케줄러가 일시 중지되었습니다.`);
            console.error('   수동으로 실행하여 문제를 해결한 후 스케줄러를 재시작하세요.');
            return;
        }
        this.executionLock = true;
        this.status.isRunning = true;
        this.status.lastRun = new Date();
        this.status.lastError = null;
        this.status.totalRuns++;
        const startTime = Date.now();
        console.log('🚀 주간 크롤링 시작...');
        console.log(`📅 실행 시간: ${this.status.lastRun.toISOString()}`);
        console.log(`📁 스크립트 경로: ${scriptPath}`);
        console.log(`📊 총 실행 횟수: ${this.status.totalRuns}, 성공: ${this.status.totalSuccesses}, 실패: ${this.status.totalFailures}`);
        try {
            await this.executeCrawlingWithTimeout(scriptPath, startTime);
        }
        catch (error) {
            console.error('❌ 크롤링 실행 중 예외 발생:', error);
        }
        finally {
            this.executionLock = false;
            this.status.isRunning = false;
            if (this.executionTimeout) {
                clearTimeout(this.executionTimeout);
                this.executionTimeout = null;
            }
            if (this.currentProcess) {
                this.currentProcess = null;
            }
        }
    }
    async executeCrawlingWithTimeout(scriptPath, startTime) {
        return new Promise(async (resolve, reject) => {
            try {
                this.executionTimeout = setTimeout(() => {
                    if (this.currentProcess) {
                        console.error('❌ 크롤링 실행 타임아웃 (2시간 초과)');
                        this.currentProcess.kill('SIGTERM');
                        setTimeout(() => {
                            if (this.currentProcess && !this.currentProcess.killed) {
                                console.error('⚠️ 프로세스가 종료되지 않아 강제 종료합니다');
                                this.currentProcess.kill('SIGKILL');
                            }
                        }, 5000);
                    }
                    const duration = Date.now() - startTime;
                    const timeoutError = new Error(`크롤링 실행 타임아웃 (${(duration / 1000 / 60).toFixed(2)}분)`);
                    this.handleExecutionFailure(timeoutError, duration);
                    reject(timeoutError);
                }, EXECUTION_TIMEOUT);
                const isTypeScript = scriptPath.endsWith('.ts');
                let command;
                if (isTypeScript) {
                    command = `node node_modules/tsx/dist/cli.mjs ${scriptPath}`;
                }
                else {
                    command = `node ${scriptPath}`;
                }
                console.log(`🔧 실행 명령어: ${command}`);
                const childProcess = (0, child_process_1.exec)(command, {
                    cwd: process.cwd(),
                    env: {
                        ...process.env,
                        NODE_ENV: 'production',
                        MODE: 'production'
                    },
                    maxBuffer: 10 * 1024 * 1024,
                    timeout: EXECUTION_TIMEOUT
                }, (error, stdout, stderr) => {
                    if (this.executionTimeout) {
                        clearTimeout(this.executionTimeout);
                        this.executionTimeout = null;
                    }
                    const duration = Date.now() - startTime;
                    if (error) {
                        this.handleExecutionFailure(error, duration);
                        if (stdout) {
                            console.log('📊 크롤링 출력:', stdout.substring(0, 1000));
                        }
                        if (stderr) {
                            console.error('❌ 크롤링 에러 출력:', stderr.substring(0, 1000));
                        }
                        reject(error);
                    }
                    else {
                        this.handleExecutionSuccess(stdout, stderr, duration);
                        resolve();
                    }
                });
                this.currentProcess = childProcess;
                childProcess.on('exit', (code, signal) => {
                    if (code !== 0 && signal === null) {
                        const duration = Date.now() - startTime;
                        const exitError = new Error(`크롤링 프로세스가 비정상 종료되었습니다 (종료 코드: ${code})`);
                        this.handleExecutionFailure(exitError, duration);
                    }
                });
                childProcess.on('error', (error) => {
                    const duration = Date.now() - startTime;
                    this.handleExecutionFailure(error, duration);
                    reject(error);
                });
            }
            catch (error) {
                if (this.executionTimeout) {
                    clearTimeout(this.executionTimeout);
                    this.executionTimeout = null;
                }
                const duration = Date.now() - startTime;
                this.handleExecutionFailure(error, duration);
                reject(error);
            }
        });
    }
    handleExecutionSuccess(stdout, stderr, duration) {
        this.status.isRunning = false;
        this.status.lastSuccess = true;
        this.status.lastError = null;
        this.status.lastRunDuration = duration;
        this.status.consecutiveFailures = 0;
        this.status.totalSuccesses++;
        console.log('✅ 크롤링 완료');
        console.log(`⏱️ 소요 시간: ${(duration / 1000).toFixed(2)}초`);
        if (stdout) {
            const outputPreview = stdout.length > 1000 ? stdout.substring(0, 1000) + '...' : stdout;
            console.log('📊 크롤링 결과:', outputPreview);
        }
        if (stderr) {
            console.warn('⚠️ 크롤링 경고:', stderr.substring(0, 500));
        }
        try {
            if (this.job) {
                const nextDates = this.job.nextDates();
                if (!nextDates) {
                    this.status.nextRun = null;
                    return;
                }
                const nextRunRaw = Array.isArray(nextDates)
                    ? (nextDates[0] || null)
                    : (nextDates || null);
                const nextRun = nextRunRaw instanceof Date ? nextRunRaw : (nextRunRaw ? new Date(nextRunRaw) : null);
                this.status.nextRun = nextRun;
            }
        }
        catch (dateError) {
            console.warn('⚠️ 다음 실행 시간 업데이트 실패:', dateError);
        }
    }
    handleExecutionFailure(error, duration) {
        this.status.isRunning = false;
        this.status.lastSuccess = false;
        this.status.lastError = error instanceof Error ? error.message : String(error);
        this.status.lastRunDuration = duration;
        this.status.consecutiveFailures++;
        this.status.totalFailures++;
        console.error('❌ 크롤링 실행 실패:', error);
        console.error(`📊 연속 실패 횟수: ${this.status.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`);
        this.logError(error, duration);
        try {
            if (this.job) {
                const nextDates = this.job.nextDates();
                if (!nextDates) {
                    this.status.nextRun = null;
                    return;
                }
                const nextRunRaw = Array.isArray(nextDates)
                    ? (nextDates[0] || null)
                    : (nextDates || null);
                const nextRun = nextRunRaw instanceof Date ? nextRunRaw : (nextRunRaw ? new Date(nextRunRaw) : null);
                this.status.nextRun = nextRun;
            }
        }
        catch (dateError) {
            console.warn('⚠️ 다음 실행 시간 업데이트 실패:', dateError);
        }
        if (this.status.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.error(`❌ 연속 실패 횟수 초과. 다음 실행은 건너뜁니다.`);
            console.error('   수동으로 실행하여 문제를 해결한 후 스케줄러를 재시작하세요.');
        }
    }
    async executeCrawling(scriptPath) {
        await this.safeExecuteCrawling(scriptPath);
    }
    logError(error, duration) {
        const logDir = path.join(process.cwd(), 'logs');
        const logFile = path.join(logDir, 'weekly-crawling-scheduler-error.log');
        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            this.rotateLogFileIfNeeded(logFile);
            const timestamp = new Date().toISOString();
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : '';
            const logEntry = `[${timestamp}] ERROR: ${errorMessage}\n` +
                `Duration: ${(duration / 1000).toFixed(2)}s\n` +
                `Consecutive Failures: ${this.status.consecutiveFailures}\n` +
                `Total Runs: ${this.status.totalRuns}, Successes: ${this.status.totalSuccesses}, Failures: ${this.status.totalFailures}\n` +
                `${errorStack}\n\n`;
            fs.appendFileSync(logFile, logEntry, 'utf-8');
        }
        catch (logError) {
            console.error('❌ 로그 파일 쓰기 실패:', logError);
        }
    }
    rotateLogFileIfNeeded(logFile) {
        try {
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                if (stats.size > MAX_LOG_FILE_SIZE) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const rotatedFile = `${logFile}.${timestamp}`;
                    fs.renameSync(logFile, rotatedFile);
                    console.log(`📦 로그 파일 로테이션: ${logFile} -> ${rotatedFile}`);
                    this.cleanupOldLogFiles(path.dirname(logFile));
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 로그 파일 로테이션 실패:', error);
        }
    }
    cleanupOldLogFiles(logDir) {
        try {
            const files = fs.readdirSync(logDir);
            const now = Date.now();
            const maxAge = 30 * 24 * 60 * 60 * 1000;
            for (const file of files) {
                if (file.startsWith('weekly-crawling-scheduler-error.log.')) {
                    const filePath = path.join(logDir, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                        console.log(`🗑️ 오래된 로그 파일 삭제: ${file}`);
                    }
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 오래된 로그 파일 정리 실패:', error);
        }
    }
    stop() {
        try {
            if (this.status.isRunning && this.currentProcess) {
                console.log('⚠️ 실행 중인 크롤링 프로세스 종료 중...');
                this.currentProcess.kill('SIGTERM');
                setTimeout(() => {
                    if (this.currentProcess && !this.currentProcess.killed) {
                        console.warn('⚠️ 프로세스가 종료되지 않아 강제 종료합니다');
                        this.currentProcess.kill('SIGKILL');
                    }
                }, 5000);
            }
            if (this.executionTimeout) {
                clearTimeout(this.executionTimeout);
                this.executionTimeout = null;
            }
            if (this.job) {
                this.job.stop();
                this.job = null;
                console.log('🛑 주간 크롤링 스케줄러 중지');
            }
            this.executionLock = false;
            this.currentProcess = null;
        }
        catch (error) {
            console.error('❌ 스케줄러 중지 중 오류 발생:', error);
        }
    }
    getStatus() {
        if (this.job && !this.status.isRunning) {
            try {
                const nextDates = this.job.nextDates();
                if (!nextDates) {
                    this.status.nextRun = null;
                    return this.status;
                }
                const nextRunRaw = Array.isArray(nextDates)
                    ? (nextDates[0] || null)
                    : (nextDates || null);
                const nextRun = nextRunRaw instanceof Date ? nextRunRaw : (nextRunRaw ? new Date(nextRunRaw) : null);
                this.status.nextRun = nextRun;
            }
            catch (error) {
            }
        }
        return { ...this.status };
    }
    async runManual() {
        if (this.status.isRunning || this.executionLock) {
            return {
                success: false,
                message: '크롤링이 이미 실행 중입니다'
            };
        }
        const scriptPath = this.getScriptPath();
        if (!scriptPath) {
            return {
                success: false,
                message: '크롤링 스크립트를 찾을 수 없습니다'
            };
        }
        if (!this.validateScriptPath(scriptPath)) {
            return {
                success: false,
                message: '크롤링 스크립트 파일이 유효하지 않습니다'
            };
        }
        console.log('🔧 수동 크롤링 실행 요청');
        try {
            await this.executeCrawling(scriptPath);
            if (this.status.lastSuccess) {
                this.status.consecutiveFailures = 0;
            }
            return {
                success: this.status.lastSuccess,
                message: this.status.lastSuccess
                    ? '크롤링이 성공적으로 완료되었습니다'
                    : `크롤링 실행 실패: ${this.status.lastError || '알 수 없는 오류'}`
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                message: `크롤링 실행 중 예외 발생: ${errorMessage}`
            };
        }
    }
}
exports.weeklyCrawlingScheduler = new WeeklyCrawlingScheduler();
