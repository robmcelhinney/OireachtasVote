# Oireachtas Vote

Interactive voting dashboard for TDs in Dail Eireann, built as a static React + Vite app and deployed to GitHub Pages.

Live site: [https://robmcelhinney.github.io/OireachtasVote/](https://robmcelhinney.github.io/OireachtasVote/)

## What It Does

- Browse current and historic Dail sessions.
- Filter and sort TD voting records in a modern data table.
- Switch between `Input` and `Slider` range filtering for `Percent` and `Votes`.
- Explore constituencies on an SVG map of Ireland.
- Click `Dublin` to open the Dublin-specific inset map for finer constituency selection.

## Data Source

Data is collected from the official Oireachtas Open Data API:

- [https://data.oireachtas.ie/](https://data.oireachtas.ie/)

The Python scripts generate static JSON used by the frontend, so no backend database is required.

## Tech Stack

- React
- React Router
- Vite
- GitHub Pages (static deploy)

## Project Structure

- `src/info.json`, `src/members.json`: current Dail snapshot used by the homepage.
- `src/data/*info.json`, `src/data/*members.json`: historical Dail session data.
- `src/constituencies/33.json`: constituency SVG paths (includes Dublin detail map geometry).
- `python/OireachtasVoting.py`: current-session data builder.
- `python/OireachtasVotingHistory.py`: historical data builder.

## Getting Started

```bash
git clone git@github.com:robmcelhinney/OireachtasVote.git
cd OireachtasVote
npm install
```

## Development

Run the app locally with Vite:

```bash
npm run dev
```

## Build And Preview

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

```bash
npm run deploy
```

This runs `predeploy` (`npm run build`) and publishes `dist/` to GitHub Pages.

## Refreshing The Data

Generate/update JSON from the Oireachtas API:

```bash
python3 python/OireachtasVoting.py
python3 python/OireachtasVotingHistory.py
```

Then run a fresh build:

```bash
npm run build
```

## Notes

- This project is static-first by design: fast to host, simple to maintain, no runtime server dependency.
- If you update generated JSON, commit those files so the deployed site reflects the latest dataset.
