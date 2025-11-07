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

## Content Format
Slides are authored in a Markdown file (e.g. `source.md`) using a constrained subset:
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
1. Add or edit `source.md` with Takahashi‑style content.
2. Ensure the parser script (from upstream) is referenced in your static HTML (e.g. `slide.html`).
3. Open the HTML file locally in a modern browser to preview.
4. Adjust wording until pacing feels natural when spoken aloud.

## Deployment
A GitHub Actions workflow (to be added) will publish the static site to GitHub Pages:
- Trigger: push to `main`
- Steps: checkout → (optionally copy/update `source.md`) → upload artifact → deploy to Pages

When present, visit the repository’s Pages URL to view the live intro.

> [!NOTE]
> If you haven’t added the workflow yet, create `.github/workflows/pages.yml` with a basic Pages deploy job later. This README intentionally omits the YAML for brevity.

## Roadmap
- [ ] Add initial `source.md` content
- [ ] Add GitHub Pages workflow
- [ ] Optional: lightweight theming (font & color tweaks only)
- [ ] Rehearsal notes / speaker timing guide

## Author
**Erick Segaar** "UncleBats". This intro is a distilled lens into how I approach engineering and communication.

## Attribution & Credits
> [!NOTE]
> Core parsing logic: [`kuanyui/takahashi.js`](https://github.com/kuanyui/takahashi.js) (MIT). Without that project, this minimalist intro workflow would be far more complex.

## Feedback
Feel free to open an issue with suggestions on pacing, wording density, or slide ordering. Tight feedback loops sharpen the message.
