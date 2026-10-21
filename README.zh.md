# Curvatura

[Español](README.md) · [English](README.en.md) · [Français](README.fr.md) · **中文**

一个开放的研究计划，目标是把广义相对论中的曲速引擎推向工程实践。

网站：<https://curvatura.consultora-bim.workers.dev> · 当前版本：见 [`version.json`](version.json) 和 [`CHANGELOG.md`](CHANGELOG.md)。

---

## 1. 这是什么

Curvatura 把三件事放在一起：

1. **文献库**：关于曲速引擎、虫洞、负能量及相关主题的论文，已分类并翻译。
2. **计算工具**：在网页、桌面应用和代码（Python、Rust、C++、MATLAB）中亲自验证方程。
3. **工作计划**：说明今天是什么阻碍了建造有用的引擎，以及如何解决。

## 2. 已完成的内容

| 部分 | 状态 |
|---|---|
| 文献库 | 3362 篇论文，来自 arXiv、OpenAlex 和中文来源。所有标题均已翻译（es、en、fr）。2109 篇有翻译的摘要。2645 篇标注了作者国家。 |
| 动态方程 | 20 个关键方程，带动画，每个符号都有解释，可实时计算。 |
| 实验室 | 浏览器中运行 Rust 核心（WebAssembly）、Python（Pyodide）和自研公式引擎。 |
| 桌面应用 | macOS、Windows 和 Linux，版本始终一致。自动更新，内置原生 Python。 |
| 搜索与 RAG | 10205 个片段已建索引，引用精确。提供给 Claude 的 MCP 服务器。 |
| 评分 | 1 到 5 星，使用 ORCID 身份。经过验证的学位持有者和从业者可给出荣誉推荐。 |
| 计划 | 阶段与验收标准见 [`ROADMAP.md`](ROADMAP.md)。障碍分析见 [`docs/obstaculos.md`](docs/obstaculos.md)。 |

标题和摘要的翻译由 AI 完成，可能有错误。网站在每篇论文上都有说明。

## 3. 如何使用

### 3.1 网页

打开 <https://curvatura.consultora-bim.workers.dev>，无需安装。

- **文献库**：按子系统、类型、国家、年份或相关性筛选。每条记录都链接到原文。
- **方程**：鼠标悬停在符号上查看含义。修改数值并查看结果。
- **实验室**：用 Rust、Python 或自定义公式进行计算。
- **搜索**：一次搜索整个文献库。

### 3.2 桌面应用

1. 在 [GitHub Releases](https://github.com/pablonolascoo/curvatura/releases/latest) 下载最新版本。
2. 像其他应用一样安装（macOS 用 `.dmg`，Windows 用 `.msi` 或 `.exe`，Linux 用 `.AppImage` 或 `.deb`）。
3. 打开应用。首次运行会安装 Python 3.12 及 numpy、sympy、scipy 和 matplotlib，不会改动系统自带的 Python。
4. 更新自动到达。应用每 6 小时检查一次，重启前会先询问。

外部链接会在默认浏览器中打开。

### 3.3 为论文评分

1. 进入 **账户**，点击 **使用 ORCID 登录**。ORCID 确认你是拥有研究者身份的真实个人。
2. 之后即可为任何论文打 1 到 5 星。
3. 如需 **荣誉推荐** 资格，请在 **账户** 中申请验证：学位或职位类型、机构、年份和领域。
4. 如果你的 ORCID 中已有经机构验证的该学位，将自动通过。
5. 否则请上传文件（PDF、PNG 或 JPG，最大 5 MB）。由人工审核，审核后文件即被删除。

### 3.4 在本机使用文献库（RAG）

```bash
python3 -I library/rag/query.py "positive energy shell"   # 带引用的搜索
```

如需让 Claude 直接查询文献库，请把 `.mcp.json.example` 复制为 `.mcp.json`。

## 4. 开发环境安装

要求：[Bun](https://bun.sh) 1.3 或更高版本、[uv](https://docs.astral.sh/uv/)、带 `wasm32-unknown-unknown` 的 [Rust](https://rustup.rs)，以及 C++20 编译器。

```bash
git clone https://github.com/pablonolascoo/curvatura.git
cd curvatura
bun install
bun run dev            # 网站地址 http://localhost:3000
bun run test           # 公式 + Python + Rust + C++
bun run desktop        # 开发模式下的桌面应用
```

### 仓库结构

| 文件夹 | 内容 | 语言 |
|---|---|---|
| [`library/papers/`](library/papers/) | 论文条目：元数据、摘要、翻译，许可允许时包含全文。 | YAML, Markdown |
| [`library/equations/`](library/equations/) | 机器可读格式的关键方程。 | YAML |
| [`library/rag/`](library/rag/) | 带精确引用的 RAG 索引和 MCP 服务器。 | Python |
| [`docs/`](docs/) | 引擎子系统与障碍综述。 | Markdown |
| [`physics/`](physics/) | 爱因斯坦张量、能量条件、能量预算。 | Python |
| [`solvers/rust/`](solvers/rust/) | 数值核心：应用中为原生，网页中为 WebAssembly。 | Rust |
| [`solvers/cpp/`](solvers/cpp/), [`solvers/matlab/`](solvers/matlab/) | 用于交叉验证的独立实现。 | C++20, MATLAB |
| [`packages/formula/`](packages/formula/) | 自研公式引擎：解析、求导、积分、MathML。 | TypeScript |
| [`apps/web/`](apps/web/) | 静态网站和评分 API（Cloudflare Worker + D1）。 | Next.js |
| [`apps/desktop/`](apps/desktop/) | 桌面应用。 | Tauri (Rust) |
| [`benchmarks/`](benchmarks/) | 用 C++、Rust、Go 和 Python 实现的同一计算。 | 多种 |

## 5. 工作流程

### 5.1 每次修改

1. 更新分支：`git fetch origin && git pull --ff-only`。
2. 修改并运行测试：`bun run test`。
3. 如果修改网站文字，三个字典（`es`、`en`、`fr`）要一起改。
4. 如果修改 README，**四个都要改**（`README.md`、`README.en.md`、`README.fr.md`、`README.zh.md`），并运行 `bun run readme:check`。
5. 在 `CHANGELOG.md` 中记录修改。
6. 提交和推送一起完成。

### 5.2 扩充文献库

```bash
bun run library:harvest                                   # arXiv + OpenAlex，最新优先
python3 -I library/tools/verify.py --write                # 对照 arXiv 核对标题和许可
python3 -I library/tools/relevance.py                     # 高、中、低
python3 -I library/tools/enrich.py countries              # 作者国家
python3 -I library/tools/extract.py <id>                  # 许可允许时提取摘要和源文件
bun run library:index                                     # 重建 RAG 索引
```

### 5.3 发布版本

```bash
bun run deploy          # 升级版本号、标注 CHANGELOG 日期、构建并发布网站
git push --tags         # vX.Y.Z 标签会构建 macOS、Windows 和 Linux 应用
```

详情见 [`docs/PUBLICAR.md`](docs/PUBLICAR.md)。

## 6. 许可与引用

- 代码：[PolyForm Noncommercial 1.0.0](LICENSE)。可自由用于研究、教学和学习，须署名 Pablo Nolasco。
- 内容：[CC BY-NC-SA 4.0](LICENSE-CONTENT.md)。
- 商业、工业或专利用途：须获得作者书面许可。
- 第三方论文保留各自的许可。仅在 CC BY、CC BY-SA 或 CC0 下提供全文。

引用本项目请使用 [`CITATION.cff`](CITATION.cff)。

© 2026 Pablo Nolasco
