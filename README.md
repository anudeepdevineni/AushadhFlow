# AushadhFlow

**Drug stockout forecasting & redistribution for rural health centres — District health dashboard.**

AushadhFlow helps a district health officer see, days in advance, which Primary/Community Health Centres (PHCs/CHCs) are about to run out of a critical drug — and proposes a redistribution transfer from a nearby centre holding **surplus stock that is about to expire**. One move prevents a stockout *and* prevents medicine waste.

> Built for the **"Build with AI — Code for Community"** theme. Data is **synthetic** (a simulated rural Telangana district) and generated deterministically, so the demo is identical on every run — no real patient data is involved.

---

## The core idea (the "magic moment")

1. An alert fires: **"PHC Narapally will stock out of Insulin in 3 days."**
2. You click it.
3. The app proposes: **"Transfer 104 units from CHC Medipally (3.1 km away) — that stock expires in 30 days and would otherwise be wasted"** — and draws the route on the map.

That **dual payoff** — averting a stockout while rescuing expiring stock — is the whole point, and it's surfaced on every suggestion.

---

## Features

- **Stockout forecasting** — projects days-to-stockout per centre/drug from recent consumption, ranked most-urgent-first, colour-coded by severity.
- **Smart transfer matching** — for a selected alert, finds the best donor centre balancing coverage, expiry, and distance, with a plain-English rationale and a match score.
- **Interactive map** — Leaflet map of all centres (needs-stock / source / healthy), with the suggested transfer route drawn between source and destination.
- **Waste-prevented metric** — headline ₹ value of expiring stock rescued by the suggested transfers.
- **What-if control** — nudge a centre's daily consumption and watch its days-to-stockout update live.
- **Consumption sparkline** — 30-day demand trend per drug.

---

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v3** for styling
- **react-leaflet / Leaflet** for the map (OpenStreetMap tiles — no API key)
- **Recharts** for the sparkline
- 100% client-side — no backend, no database, no auth. All data is synthetic and in-memory.

---

## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically <http://localhost:5173>).

### Other scripts

```bash
npm run build     # type-check (tsc) + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

---

## Project structure

```
src/
├─ App.tsx                 # dashboard layout + state (selection, metrics)
├─ engines/                # pure, framework-free domain logic
│  ├─ syntheticData.ts     #   deterministic centres + drug stock (fixed seed)
│  ├─ forecastEngine.ts    #   getAlerts() — days-to-stockout + severity
│  └─ matchingEngine.ts    #   findBestTransfer() — donor scoring + reasoning
├─ components/
│  ├─ AlertPanel.tsx       # ranked stockout alerts (click to select)
│  ├─ TransferCard.tsx     # suggested transfer + dual-payoff banner
│  ├─ MapView.tsx          # Leaflet map + route polyline
│  ├─ WhatIfControl.tsx    # live demand slider
│  ├─ DrugSparkline.tsx    # 30-day consumption chart
│  └─ icons.tsx            # inline SVG icons (no icon dependency)
└─ lib/util.ts             # UI helpers (formatting, illustrative pricing)
```

The three files in `src/engines/` hold all the forecasting and matching logic; the UI only imports from them.

---

## Notes

- **Deterministic data:** the synthetic dataset uses a fixed random seed, so alerts and suggestions are the same on every load — handy for demos.
- The transfer route on the map is drawn as a straight line between centres (illustrative, not a road route).
- ₹ pricing is illustrative (for the waste-prevented headline), not a real price feed.
