# Place XAI — Lab Homepage

Static homepage for the **Place XAI** lab (Place-Based Explainable AI), served via GitHub Pages at **www.place-x.ai**.

## Features
- **Dark / light mode** — CSS-variable design system, respects system preference, persists choice (`localStorage`).
- **Animated hero globe** — `globe.js`, a p5.js fiber-optic globe: a rotating sphere of nodes wrapped in glowing great-circle arcs with traveling light pulses. Theme-aware, with subtle pointer parallax/inertia.
- **Mega-menu navigation** — Insights · PlaceXAI · Products · Network, each with grouped sub-links; collapses to a mobile drawer.
- Scroll-reveal animations, responsive down to mobile, reduced-motion friendly.

## Structure
```
index.html     markup + content
styles.css     design system (themes, layout, components)
globe.js       p5.js animated hero globe
main.js        theme toggle, nav, mobile drawer, scroll reveal
CNAME          custom domain (www.place-x.ai)
.nojekyll      serve files as-is (skip Jekyll)
```

## Local preview
Any static server from the repo root, e.g.:
```
python -m http.server 4178
```
then open http://localhost:4178

## Deploy
Push to `main`. In repo **Settings → Pages**, set source to `main` / root.
DNS: point `www.place-x.ai` (CNAME) → `place-xai.github.io`; keep the apex `place-x.ai`
on GitHub Pages A/AAAA records if used.

## Editing content
All copy lives in `index.html`. Brand colors and the light/dark palettes are the
`--brand*` and `[data-theme]` variables at the top of `styles.css`.
