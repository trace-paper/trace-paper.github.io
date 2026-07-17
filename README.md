# TRACE — project page

A static, GitHub-hostable academic project page for **TRACE: Interactive Bi-Directional
Cable Tracing Amid Clutter** (Newsreader + DM Sans, OKLch tokens, centered single column).
The visual system is documented in the repo-root `PRODUCT.md` / `DESIGN.md` ("The Lab Notebook").

The page opens with an **auto-looping hero** (the real robot run playing on load) and a
**one-line result hook**, then flows problem → method → results. Motion is *entrance-only*:
a single orchestrated hero reveal on load, then static.

No build step or framework — just `index.html`, `styles.css`, `script.js`, and `media/`.
One CDN dependency, [Motion One](https://motion.dev/), is loaded as an ES module purely to
choreograph the hero reveal; it is progressive enhancement (if it fails to load, a head-script
safety timeout reveals the hero anyway, and every widget keeps working).

## Interactive elements

Each of the paper's headline contributions is demonstrated with a small vanilla-JS widget:

| Section | Interaction | Real assets used |
|---|---|---|
| Hero | The 8-iteration robot run auto-loops on load (pauses off-screen and under reduced-motion → resolved still) | `media/run/iter_0–7` |
| Result hook | Static one-line headline result with inline serif numerals | numbers from the paper |
| The Problem | Toggle raw monochrome scene ↔ recovered traces | `endpoints_detected`, `final_traces` |
| Core Idea | 3-step reveal of bi-directional traces → divergence points | `divergence.png` |
| The Moves | Density toggle picks Divergence Push vs Cluster Dilation; hover to play the motion | `div_push`, `cluster_dilation` |
| Watch It Work | Play / scrub the same robot run with logged action captions | `media/run/iter_0–7` + `metrics.txt` |
| Results | Toggle with/without clutter; animated TRACE-vs-HANDLOOM bars + comparison table | numbers from `figures/plot_results.py` |
| Geometry vs. VLMs | Side-by-side monochrome input vs VLM hallucination + score badges | `vlm_compare` |

## Preview locally

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish to GitHub Pages

1. `git init` the repo (it is not currently a git repo) and push to GitHub.
2. Repo **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.

## Still placeholder (fill in later)

- **Author names + links** (`index.html` header) — the PDF is anonymized; only the
  AUTOLab/BAIR affiliation is recoverable.
- **Action links** — Paper PDF and Code hrefs are `#`. Project Page points at
  `https://trace-paper.github.io/`.
- **BibTeX** authors/venue details.

All result numbers, captions, and media are real (sourced from the paper and the repo's
`figures/`, `video/`, and `video/real_video/` assets).
