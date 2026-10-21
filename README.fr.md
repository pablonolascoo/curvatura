# Curvatura

[Español](README.md) · [English](README.en.md) · **Français** · [中文](README.zh.md)

Un programme de recherche ouvert pour faire passer le moteur de distorsion de la relativité générale à l'ingénierie.

Site : <https://curvatura.consultora-bim.workers.dev> · Version actuelle : voir [`version.json`](version.json) et [`CHANGELOG.md`](CHANGELOG.md).

---

## 1. Ce que c'est

Curvatura réunit trois choses :

1. **Une bibliothèque** d'articles sur les moteurs de distorsion, les trous de ver, l'énergie négative et les sujets voisins, classée et traduite.
2. **Des outils de calcul** pour vérifier les équations soi-même : sur le web, dans l'application de bureau et en code (Python, Rust, C++, MATLAB).
3. **Un plan de travail** qui dit ce qui empêche aujourd'hui de construire un moteur utile et comment s'y attaquer.

## 2. Ce qui est fait

| Partie | État |
|---|---|
| Bibliothèque | 3362 articles d'arXiv, d'OpenAlex et de sources chinoises. Tous les titres traduits (es, en, fr). 2109 avec résumé traduit. Pays des auteurs pour 2645. |
| Équations vivantes | 20 équations clés animées, chaque symbole expliqué, calcul en direct. |
| Laboratoire | Noyau Rust en WebAssembly, Python (Pyodide) et notre propre moteur de formules, dans le navigateur. |
| Application de bureau | macOS, Windows et Linux, toujours à la même version. Se met à jour seule et inclut Python natif. |
| Recherche et RAG | 10205 fragments indexés avec citations exactes. Serveur MCP pour Claude. |
| Évaluations | De 1 à 5 étoiles avec identité ORCID. Mention d'honneur pour les diplômés et professionnels vérifiés. |
| Plan | Phases et critères de sortie dans [`ROADMAP.md`](ROADMAP.md). Obstacles dans [`docs/obstaculos.md`](docs/obstaculos.md). |

Les traductions des titres et des résumés sont faites par IA et peuvent contenir des erreurs. Le site l'indique sur chaque fiche.

## 3. Comment l'utiliser

### 3.1 Sur le web

Ouvrez <https://curvatura.consultora-bim.workers.dev>. Rien à installer.

- **Bibliothèque** : filtrez par sous-système, type, pays, année ou pertinence. Chaque fiche renvoie à l'original.
- **Équations** : survolez un symbole pour voir sa signification. Changez les valeurs et regardez le résultat.
- **Laboratoire** : lancez des calculs en Rust, en Python ou avec vos propres formules.
- **Rechercher** : cherchez dans toute la bibliothèque à la fois.

### 3.2 Application de bureau

1. Téléchargez la dernière version sur [GitHub Releases](https://github.com/pablonolascoo/curvatura/releases/latest).
2. Installez-la comme toute autre application (`.dmg` sur macOS, `.msi` ou `.exe` sur Windows, `.AppImage` ou `.deb` sur Linux).
3. Ouvrez-la. La première fois, elle installe Python 3.12 avec numpy, sympy, scipy et matplotlib. Le Python de votre système n'est pas modifié.
4. Les mises à jour arrivent seules. L'application vérifie toutes les 6 heures et demande avant de redémarrer.

Les liens externes s'ouvrent dans votre navigateur par défaut.

### 3.3 Évaluer des articles

1. Allez dans **Compte** et cliquez sur **Se connecter avec ORCID**. ORCID confirme que vous êtes une vraie personne avec une identité de chercheur.
2. Vous pouvez alors donner de 1 à 5 étoiles à n'importe quel article.
3. Pour la **mention d'honneur**, demandez la vérification dans **Compte** : type de diplôme ou de poste, établissement, année et domaine.
4. Si votre ORCID contient déjà ce diplôme validé par l'établissement, la demande est approuvée automatiquement.
5. Sinon, envoyez un document (PDF, PNG ou JPG, 5 Mo maximum). Une personne le vérifie et le document est supprimé ensuite.

### 3.4 La bibliothèque sur votre machine (RAG)

```bash
python3 -I library/rag/query.py "positive energy shell"   # recherche avec citations
```

Pour que Claude interroge directement la bibliothèque, copiez `.mcp.json.example` vers `.mcp.json`.

## 4. Comment l'installer pour développer

Prérequis : [Bun](https://bun.sh) 1.3 ou plus, [uv](https://docs.astral.sh/uv/), [Rust](https://rustup.rs) avec `wasm32-unknown-unknown` et un compilateur C++20.

```bash
git clone https://github.com/pablonolascoo/curvatura.git
cd curvatura
bun install
bun run dev            # site sur http://localhost:3000
bun run test           # formules + Python + Rust + C++
bun run desktop        # application de bureau en mode développement
```

### Carte du dépôt

| Dossier | Contenu | Langage |
|---|---|---|
| [`library/papers/`](library/papers/) | Fiches d'articles : données, résumé, traductions et texte intégral si la licence le permet. | YAML, Markdown |
| [`library/equations/`](library/equations/) | Équations clés en format machine. | YAML |
| [`library/rag/`](library/rag/) | Index RAG avec citations exactes et serveur MCP. | Python |
| [`docs/`](docs/) | Sous-systèmes du moteur et synthèse des obstacles. | Markdown |
| [`physics/`](physics/) | Tenseur d'Einstein, conditions d'énergie, budgets. | Python |
| [`solvers/rust/`](solvers/rust/) | Noyau numérique : natif pour l'application et WebAssembly pour le web. | Rust |
| [`solvers/cpp/`](solvers/cpp/), [`solvers/matlab/`](solvers/matlab/) | Implémentations indépendantes pour la validation croisée. | C++20, MATLAB |
| [`packages/formula/`](packages/formula/) | Notre moteur de formules : analyseur, dérivées, intégrales, MathML. | TypeScript |
| [`apps/web/`](apps/web/) | Site statique et API des évaluations (Cloudflare Worker + D1). | Next.js |
| [`apps/desktop/`](apps/desktop/) | Application de bureau. | Tauri (Rust) |
| [`benchmarks/`](benchmarks/) | Même calcul en C++, Rust, Go et Python. | Plusieurs |

## 5. Méthode de travail

### 5.1 Chaque modification

1. Mettez la branche à jour : `git fetch origin && git pull --ff-only`.
2. Faites la modification et lancez les tests : `bun run test`.
3. Si vous modifiez des textes du site, modifiez les trois dictionnaires (`es`, `en`, `fr`).
4. Si vous modifiez le README, modifiez **les quatre** (`README.md`, `README.en.md`, `README.fr.md`, `README.zh.md`) et lancez `bun run readme:check`.
5. Notez la modification dans `CHANGELOG.md`.
6. Commit et push ensemble.

### 5.2 Enrichir la bibliothèque

```bash
bun run library:harvest                                   # arXiv + OpenAlex, les plus récents d'abord
python3 -I library/tools/verify.py --write                # titre et licence vérifiés sur arXiv
python3 -I library/tools/relevance.py                     # haute, moyenne, basse
python3 -I library/tools/enrich.py countries              # pays des auteurs
python3 -I library/tools/extract.py <id>                  # résumé et source si la licence le permet
bun run library:index                                     # reconstruit l'index RAG
```

### 5.3 Publier une version

```bash
bun run deploy          # monte la version, date le CHANGELOG, compile et publie le site
git push --tags         # l'étiquette vX.Y.Z construit les applications macOS, Windows et Linux
```

Détails dans [`docs/PUBLICAR.md`](docs/PUBLICAR.md).

## 6. Licence et citation

- Code : [PolyForm Noncommercial 1.0.0](LICENSE). Libre pour la recherche, l'enseignement et l'étude, avec attribution à Pablo Nolasco.
- Contenus : [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).
- Usage commercial, industriel ou de brevet : autorisation écrite de l'auteur requise.
- Les articles de tiers gardent leur licence. Texte intégral uniquement sous CC BY, CC BY-SA ou CC0.

Citez le projet avec [`CITATION.cff`](CITATION.cff).

© 2026 Pablo Nolasco
