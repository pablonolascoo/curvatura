#!/usr/bin/env bash
# Publica Curvatura en GitHub (pablonolascoo/curvatura) como repositorio público y fácil de encontrar.
#   1. Crea el repo público y sube main y la etiqueta de la última versión.
#   2. Descripción, web, temas (topics) y Discussions, para que aparezca en las búsquedas.
#   3. Secretos de firma del actualizador (las claves se leen de su archivo local; nunca se muestran).
#   4. La etiqueta de la última versión lanza la compilación de las apps de macOS, Windows y Linux.
# Uso (desde la raíz del repo, con `gh auth login` hecho):  bash scripts/publicar-github.sh
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="pablonolascoo/curvatura"
WEB="https://curvatura.consultora-bim.workers.dev"
DESC="Open research programme to take the warp drive from general relativity to engineering: 3,400-paper library, formula lab (Rust, GPU, Python), research AI with multimodal RAG, desktop apps."

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --description "$DESC" --homepage "$WEB" --source . --remote origin
fi
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"

git push -u origin main
gh repo edit "$REPO" --description "$DESC" --homepage "$WEB" \
  --enable-discussions --enable-issues \
  --add-topic warp-drive --add-topic general-relativity --add-topic alcubierre --add-topic physics \
  --add-topic exotic-propulsion --add-topic negative-energy --add-topic open-science --add-topic research \
  --add-topic rag --add-topic scientific-computing --add-topic rust --add-topic webgpu --add-topic tauri \
  --add-topic nextjs --add-topic sympy

# Claves del actualizador para firmar las apps en GitHub Actions (salen de ~/Library/Application Support/Curvatura/firma).
eval "$(bun scripts/firma.ts --github)"

# Solo la última versión: cada etiqueta que llega a GitHub lanza release.yml (apps de las tres plataformas
# y latest.json del actualizador); las antiguas solo se quedan en local.
ULTIMA="v$(bun -e 'console.log(require("./version.json").version)')"
git push origin "$ULTIMA"
echo
echo "Hecho: https://github.com/$REPO"
echo "Las apps se están compilando en https://github.com/$REPO/actions"
