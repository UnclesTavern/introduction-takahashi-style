# Introduction Takahashi Style — Erick Segaar (aka UncleBats)

A minimalist, high‑impact personal introduction built with the Takahashi Method: oversized words, ruthless brevity, zero decorative images. Markdown in, dramatic slides out.

> [!NOTE]
> Slide parsing is powered by the original parser from **[`kuanyui/takahashi.js`](https://github.com/kuanyui/takahashi.js)**. Full credit to the author (ono hiroko / kuanyui). This project focuses on content and workflow around that parser.

## Overview
This repository hosts my Takahashi‑style intro: who I am, what drives me, and how I build. Each slide is just a few emphatic words. The absence of imagery keeps focus on the spoken story.

## Why Takahashi Style
- Forces clarity
- Amplifies pacing
- Keeps audience attention on the speaker
- Encourages iterative refinement

> [!IMPORTANT]
> Slides stay effective when each idea fits in a handful of words. Resist the urge to shrink font sizes to cram more.

## Project Structure
```
index.html          # Entry point, loads highlight.js + Takahashi renderer
src/takahashi.js    # Parser & slide rendering logic (moved from root)
slides/source.md    # Primary slide deck markdown
styles/main.css     # Extracted presentation styles
.vscode/            # Debug & task configurations
```

## Content Format
Slides are authored in a Markdown file (now `slides/source.md`) using a constrained subset:
- `# Title` (primary slide text)
- `- Subtitle` (optional secondary line)
- Blank line separates slides
- Code blocks: triple backticks with language
- Images intentionally avoided here (philosophical choice for this intro)

Example (conceptual — not the full intro):
```md
# Erick
- Builder

# Systems
- Over Hype

# Shipping
- > Talking

# Craft
- Empathy

``` 

> [!TIP]
> Keep a rhythmic flow: group related slides, alternate emphasis (e.g. identity, values, approach), and insert breathing (short single‑word slides) to reset attention.

## Quick Start
1. Edit `slides/source.md` with Takahashi‑style content.
2. Launch the existing VS Code debug config `Chrome: Takahashi Slides` (starts server + opens browser).
3. Refresh the browser after edits (no live reload enabled by choice).
4. Rehearse out loud; trim wording until rhythm feels natural.

## Deployment
### GitHub Pages via Actions
The site is deployed automatically to **GitHub Pages** using the workflow at `/.github/workflows/pages.yml`.

Current configuration:
- Trigger: push to `repository-setup` (will switch to `main` after branch rename)
- Artifact: entire repository root (static only, no build step yet)
- Actions used: `actions/checkout@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`

### Enable Pages (one-time)
1. Go to: Repository Settings → Pages.
2. Set Source: GitHub Actions.
3. Save. After next successful workflow run the URL appears (and is surfaced in the workflow summary as `page_url`).

### Customize (optional)
- Branch rename: After creating a `main` branch, update `branches` in `pages.yml`.
- Build step: Insert before the upload step if you add tooling (e.g. bundling, minification).
- Exclude files: Create a staging build directory and point `upload-pages-artifact` `path:` to that directory instead of `.`.
- Custom domain: Add `CNAME` file at repo root with domain name, then configure DNS + Pages custom domain settings.

### Manual Trigger
You can dispatch the workflow manually under the Actions tab (`workflow_dispatch`) to force a redeploy even without changes.

### Future Enhancements
- Cache build output once a build pipeline is introduced.
- Accessibility & performance audit (Lighthouse) in a pre-deploy job.
- Simple link validation for any future outbound references.

> [!TIP]
> Keep it static unless complexity adds real storytelling value. Simplicity = reliability + zero build latency.

## Roadmap
- [x] Add GitHub Pages workflow
- [ ] Optional: lightweight theming (font & color tweaks only)

## Author
**Erick Segaar** "UncleBats". 

## Available Markdown Syntax
The parser of `Takahashi.js` accepts a Markdown-like syntax:

- `# This is Title : Only one level title is accepted. Don't forget add a space after #.`
- `-` This is subtitle : placed under title.
- `# ![](path/to/image.jpg)` : Fullscreen image
- `![](path/to/image.jpg)` : Image + Title (+ Subtitle)
- `\\` : A new line.
- `*italic*`
- `**colored emphasis**`
- `+striked+` : this syntax is inspired by Org-mode.
- ```lisp` : The same as Github-flavored Markdown -- code block with syntax highlight. 

## Attribution & Credits
> [!NOTE]
> Core parsing logic: [`kuanyui/takahashi.js`](https://github.com/kuanyui/takahashi.js) (MIT). Without that project, this minimalist intro workflow would be far more complex.

