const SCRIPT = `#Requires -Version 5
$ErrorActionPreference = 'Stop'

$url = 'https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella.exe'
$dest = Join-Path $env:TEMP 'Stella.exe'

Write-Host 'Downloading Stella for Windows...'
Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing

Write-Host 'Launching installer...'
Start-Process -FilePath $dest
`;

const HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(SCRIPT, { status: 200, headers: HEADERS });
}
