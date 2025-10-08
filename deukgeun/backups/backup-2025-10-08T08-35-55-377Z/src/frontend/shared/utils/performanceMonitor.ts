// Performance API 타입 확장
interface PerformanceNavigationTiming extends PerformanceEntry {
  loadEventEnd: number
  loadEventStart: number
  domContentLoadedEventEnd: number
  domContentLoadedEventStart: number
}

interface PerformancePaintTiming extends PerformanceEntry {
  name: string
  startTime: number
}

interface PerformanceInputTiming extends PerformanceEntry {
  processingStart: number
  startTime: number
}

interface PerformanceLayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

interface PerformanceReport {
  timestamp: string
  url: string
  metrics: PerformanceMetrics
  userAgent: string
  viewport: {
    width: number
    height: number
  }
}

class PerformanceMonitor {
  private reports: PerformanceReport[] = []
  private isMonitoring = false

  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.observePerformanceMetrics()
    this.observeUserInteractions()
    this.observeMemoryUsage()

    console.log("🔍 성능 모니터링이 시작되었습니다.")
  }

  stopMonitoring() {
    this.isMonitoring = false
    console.log("🔍 성능 모니터링이 중지되었습니다.")
  }

  private observePerformanceMetrics() {
    // 페이지 로드 성능 측정
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType("paint")

      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          paint.find(entry => entry.name === "first-contentful-paint")
            ?.startTime || 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
      }

      // Largest Contentful Paint 측정
      if ("PerformanceObserver" in window) {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      }

      // First Input Delay 측정
      if ("PerformanceObserver" in window) {
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const firstEntry = entries[0] as PerformanceInputTiming
          metrics.firstInputDelay =
            firstEntry.processingStart - firstEntry.startTime
        })
        fidObserver.observe({ entryTypes: ["first-input"] })
      }

      // Cumulative Layout Shift 측정
      if ("PerformanceObserver" in window) {
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as PerformanceLayoutShift
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value
            }
          }
          metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ["layout-shift"] })
      }

      this.recordMetrics(metrics)
    })
  }

  private observeUserInteractions() {
    // 사용자 상호작용 성능 측정
    let firstInteraction = true

    const interactionTypes = ["click", "keydown", "scroll", "touchstart"]

    interactionTypes.forEach(type => {
      document.addEventListener(
        type,
        event => {
          if (firstInteraction) {
            const now = performance.now()
            const navigation = performance.getEntriesByType(
              "navigation"
            )[0] as PerformanceNavigationTiming
            const firstInputDelay = now - navigation.loadEventEnd

            this.recordMetrics({
              pageLoadTime: 0,
              domContentLoaded: 0,
              firstContentfulPaint: 0,
              largestContentfulPaint: 0,
              firstInputDelay,
              cumulativeLayoutShift: 0,
            })

            firstInteraction = false
          }
        },
        { once: true }
      )
    })
  }

  private observeMemoryUsage() {
    // 메모리 사용량 모니터링 (Chrome에서만 사용 가능)
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (
          performance as Performance & { memory: PerformanceMemory }
        ).memory
        this.recordMetrics({
          pageLoadTime: 0,
          domContentLoaded: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          memoryUsage: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        })
      }, 30000) // 30초마다 측정
    }
  }

  private recordMetrics(metrics: PerformanceMetrics) {
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metrics,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }

    this.reports.push(report)
    this.analyzePerformance(report)
  }

  private analyzePerformance(report: PerformanceReport) {
    const { metrics } = report
    const warnings: string[] = []

    // 성능 임계값 체크
    if (metrics.pageLoadTime > 3000) {
      warnings.push("페이지 로드 시간이 3초를 초과합니다.")
    }

    if (metrics.firstContentfulPaint > 2000) {
      warnings.push("First Contentful Paint가 2초를 초과합니다.")
    }

    if (metrics.largestContentfulPaint > 2500) {
      warnings.push("Largest Contentful Paint가 2.5초를 초과합니다.")
    }

    if (metrics.firstInputDelay > 100) {
      warnings.push("First Input Delay가 100ms를 초과합니다.")
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      warnings.push("Cumulative Layout Shift가 0.1을 초과합니다.")
    }

    if (
      metrics.memoryUsage &&
      metrics.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024
    ) {
      warnings.push("메모리 사용량이 50MB를 초과합니다.")
    }

    if (warnings.length > 0) {
      console.warn("⚠️ 성능 경고:", warnings)
    }
  }

  getReports(): PerformanceReport[] {
    return this.reports
  }

  getLatestReport(): PerformanceReport | null {
    return this.reports[this.reports.length - 1] || null
  }

  clearReports() {
    this.reports = []
  }

  exportReports(): string {
    return JSON.stringify(this.reports, null, 2)
  }

  // API로 성능 데이터 전송
  async sendPerformanceData(endpoint: string) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reports: this.reports,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        console.log("📊 성능 데이터가 성공적으로 전송되었습니다.")
        this.clearReports()
      } else {
        console.error("❌ 성능 데이터 전송 실패:", response.statusText)
      }
    } catch (error) {
      console.error("❌ 성능 데이터 전송 중 오류:", error)
    }
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor()

// 자동 시작 (개발 환경에서만)
if (import.meta.env.DEV) {
  performanceMonitor.startMonitoring()
}
