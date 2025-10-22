"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(failureThreshold = 5, recoveryTimeout = 60000, halfOpenMaxCalls = 3) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.halfOpenMaxCalls = halfOpenMaxCalls;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
    }
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
                console.log('🔄 회로 차단기: HALF_OPEN 상태로 전환');
            }
            else {
                throw new Error('Circuit breaker is OPEN - too many failures');
            }
        }
        if (this.state === 'HALF_OPEN' && this.failureCount >= this.halfOpenMaxCalls) {
            this.state = 'OPEN';
            this.lastFailureTime = Date.now();
            throw new Error('Circuit breaker is OPEN - half-open limit exceeded');
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            console.log('✅ 회로 차단기: CLOSED 상태로 복구');
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            console.log(`🚫 회로 차단기: OPEN 상태로 전환 (실패 횟수: ${this.failureCount})`);
        }
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failureCount;
    }
    reset() {
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
        console.log('🔄 회로 차단기: 리셋됨');
    }
}
exports.CircuitBreaker = CircuitBreaker;
