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
exports.CrawlingMonitor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const readFile = (0, util_1.promisify)(fs.readFile);
const stat = (0, util_1.promisify)(fs.stat);
class CrawlingMonitor {
    constructor() {
        this.maxLogSize = 10 * 1024 * 1024;
        this.logFile = path.join(process.cwd(), 'logs', 'weekly-crawling.log');
        this.gymsRawFile = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json');
    }
    async checkCrawlingStatus() {
        const status = {
            isRunning: false,
            lastRun: null,
            nextRun: null,
            successCount: 0,
            errorCount: 0,
            totalProcessed: 0,
            lastError: null,
            healthScore: 0
        };
        try {
            const { execSync } = require('child_process');
            const pm2Status = execSync('pm2 jlist', { encoding: 'utf-8' });
            const processes = JSON.parse(pm2Status);
            const crawlingProcess = processes.find((p) => p.name === 'weekly-crawling');
            if (crawlingProcess) {
                status.isRunning = crawlingProcess.pm2_env.status === 'online';
            }
            if (fs.existsSync(this.logFile)) {
                const logContent = await this.readLastLines(this.logFile, 100);
                const analysis = this.analyzeLogContent(logContent);
                status.successCount = analysis.successCount;
                status.errorCount = analysis.errorCount;
                status.totalProcessed = analysis.totalProcessed;
                status.lastError = analysis.lastError;
                status.lastRun = analysis.lastRun;
                status.healthScore = this.calculateHealthScore(analysis);
            }
            status.nextRun = this.calculateNextRun();
        }
        catch (error) {
            console.error('상태 확인 실패:', error);
        }
        return status;
    }
    async checkSystemHealth() {
        const health = {
            memoryUsage: 0,
            diskUsage: 0,
            cpuUsage: 0,
            uptime: 0,
            processCount: 0
        };
        try {
            const memInfo = await this.readFileContent('/proc/meminfo');
            const memTotal = this.extractNumber(memInfo, 'MemTotal:');
            const memAvailable = this.extractNumber(memInfo, 'MemAvailable:');
            health.memoryUsage = ((memTotal - memAvailable) / memTotal) * 100;
            const { execSync } = require('child_process');
            const dfOutput = execSync('df -h /', { encoding: 'utf-8' });
            const diskMatch = dfOutput.match(/(\d+)%/);
            if (diskMatch) {
                health.diskUsage = parseInt(diskMatch[1]);
            }
            const loadAvg = require('os').loadavg()[0];
            health.cpuUsage = Math.min(loadAvg * 100, 100);
            health.uptime = require('os').uptime();
            const psOutput = execSync('ps aux | wc -l', { encoding: 'utf-8' });
            health.processCount = parseInt(psOutput.trim()) - 1;
        }
        catch (error) {
            console.error('시스템 상태 확인 실패:', error);
        }
        return health;
    }
    async checkGymsRawFile() {
        const result = {
            exists: false,
            size: 0,
            lastModified: null,
            recordCount: 0,
            isValid: false
        };
        try {
            if (fs.existsSync(this.gymsRawFile)) {
                result.exists = true;
                const stats = await stat(this.gymsRawFile);
                result.size = stats.size;
                result.lastModified = stats.mtime;
                const content = await readFile(this.gymsRawFile, 'utf-8');
                const data = JSON.parse(content);
                if (Array.isArray(data)) {
                    result.recordCount = data.length;
                    result.isValid = true;
                }
            }
        }
        catch (error) {
            console.error('gyms_raw.json 확인 실패:', error);
        }
        return result;
    }
    async generateReport() {
        const status = await this.checkCrawlingStatus();
        const health = await this.checkSystemHealth();
        const fileInfo = await this.checkGymsRawFile();
        const report = `
========================================
📊 EC2 크롤링 모니터링 리포트
========================================
📅 생성 시간: ${new Date().toISOString()}

🔄 크롤링 상태:
  - 실행 중: ${status.isRunning ? '✅ 예' : '❌ 아니오'}
  - 마지막 실행: ${status.lastRun ? status.lastRun.toISOString() : '알 수 없음'}
  - 다음 실행: ${status.nextRun ? status.nextRun.toISOString() : '알 수 없음'}
  - 성공 횟수: ${status.successCount}
  - 오류 횟수: ${status.errorCount}
  - 총 처리: ${status.totalProcessed}개
  - 건강 점수: ${status.healthScore}/100
  ${status.lastError ? `- 마지막 오류: ${status.lastError}` : ''}

💻 시스템 상태:
  - 메모리 사용률: ${health.memoryUsage.toFixed(1)}%
  - 디스크 사용률: ${health.diskUsage}%
  - CPU 사용률: ${health.cpuUsage.toFixed(1)}%
  - 시스템 업타임: ${Math.floor(health.uptime / 3600)}시간
  - 실행 중인 프로세스: ${health.processCount}개

📁 gyms_raw.json 상태:
  - 파일 존재: ${fileInfo.exists ? '✅ 예' : '❌ 아니오'}
  - 파일 크기: ${(fileInfo.size / 1024).toFixed(1)}KB
  - 마지막 수정: ${fileInfo.lastModified ? fileInfo.lastModified.toISOString() : '알 수 없음'}
  - 레코드 수: ${fileInfo.recordCount}개
  - 유효성: ${fileInfo.isValid ? '✅ 유효' : '❌ 무효'}

========================================
`;
        return report;
    }
    async saveReport() {
        const report = await this.generateReport();
        const reportFile = path.join(process.cwd(), 'logs', 'crawling-monitor-report.txt');
        try {
            await fs.promises.writeFile(reportFile, report, 'utf-8');
            console.log(`📄 모니터링 리포트 저장: ${reportFile}`);
        }
        catch (error) {
            console.error('리포트 저장 실패:', error);
        }
    }
    async readLastLines(filePath, lines) {
        try {
            const content = await readFile(filePath, 'utf-8');
            const allLines = content.split('\n');
            return allLines.slice(-lines).join('\n');
        }
        catch (error) {
            return '';
        }
    }
    analyzeLogContent(content) {
        const lines = content.split('\n');
        let successCount = 0;
        let errorCount = 0;
        let totalProcessed = 0;
        let lastError = null;
        let lastRun = null;
        for (const line of lines) {
            if (line.includes('✅') && line.includes('완료')) {
                successCount++;
            }
            if (line.includes('❌') || line.includes('ERROR')) {
                errorCount++;
                if (line.includes('오류:') || line.includes('실패:')) {
                    lastError = line.trim();
                }
            }
            if (line.includes('총 처리된 헬스장:')) {
                const match = line.match(/(\d+)개/);
                if (match) {
                    totalProcessed = parseInt(match[1]);
                }
            }
            if (line.includes('실행 시간:')) {
                const match = line.match(/실행 시간: (.+)/);
                if (match) {
                    lastRun = new Date(match[1]);
                }
            }
        }
        return { successCount, errorCount, totalProcessed, lastError, lastRun };
    }
    calculateHealthScore(analysis) {
        let score = 100;
        if (analysis.errorCount > 0) {
            score -= analysis.errorCount * 10;
        }
        const total = analysis.successCount + analysis.errorCount;
        if (total > 0) {
            const successRate = analysis.successCount / total;
            if (successRate < 0.8) {
                score -= (0.8 - successRate) * 50;
            }
        }
        return Math.max(0, Math.min(100, score));
    }
    calculateNextRun() {
        const now = new Date();
        const nextSunday = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        if (daysUntilSunday === 0) {
            nextSunday.setDate(now.getDate() + 7);
        }
        else {
            nextSunday.setDate(now.getDate() + daysUntilSunday);
        }
        nextSunday.setHours(2, 0, 0, 0);
        return nextSunday;
    }
    async readFileContent(filePath) {
        try {
            return await readFile(filePath, 'utf-8');
        }
        catch (error) {
            return '';
        }
    }
    extractNumber(content, pattern) {
        const match = content.match(new RegExp(pattern + '\\s+(\\d+)'));
        return match ? parseInt(match[1]) : 0;
    }
}
exports.CrawlingMonitor = CrawlingMonitor;
async function main() {
    console.log('🔍 EC2 크롤링 모니터링 시작...');
    const monitor = new CrawlingMonitor();
    try {
        const report = await monitor.generateReport();
        console.log(report);
        await monitor.saveReport();
        console.log('✅ 모니터링 완료');
    }
    catch (error) {
        console.error('❌ 모니터링 실패:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch((error) => {
        console.error('💥 모니터링 스크립트 실행 실패:', error);
        process.exit(1);
    });
}
