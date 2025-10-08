# 모든 .cjs 파일의 require 경로를 .cjs 확장자로 수정
Get-ChildItem -Path . -Recurse -Filter "*.cjs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content
    
    # require("./module") -> require("./module.cjs")
    $content = $content -replace 'require\("\.\/([^"]+)\.js"\)', 'require("./$1.cjs")'
    $content = $content -replace 'require\("\.\/([^"]+)"\)', 'require("./$1.cjs")'
    
    # require("../module") -> require("../module.cjs")
    $content = $content -replace 'require\("\.\.\/([^"]+)\.js"\)', 'require("../$1.cjs")'
    $content = $content -replace 'require\("\.\.\/([^"]+)"\)', 'require("../$1.cjs")'
    
    # require("../../module") -> require("../../module.cjs")
    $content = $content -replace 'require\("\.\.\/\.\.\/([^"]+)\.js"\)', 'require("../../$1.cjs")'
    $content = $content -replace 'require\("\.\.\/\.\.\/([^"]+)"\)', 'require("../../$1.cjs")'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed requires in: $($_.Name)"
    }
}
Write-Host "All require paths have been updated to use .cjs extension"
