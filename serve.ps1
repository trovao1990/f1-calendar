# Servidor local simples para o F1 Calendário
# Uso: powershell -ExecutionPolicy Bypass -File serve.ps1

$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "F1 Calendario rodando em http://localhost:$port" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar." -ForegroundColor DarkGray

$mimes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".ico"  = "image/x-icon"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }

    $relative = $path.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar
    $filePath = [IO.Path]::GetFullPath((Join-Path $root $relative))
    $rootFull = [IO.Path]::GetFullPath($root)

    if (-not $filePath.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 404
      $body = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.OutputStream.Write($body, 0, $body.Length)
      $response.Close()
      continue
    }

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($filePath).ToLower()
      $content = [IO.File]::ReadAllBytes($filePath)
      $response.ContentType = $mimes[$ext]
      if (-not $response.ContentType) { $response.ContentType = "application/octet-stream" }
      $response.ContentLength64 = $content.Length
      $response.OutputStream.Write($content, 0, $content.Length)
    } else {
      $response.StatusCode = 404
      $body = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.OutputStream.Write($body, 0, $body.Length)
    }

    $response.Close()
  }
} finally {
  $listener.Stop()
}
