#!/usr/bin/env bash
# Descarga el binario oficial de uv para la plataforma de destino y lo deja como sidecar de Tauri
# (apps/desktop/src-tauri/binaries/uv-<triple>[.exe]). Así las tres apps llevan la misma versión de uv
# y pueden instalar Python nativo sin depender del sistema.
#   bash scripts/fetch-uv.sh <triple>     triple: aarch64-apple-darwin | x86_64-apple-darwin |
#                                          universal-apple-darwin | x86_64-pc-windows-msvc | x86_64-unknown-linux-gnu
set -euo pipefail
UV_VERSION="${UV_VERSION:-0.13.0}"
TRIPLE="$1"
DEST="$(cd "$(dirname "$0")/.." && pwd)/apps/desktop/src-tauri/binaries"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$DEST"
rm -f "$DEST"/uv-"$TRIPLE"* 2>/dev/null || true
[[ "$TRIPLE" == universal-apple-darwin ]] && rm -f "$DEST"/uv-*-apple-darwin
base="https://github.com/astral-sh/uv/releases/download/${UV_VERSION}"

bajar() { # bajar <triple> → ruta del binario extraído
  local t="$1"
  if [[ "$t" == *windows* ]]; then
    curl -fsSL "$base/uv-$t.zip" -o "$TMP/$t.zip" && unzip -q -o "$TMP/$t.zip" -d "$TMP/$t" && echo "$TMP/$t/uv.exe"
  else
    curl -fsSL "$base/uv-$t.tar.gz" -o "$TMP/$t.tgz" && mkdir -p "$TMP/$t" && tar -xzf "$TMP/$t.tgz" -C "$TMP/$t" && find "$TMP/$t" -type f -name uv | head -1
  fi
}

case "$TRIPLE" in
  universal-apple-darwin)
    a=$(bajar aarch64-apple-darwin); x=$(bajar x86_64-apple-darwin)
    lipo -create "$a" "$x" -output "$DEST/uv-universal-apple-darwin"
    cp "$DEST/uv-universal-apple-darwin" "$DEST/uv-aarch64-apple-darwin"
    cp "$DEST/uv-universal-apple-darwin" "$DEST/uv-x86_64-apple-darwin" ;;
  *windows*) cp "$(bajar "$TRIPLE")" "$DEST/uv-$TRIPLE.exe" ;;
  *) cp "$(bajar "$TRIPLE")" "$DEST/uv-$TRIPLE" ;;
esac
chmod +x "$DEST"/uv-* 2>/dev/null || true
echo "uv ${UV_VERSION} → $DEST ($TRIPLE)"
