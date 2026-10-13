```powershell
$project = "C:\Users\Gabriel\Documents\KYUSI-ESPORTS-MANAGEMENT"
$output = "$project\database\schema.sql"

New-Item -ItemType Directory -Force -Path "$project\database" | Out-Null

& "C:\xampp\mysql\bin\mysqldump.exe" `
  -u root `
  --no-data `
  --routines `
  --triggers `
  kyusi_esports_management |
  Set-Content -Path $output -Encoding utf8

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema updated successfully: $output" -ForegroundColor Green
} else {
    Write-Host "Schema export failed. Check your MySQL connection." -ForegroundColor Red
}