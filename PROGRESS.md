# AushadhFlow — Progress

Hand-off log between tools. Update after each tier.

## Done
- **Setup** — Tailwind wired, Leaflet CSS imported in `src/main.tsx`, `src/engines/` folder created, PROGRESS.md created.
- **Tier 1 — THE DEMO** — `src/App.tsx` calls `generateStocks()` once, derives `getAlerts()`, holds selection in state.
  - `src/components/AlertPanel.tsx` — alert list, critical=red / warning=amber, most-urgent first, "Nd left", click to select.
  - `src/components/TransferCard.tsx` — on select, renders `findBestTransfer()` result: units, from→to, distance, source expiry, full reasoning, "Prevents waste" badge.
- **Tier 2 — Map** — `src/components/MapView.tsx`: Leaflet + OSM tiles, every centre a CircleMarker (deficit=red, source=blue, healthy=green), dashed polyline route on selection.
- **Tier 3 — Extras** — headline metrics row (active/critical/waste-prevented ₹/units saved) in App; `WhatIfControl.tsx` (demand slider re-runs `daysToStockout`); `DrugSparkline.tsx` (recharts, 30-day consumption).
- `src/lib/util.ts` — UI helpers only: `alertKey`, illustrative `pricePerUnit` (synthetic ₹, NOT an engine), `inr` formatter.

## Verified in browser
- **Tier 1 — PASSED** (user confirmed). Alerts show PHC Narapally/Insulin/3d and
  PHC Ghatkesar/ORS/5d, most-urgent first; transfer card renders 104 units CHC Medipally
  → Narapally, 3.1 km, expires 30 d, prevents-waste badge + reasoning. Metrics: ₹4,680 waste.
- **Tier 2 — PASSED** (user confirmed). Map shows 10 centres (deficit red / source blue /
  healthy green), dashed route source→dest, redraws on alert change, hover tooltips work.
  Note: route is a static straight polyline (by design).

- **Tier 3 — BUILT + polished.** What-if slider now uses trend-adjusted rate (baseline
  matches alert = 3d), neutral-grey delta chip when unchanged (fixes "green at 105%"),
  gradient-area sparkline. Awaiting final user confirm.
- **Polish pass — DONE (design + animations).** New: sticky blurred header w/ brand mark,
  gradient bg, icon metric cards w/ hover-lift, redesigned alert rows (severity bars, blinking
  critical dots), transfer card w/ from→to flow + travelling highlight + match-score pill +
  waste banner, map pulse halos on deficit centres + animated flowing route + white-ringed
  dots + legend overlay. All motion respects prefers-reduced-motion.
  - New files: `src/components/icons.tsx` (inline SVG, no dep); keyframes in `src/index.css`.
  - Build passes (tsc + vite).

- **Tier 3 — PASSED** (confirmed via browser screenshots: what-if baseline 3d + neutral
  "no change" chip working, gradient sparkline rendering, waste metrics live).
- **DEMO COMPLETE** — all tiers built + verified, redesign approved, build clean.

## Optional / not done (none block the demo)
- Not committed to git yet this session.
- No "reset / replay magic moment" button.
- No DEMO.md cue-card saved.
- Amber "warning" state never triggers (both synthetic alerts are critical) — cosmetic only.
- ₹ pricing in lib/util.ts is illustrative, not from engines.

## Gotchas
- Do NOT write/edit/regenerate anything in `src/engines/` — import only. Seed fixed at 42.
- Map uses `CircleMarker` (not default pin `Marker`) on purpose — avoids the broken
  marker-icon-URL bug that Leaflet has under Vite bundling.
- Vite dev does NOT typecheck (only `npm run build` runs `tsc`), so the demo runs even if a
  minor TS nit exists. If `npm run build` complains about recharts Tooltip formatter types,
  it won't affect `npm run dev`.
- If the map throws "Map container is already initialized" under React StrictMode, tell me —
  fix is to relax StrictMode or key the MapContainer; hasn't been an issue in react-leaflet v5 so far.
- Old `src/App.css` is now unused (no longer imported); safe to ignore or delete.
- Alert `daysToStockout` is rounded for display; engine values drive all logic.
