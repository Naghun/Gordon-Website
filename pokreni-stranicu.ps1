$projectRoot = $PSScriptRoot
$python = Join-Path $projectRoot ".venv\Scripts\python.exe"
$backend = Join-Path $projectRoot "backend"
$frontend = Join-Path $projectRoot "frontend"

if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $python -ArgumentList "manage.py", "runserver", "127.0.0.1:8000" -WorkingDirectory $backend -WindowStyle Hidden
}

if (-not (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173" -WorkingDirectory $frontend -WindowStyle Hidden
}

Write-Host "Frontend:     http://127.0.0.1:5173"
Write-Host "Django admin: http://127.0.0.1:8000/admin/"
