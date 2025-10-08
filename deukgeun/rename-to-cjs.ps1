# 모든 .js 파일을 .cjs로 변경하는 스크립트
Get-ChildItem -Path . -Recurse -Filter "*.js" | ForEach-Object {
    $newName = $_.Name -replace '\.js$', '.cjs'
    Rename-Item -Path $_.FullName -NewName $newName
    Write-Host "Renamed: $($_.Name) -> $newName"
}
Write-Host "All .js files have been renamed to .cjs"
