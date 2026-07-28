# HANDOFF — place-x.ai (Place XAI lab site)

_Last updated: 2026-07-28_

Static site served via GitHub Pages at **www.place-x.ai** (`CNAME`, `.nojekyll`). Every page is a
plain HTML file that loads `styles.css` (design system + light/dark themes) and, at the end of
`<body>`, `layout.js` (injects the shared fixed header + footer from a single `NAV` array) and
`main.js` (theme toggle, dropdowns, mobile drawer, scroll-reveal). To add a page, copy an existing
page's `<head>` + the two trailing scripts and put your content in `<main>`.

Design tokens (in `styles.css` `:root`): `--brand #4f7cff`, `--surface`, `--border`,
`--text/-soft/-muted`, `--shadow`, `--radius`, fonts Inter (body) + Space Grotesk (display).
The header is `position: fixed` (~71px) — pages clear it with top padding (`.page-hero` uses
150px; the pattern detail page uses `.pd-wrap{padding-top:98px}`). `scroll-padding-top:90px`
handles anchor jumps.

## Pattern Language pages (added 2026-07)

The lab's "A Pattern Language, visualized" study — all 253 patterns from Christopher Alexander's
book, each illustrated by generative AI. Built in the sibling repo `PlaceXAI` and published here.

| File | What it is |
|---|---|
| `pattern-language.html` | **Gallery.** 253 thumbnails in 3 sections — Towns (1–94), Buildings (95–204), Construction (205–253). Jump chips in the hero. Each card links to `pattern.html#N`. Page-local `<style>` for `.pl-grid` / `.pl-card`. |
| `pattern.html` | **Detail view.** One pattern per screen: full-bleed image + English summary + Key figures + References. Navigate with ←/→ keys, touch swipe, the top-bar ‹ › buttons, the number input, or `#N` deep-links (`pattern.html#42`). Loads `pattern-data.json` via `fetch` (so it needs HTTP, not `file://`). |
| `pattern-data.json` | Array of 253 `{n, title, group, summary_en, numbers_en[{v,k}], references[]}`. ~263 KB. **Generated** — do not hand-edit. |
| `image/patterns/pNNN.jpg` | 253 final illustrations, ~1080p JPEG, 100–170 KB each (~36 MB total). |

Linked from `courses.html` (a "Visual Study" card) and the site nav + footer (`layout.js`, under the
**PlaceXAI** group).

### How to regenerate content (source lives in the `PlaceXAI` repo)

All source + data are in `PlaceXAI/Pattern Language/`:
- **Images** → `image/patterns/pNNN.jpg`: PIL loop over `illustrations/patterns_data.json` `img_final`,
  resize to maxw 1600, JPEG quality auto-tuned to ≤170 KB.
- **`pattern-data.json`**: `paper/translate_patterns.py` does a one-way **CN→EN** (Doubao) of our OWN
  Chinese summaries/numbers → `paper/data/patterns_site.json`; a small dump step writes the sorted
  array here. Pattern **names** are the authoritative English titles (not translated). References are
  the original English citations (Chinese editorial gloss after "——" stripped). **Alexander's book
  prose is never reproduced** — only our own analysis (translated) and the canonical pattern names.

### Editing notes

- To reorder/restyle the detail page, edit `pattern.html`'s page-local `<style>` and the `render()`
  template. Current layout (top→bottom): sticky nav bar → title + full-width summary →
  `Key figures | References` two-column → **full-viewport-width image** → prev/next.
- Local preview needs a server (fetch of `pattern-data.json`): `python3 -m http.server` in the repo
  root, then open `http://localhost:8000/pattern.html#1`.
- If you add patterns or change summaries, regenerate `pattern-data.json` and the images; keep `#N`
  stable (deep-links and gallery cards depend on the pattern number).
