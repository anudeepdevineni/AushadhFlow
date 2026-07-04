# AushadhFlow — Project Context

Read this fully before doing anything. Hackathon project, demo due 8 AM.
Do the setup steps, then STOP and let me test before building features.
We build ONE TIER AT A TIME and I verify each in the browser before the next.

## What we're building
A district health dashboard that forecasts drug stockouts at rural health
centres (PHCs = Primary Health Centres, CHCs = Community Health Centres) and
auto-suggests redistribution transfers from centres holding expiring surplus
stock, drawing the transfer route on a map.
Theme: "Build with AI — Code for Community." Data is synthetic (a rural
Telangana district). Frame it as a decision-support tool for a district
health officer.

## The ONE magic moment (everything serves this)
An alert fires: "PHC Narapally will stock out of Insulin in 3 days" -> user
clicks it -> the app proposes "Transfer 104 units from CHC Medipally
(3.1 km away), stock expiring in 30 days" and draws the route on the map.
One move prevents a stockout AND prevents medicine waste. This dual payoff
is the whole point — surface both, always.

## Tech stack (do not deviate)
- React + Vite + TypeScript (already scaffolded)
- Tailwind v3 (installed, needs wiring)
- react-leaflet + leaflet for the map (installed, no API key needed)
- recharts for charts (installed)
- ALL logic runs client-side. NO backend, NO database, NO auth.
- Synthetic in-memory data, PRNG seed fixed at 42 so the demo is identical
  every run. Do not change the seed.

## Engine files — I WILL ADD THESE. DO NOT WRITE, EDIT, OR REGENERATE THEM.
Three tested files live in src/engines/. Import from them only. If something
seems missing, ask me — do not rewrite these.

### src/engines/syntheticData.ts
Types and exports:
- type CentreType = "PHC" | "CHC"
- interface Centre { id: string; name: string; type: CentreType; lat: number; lng: number }
- interface DrugStock { centreId: string; drugName: string; currentUnits: number;
    dailyConsumptionAvg: number; consumptionHistory: number[]; // last 30 days
    batchExpiryDate: string; // ISO date; reorderLevel: number }
- const CENTRES: Centre[]   // 10 centres (7 PHC, 3 CHC), real-ish lat/lng
- const DRUGS: string[]     // 8 drugs incl. Insulin, ORS, Paracetamol, etc.
- function generateStocks(): DrugStock[]  // call ONCE; deterministic

### src/engines/forecastEngine.ts
- interface StockoutAlert { centreId: string; drugName: string;
    currentUnits: number; dailyConsumptionAvg: number; daysToStockout: number;
    severity: "critical" | "warning" }
- function getAlerts(stocks: DrugStock[]): StockoutAlert[]  // sorted most-urgent first
- helpers also exported (may reuse): daysToStockout(stock), trendAdjustedDailyRate(stock)

### src/engines/matchingEngine.ts
- interface TransferSuggestion { fromCentreId: string; fromCentreName: string;
    toCentreId: string; toCentreName: string; drugName: string;
    transferUnits: number; distanceKm: number; sourceExpiresInDays: number;
    preventsWaste: boolean; reasoning: string; score: number }
- function findBestTransfer(alert: StockoutAlert, stocks: DrugStock[],
    centres: Centre[]): TransferSuggestion | null
- helper also exported (REUSE for the map, don't rewrite): distanceKm(a: Centre, b: Centre)

### Wiring reference
  import { generateStocks, CENTRES } from "./engines/syntheticData";
  import { getAlerts } from "./engines/forecastEngine";
  import { findBestTransfer } from "./engines/matchingEngine";

  const stocks = generateStocks();      // call ONCE, hold in React state
  const alerts = getAlerts(stocks);     // -> render alert panel
  const t = findBestTransfer(alerts[0], stocks, CENTRES); // on alert click
  // t.reasoning is a ready-to-display sentence.
  // For the map route: find source/dest in CENTRES by t.fromCentreId /
  // t.toCentreId and draw a polyline between their [lat, lng].

### Known demo values (must appear when it works)
- Alert 1: PHC-7 (PHC Narapally) — Insulin — 3 days — critical
- Alert 2: PHC-3 (PHC Ghatkesar) — ORS — 5 days — critical
- Top transfer for Alert 1: from CHC Medipally, 104 units, 3.1 km,
  expires in 30 days, preventsWaste = true

## Setup steps to do NOW, then STOP
1. Wire Tailwind: set tailwind.config.js `content` to
   ["./index.html","./src/**/*.{js,ts,jsx,tsx}"]; replace src/index.css with
   the three @tailwind directives (base, components, utilities) only.
2. Add `import "leaflet/dist/leaflet.css";` near the top of src/main.tsx.
3. Ensure src/engines/ exists (I will drop the 3 files in).
4. Create PROGRESS.md (sections: Done / In progress / Next / Gotchas) and keep
   it updated after each tier — it's how we hand off between tools cleanly.
5. Do NOT touch src/engines/ contents. Do NOT build any UI yet.
Then tell me to (a) add the engine files and (b) run `npm run dev`, and WAIT
for me to confirm the page loads.

## Build plan — ONE TIER AT A TIME, I test each before the next
### Tier 1 — THE DEMO (build first, protect at all costs)
Replace App with a dashboard that:
- calls generateStocks() once on mount, holds stocks + alerts in state
- renders an alert panel from getAlerts(): critical = red, warning = amber,
  most urgent first, each row showing centre name, drug, and "Nd left"
- on alert click, calls findBestTransfer() and shows a transfer card with:
  transferUnits, fromCentreName, distanceKm, sourceExpiresInDays, and the
  full reasoning string; if preventsWaste, highlight the waste-prevention.
- NO map yet. Clean Tailwind. This tier alone = a complete demo.

### Tier 2 — Visual (the wow layer)
- Leaflet map centered on the district, every CENTRE as a pin
- deficit centres (those with an alert) red, others green
- when a transfer is selected, draw a polyline from source to destination
- surface the expiry ("expiring in 30 days") prominently on card/route

### Tier 3 — Only if ahead of schedule
- a "waste prevented" rupee metric (headline number)
- a what-if control to nudge a centre's daily consumption and watch its
  days-to-stockout update live
- optional: a small recharts sparkline per drug using consumptionHistory

## Rules
- Import from the engines; never rewrite or modify them.
- Build one small piece, then tell me exactly what to check in the browser,
  and WAIT for me before continuing.
- Prioritize a working demo path over completeness.
- Synthetic/hardcoded data is fine everywhere.
- NOT building tonight: auth, real database, backend API, mobile app,
  multi-user. If tempted, don't — say so and move on.
- After each working piece I'll commit; keep changes small and revertible.
