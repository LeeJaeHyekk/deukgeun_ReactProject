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
exports.CrawlingHistoryTracker = void 0;
const pathUtils_1 = require("../utils/pathUtils.cjs");
class CrawlingHistoryTracker {
    constructor() {
        this.sessions = new Map();
        this.currentSession = null;
        this.maxHistoryEntries = 1000;
        this.maxSessions = 50;
    }
    startSession(config) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            startTime: new Date(),
            status: 'running',
            totalSteps: 0,
            completedSteps: 0,
            progress: { current: 0, total: 0, percentage: 0 },
            results: {
                publicApiGyms: 0,
                crawlingGyms: 0,
                mergedGyms: 0,
                totalGyms: 0,
                qualityScore: 0
            },
            errors: [],
            warnings: [],
            history: []
        };
        this.sessions.set(sessionId, session);
        this.currentSession = session;
        this.addHistoryEntry({
            type: 'api_collection',
            status: 'started',
            details: {
                step: '크롤링 세션 시작',
                progress: { current: 0, total: 0, percentage: 0 }
            },
            metadata: {
                config,
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
        console.log(`📊 크롤링 세션 시작: ${sessionId}`);
        return sessionId;
    }
    endSession(sessionId, status) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        session.status = status;
        session.endTime = new Date();
        session.currentStep = undefined;
        this.addHistoryEntry({
            type: 'complete',
            status: status === 'completed' ? 'completed' : 'failed',
            details: {
                step: `크롤링 세션 ${status}`,
                duration: session.endTime.getTime() - session.startTime.getTime(),
                statistics: {
                    totalProcessed: session.results.totalGyms,
                    qualityScore: session.results.qualityScore
                }
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
        console.log(`📊 크롤링 세션 종료: ${sessionId} (${status})`);
        this.cleanupOldSessions();
    }
    recordApiCollection(progress, results) {
        if (!this.currentSession)
            return;
        this.addHistoryEntry({
            type: 'api_collection',
            status: 'in_progress',
            details: {
                step: '공공 API 데이터 수집',
                progress: {
                    current: progress.current,
                    total: progress.total,
                    percentage: Math.round((progress.current / progress.total) * 100)
                },
                statistics: {
                    totalProcessed: results.count
                }
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
        this.currentSession.results.publicApiGyms = results.count;
        this.updateSessionProgress();
    }
    recordNameCrawling(progress) {
        if (!this.currentSession)
            return;
        this.addHistoryEntry({
            type: 'name_crawling',
            status: progress.isRunning ? 'in_progress' : 'completed',
            details: {
                step: `헬스장 이름 크롤링: ${progress.currentStep}`,
                progress: {
                    current: progress.progress.current,
                    total: progress.progress.total,
                    percentage: progress.progress.percentage
                },
                errors: progress.errors
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
        this.currentSession.results.crawlingGyms = progress.progress.current;
        this.updateSessionProgress();
    }
    recordDataMerging(mergeResult) {
        if (!this.currentSession)
            return;
        this.addHistoryEntry({
            type: 'data_merging',
            status: 'completed',
            details: {
                step: '데이터 병합 완료',
                statistics: {
                    totalProcessed: mergeResult.statistics.totalProcessed,
                    successfullyMerged: mergeResult.statistics.successfullyMerged,
                    fallbackUsed: mergeResult.statistics.fallbackUsed,
                    duplicatesRemoved: mergeResult.statistics.duplicatesRemoved,
                    qualityScore: mergeResult.statistics.qualityScore
                }
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
        this.currentSession.results.mergedGyms = mergeResult.statistics.totalProcessed;
        this.currentSession.results.qualityScore = mergeResult.statistics.qualityScore;
        this.updateSessionProgress();
    }
    recordError(error, step) {
        if (!this.currentSession)
            return;
        this.currentSession.errors.push(error);
        this.addHistoryEntry({
            type: 'api_collection',
            status: 'failed',
            details: {
                step: step || '알 수 없는 단계',
                errors: [error]
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
    }
    recordWarning(warning, step) {
        if (!this.currentSession)
            return;
        this.currentSession.warnings.push(warning);
        this.addHistoryEntry({
            type: 'api_collection',
            status: 'in_progress',
            details: {
                step: step || '알 수 없는 단계',
                warnings: [warning]
            },
            metadata: {
                config: {},
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            }
        });
    }
    getCurrentSession() {
        return this.currentSession ? { ...this.currentSession } : null;
    }
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? { ...session } : null;
    }
    getAllSessions() {
        return Array.from(this.sessions.values()).map(session => ({ ...session }));
    }
    getRecentSessions(limit = 10) {
        return Array.from(this.sessions.values())
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
            .slice(0, limit)
            .map(session => ({ ...session }));
    }
    getSessionStatistics() {
        const sessions = Array.from(this.sessions.values());
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const failedSessions = sessions.filter(s => s.status === 'failed');
        const averageDuration = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => {
                const duration = s.endTime ? s.endTime.getTime() - s.startTime.getTime() : 0;
                return sum + duration;
            }, 0) / completedSessions.length
            : 0;
        const averageQualityScore = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.results.qualityScore, 0) / completedSessions.length
            : 0;
        const totalGymsProcessed = sessions.reduce((sum, s) => sum + s.results.totalGyms, 0);
        return {
            totalSessions: sessions.length,
            completedSessions: completedSessions.length,
            failedSessions: failedSessions.length,
            averageDuration,
            averageQualityScore,
            totalGymsProcessed
        };
    }
    addHistoryEntry(entry) {
        if (!this.currentSession)
            return;
        const historyEntry = {
            id: this.generateEntryId(),
            timestamp: new Date(),
            sessionId: this.currentSession.id,
            ...entry
        };
        this.currentSession.history.push(historyEntry);
        if (this.currentSession.history.length > this.maxHistoryEntries) {
            this.currentSession.history = this.currentSession.history.slice(-this.maxHistoryEntries);
        }
    }
    updateSessionProgress() {
        if (!this.currentSession)
            return;
        const totalGyms = this.currentSession.results.publicApiGyms + this.currentSession.results.crawlingGyms;
        this.currentSession.results.totalGyms = totalGyms;
        this.currentSession.progress = {
            current: totalGyms,
            total: totalGyms,
            percentage: 100
        };
    }
    cleanupOldSessions() {
        if (this.sessions.size <= this.maxSessions)
            return;
        const sessions = Array.from(this.sessions.entries())
            .sort((a, b) => b[1].startTime.getTime() - a[1].startTime.getTime());
        const sessionsToKeep = sessions.slice(0, this.maxSessions);
        this.sessions.clear();
        sessionsToKeep.forEach(([id, session]) => {
            this.sessions.set(id, session);
        });
        console.log(`🧹 오래된 세션 정리 완료: ${sessions.length - this.maxSessions}개 세션 제거`);
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateEntryId() {
        return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async saveHistoryToFile() {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getCrawlingHistoryPath)();
            const historyData = {
                sessions: Array.from(this.sessions.values()),
                statistics: this.getSessionStatistics(),
                lastUpdated: new Date().toISOString()
            };
            await fs.writeFile(filePath, JSON.stringify(historyData, null, 2), 'utf-8');
            console.log('💾 크롤링 히스토리 저장 완료');
        }
        catch (error) {
            console.error('❌ 크롤링 히스토리 저장 실패:', error);
        }
    }
    async loadHistoryFromFile() {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getCrawlingHistoryPath)();
            const content = await fs.readFile(filePath, 'utf-8');
            const historyData = JSON.parse(content);
            if (historyData.sessions) {
                this.sessions.clear();
                historyData.sessions.forEach((session) => {
                    this.sessions.set(session.id, session);
                });
                console.log(`📄 크롤링 히스토리 로드 완료: ${this.sessions.size}개 세션`);
            }
        }
        catch (error) {
            console.log('📄 크롤링 히스토리 파일을 찾을 수 없습니다. 새로 시작합니다.');
        }
    }
}
exports.CrawlingHistoryTracker = CrawlingHistoryTracker;
