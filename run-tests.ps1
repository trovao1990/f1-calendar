# Executa testes unitários do F1 Calendário
# Uso: powershell -ExecutionPolicy Bypass -File run-tests.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
  Write-Host "Node.js nao encontrado. Instale Node.js para executar os testes." -ForegroundColor Yellow
  exit 1
}

Push-Location $root
try {
  node --test js/tests/*.test.js
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
