# After-Tax Calculator

A simple single-page app that shows how much money is left after federal, state, sales, and capital gains tax. Uses your location (or manual state) for state and sales tax rates.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Features

- **Income** – Amount and period (Yearly / Weekly / Daily / Hourly); used for bracket lookup and income tax.
- **Stocks** – Capital gains amount with a short-term (left) vs long-term (right) slider.
- **Purchase** – Amount subject to sales tax.
- **State** – Manual select or “Use my location” (browser geolocation + reverse geocode).
- **Results** – Federal, State, Sales, Capital Gains, total tax, and final after-tax total.

Tax data is 2024 US federal and state brackets; sales tax uses state-level average rates. No API keys required for tax math; geolocation uses a free reverse-geocode service.

## Optional: API keys

To use a different sales-tax or geocoding API later, add a small backend or env-based config and wire it in; the app is built to work with static data and the default free geocode endpoint.

## Disclaimer

Estimates only. Not professional tax or legal advice. Verify with your tax advisor or the IRS.
