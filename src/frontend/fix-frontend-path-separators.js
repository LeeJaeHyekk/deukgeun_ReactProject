const fs = require("fs")
const path = require("path")

function fixPathSeparatorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    let modified = false

    // 백슬래시를 슬래시로 변경
    const backslashRegex =
      /import\s+{[^}]*}\s+from\s+["']([^"']*\\)([^"']*)["']/g
    content = content.replace(backslashRegex, (match, pathPart1, pathPart2) => {
      modified = true
      return match.replace(/\\/g, "/")
    })

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`Fixed path separators in: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
  }
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
      fixPathSeparatorsInFile(filePath)
    }
  }
}

// 현재 디렉토리부터 시작
walkDirectory("./")
console.log("Frontend path separator fixing completed!")
