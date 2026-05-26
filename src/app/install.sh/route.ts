const SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer is for macOS. Visit https://stella.sh to download for your platform." >&2
  exit 1
fi

case "$(uname -m)" in
  arm64)  suffix="arm64" ;;
  x86_64) suffix="x64" ;;
  *)
    echo "Unsupported architecture: $(uname -m). Visit https://stella.sh to download." >&2
    exit 1
    ;;
esac

url="https://pub-a319aaada8144dc9be5a83625033769c.r2.dev/launcher/stable/Stella-darwin-\${suffix}.dmg"
dmg="$(mktemp -d -t Stella)/Stella.dmg"

echo "Downloading Stella for macOS (\${suffix})..."
curl -fL --progress-bar "$url" -o "$dmg"

echo "Opening installer..."
open "$dmg"
`;

const HEADERS: HeadersInit = {
  "Content-Type": "text/x-shellscript; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(SCRIPT, { status: 200, headers: HEADERS });
}
