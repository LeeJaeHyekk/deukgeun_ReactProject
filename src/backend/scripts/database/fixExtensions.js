const fs = require("fs")
const path = require("path")
const { fileURLToPath   } = require("url")

const __filename = fileURLToPath(__filename)
const __dirname = path.dirname(__filename)

function fixExtensions(dir) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      fixExtensions(filePath)
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8")

      // 먼저 중복된 .js.js.js를 .js로 정리
      content = content.replace(/\.js\.js\.js/g, ".js")
      content = content.replace(/\.js\.js/g, ".js")

      // 상대 경로 import에만 .js 확장자 추가 (외부 패키지는 제외)
      // from './config/database' -> from './config/database.js'
      // from '../utils/logger' -> from '../utils/logger.js'
      // from 'typeorm' -> from 'typeorm' (변경하지 않음)
      content = content.replace(
        /from ['"]([./][^'"]*?)(?!\.js)['"]/g,
        'from "$1.js"'
      )

      fs.writeFileSync(filePath, content)
      console.log(`Fixed extensions in: ${filePath}`)
    }
  })
}

// dist 디렉토리 경로 (scripts 폴더에서 상위로 두 단계)
const distPath = path.join(__dirname, "../../../dist/backend")

if (fs.existsSync(distPath)) {
  console.log("Fixing .js extensions in built files...")
  fixExtensions(distPath)
  console.log("Extension fixing completed!")
} else {
  console.log("dist/backend directory not found. Run build first.")
  console.log("Looking for:", distPath)
}


module.exports = {
  fixExtensions,
  fs,
  path,
  __filename,
  __dirname,
  files,
  filePath,
  stat,
  content,
  distPath
}