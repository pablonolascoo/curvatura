#!/usr/bin/env bash
# Programa la vigilancia diaria (papers nuevos, patentes, corpus, análisis y vectores) a las 03:30.
#   macOS → LaunchAgent del usuario   ·   Linux → crontab del usuario
# Quitarla:  bash ia/vigilar-instalar.sh --quitar
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$RAIZ/ia/.venv/bin/curvatura-ia"
LOG="$RAIZ/datos/vigilar.log"
ETIQUETA="org.curvatura.vigilar"
mkdir -p "$RAIZ/datos"
if [[ "$(uname)" == "Darwin" ]]; then
  PLIST="$HOME/Library/LaunchAgents/$ETIQUETA.plist"
  launchctl bootout "gui/$(id -u)/$ETIQUETA" 2>/dev/null || true
  if [[ "${1:-}" == "--quitar" ]]; then rm -f "$PLIST"; echo "Vigilancia quitada."; exit 0; fi
  cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$ETIQUETA</string>
  <key>ProgramArguments</key><array><string>$BIN</string><string>vigilar</string></array>
  <key>WorkingDirectory</key><string>$RAIZ</string>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>3</integer><key>Minute</key><integer>30</integer></dict>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
  <key>LowPriorityIO</key><true/>
  <key>Nice</key><integer>10</integer>
</dict></plist>
PL
  launchctl bootstrap "gui/$(id -u)" "$PLIST"
  echo "Vigilancia diaria programada (03:30). Registro: $LOG"
else
  LINEA="30 3 * * * cd $RAIZ && $BIN vigilar >> $LOG 2>&1 # $ETIQUETA"
  ( crontab -l 2>/dev/null | grep -v "$ETIQUETA" || true; [[ "${1:-}" == "--quitar" ]] || echo "$LINEA" ) | crontab -
  echo "Hecho (crontab). Registro: $LOG"
fi
