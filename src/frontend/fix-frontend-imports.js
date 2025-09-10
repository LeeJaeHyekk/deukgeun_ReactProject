const fs = require("fs")
const path = require("path")

// 프론트엔드 파일들의 실제 위치 매핑
const frontendMappings = {
  // Types
  "types/auth": "shared/types/auth",
  "types/community": "shared/types/community",
  "types/machine": "shared/types/machine",
  "types/user": "shared/types/user",
  "types/workout": "shared/types/workout",
  "types/admin/admin.types": "shared/types/admin",
  "types/auth/auth.types": "shared/types/auth",
  "types/frontend.types": "shared/types/common",

  // Lib
  "lib/api-client": "shared/lib/api-client",
  "lib/config": "shared/lib/config",
  "lib/toast": "shared/lib/toast",
  "lib/validation": "shared/lib/validation",

  // Config
  "config/apiEndpoints": "shared/config/apiEndpoints",

  // Constants
  "constants/validationMessages": "shared/constants/validation",
  "constants/errorMessages": "shared/constants/validation",
  "constants/routes": "shared/constants/routes",
  "constants/machine": "shared/constants/machine",

  // Components
  "components/RecaptchaWidget": "shared/components/RecaptchaWidget",
  "components/LevelDisplay": "shared/components/LevelDisplay",

  // Contexts
  "contexts/AuthContext": "shared/contexts/AuthContext",
  "contexts/WorkoutTimerContext": "shared/contexts/WorkoutTimerContext",

  // Hooks
  "hooks/useRecaptcha": "shared/hooks/useRecaptcha",
  "hooks/useAuth": "shared/hooks/useAuth",
  "hooks/useLevel": "shared/hooks/useLevel",
  "hooks/useStats": "shared/hooks/useStats",
  "hooks/useMachines": "shared/hooks/useMachines",

  // Store
  "store/userStore": "shared/store/userStore",

  // Utils
  "utils/toast": "shared/lib/toast",
  "utils/adminUtils": "shared/utils/adminUtils",

  // API
  "api/communityApi": "shared/api/communityApi",

  // Widgets
  "@widgets/Navigation/Navigation":
    "shared/components/layout/Navigation/Navigation",

  // DTO
  "@dto/index": "shared/types/common",

  // Shared
  "@shared/lib": "shared/lib",
  "@shared/hooks/useRecaptcha": "shared/hooks/useRecaptcha",
  "@shared/constants/validation": "shared/constants/validation",
  "@shared/contexts/AuthContext": "shared/contexts/AuthContext",
  "@shared/contexts/WorkoutTimerContext": "shared/contexts/WorkoutTimerContext",

  // Pages
  "@pages/Error": "shared/components/ErrorHandler",
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    let modified = false

    // Import 경로 수정
    for (const [oldPath, newPath] of Object.entries(frontendMappings)) {
      // 상대 경로 import 수정
      const relativeRegex = new RegExp(
        `import\\s+{[^}]*}\\s+from\\s+["']\\.\\./.*?${oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g"
      )
      if (content.match(relativeRegex)) {
        content = content.replace(relativeRegex, match => {
          const relativePath = getRelativePath(filePath, newPath)
          return match.replace(
            /from\s+["'][^"']*["']/,
            `from "${relativePath}"`
          )
        })
        modified = true
      }

      // 절대 경로 import 수정
      const absoluteRegex = new RegExp(
        `import\\s+{[^}]*}\\s+from\\s+["']${oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g"
      )
      if (content.match(absoluteRegex)) {
        content = content.replace(absoluteRegex, match => {
          const relativePath = getRelativePath(filePath, newPath)
          return match.replace(
            /from\s+["'][^"']*["']/,
            `from "${relativePath}"`
          )
        })
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`Fixed imports in: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
  }
}

function getRelativePath(fromPath, toPath) {
  const fromDir = path.dirname(fromPath)
  const relativePath = path.relative(fromDir, toPath)
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      walkDirectory(filePath)
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fixImportsInFile(filePath)
    }
  }
}

// 현재 디렉토리부터 시작
walkDirectory("./")
console.log("Frontend import fixing completed!")
