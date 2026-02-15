# ESR GHIN Analysis - Web App

## Project Overview
A mobile-friendly, OS-agnostic web app that determines whether a golf round qualifies as an Exceptional Scoring Record (ESR) under the USGA GHIN handicap system.

## Origin
Based on validated Excel spreadsheet logic (ESR GHIN Analysis.xlsm) that calculates score differentials and ESR thresholds.

## Live URL
https://supernole1.github.io/esr-calculator/

## Core Logic (Validated)

### Score Differential Formula
`(Adjusted Gross Score - Course Rating) x 113 / Slope Rating`

### Course Handicap Formula
`Handicap Index x (Slope Rating / 113) + (Course Rating - Par)`

### ESR Thresholds (USGA Rules)
- **Tier 1**: HI - Differential is 7.0 to 9.9 --> effectively -1 to Handicap Index
- **Tier 2**: HI - Differential is 10.0 or more --> effectively -2 to Handicap Index
- Applied by adjusting each of 20 most recent differentials; fades as new rounds are posted; multiple ESRs stack

### Notes
- PCC (Playing Conditions Calculation) is a daily adjustment (-1 to +3) applied by USGA. Cannot be predicted in advance, so omitted from this tool.
- Par is variable per course (not always 72). The app accepts Par as an input.

## Tech Stack
Single static HTML file (`index.html`) with inline CSS and JS. No frameworks, no dependencies, no build tools. Hosted on GitHub Pages; auto-deploys on push to `master`.

## Features
- **Default course**: Rocky Bayou CC (Course ID 14208) fetched live from USGA NCRDB on first load; Blue tees auto-selected
- **USGA course lookup**: User searches on ncrdb.usga.org directly, then pastes the URL or Course ID; tee data auto-loads via corsproxy.io (GET)
- **Course persistence**: Searched courses saved to localStorage with "last updated" timestamps; persist across sessions on the same device; Refresh button re-fetches from USGA
- **Smart URL parsing**: Accepts full NCRDB URLs (auto-extracts CourseID) or plain numeric IDs
- **Manual entry**: Enter Course Rating, Slope, Par by hand for any course
- **Result card**: Color-coded verdict (green = No ESR, amber = Tier 1, red = Tier 2) with Differential, Course Hcp, and HI-Diff stats
- **Reference table**: 16-row table (score -10 to +5) showing Differential, HI-Diff, and ESR status for each score; entered score highlighted
- **Info tooltips**: Tap (i) bubbles on Diff and ESR columns/stats for explanations with formulas and linked USGA sources
- **Mobile-first**: 16px inputs (no iOS zoom), 44px+ tap targets, numeric keypads, golf-themed palette
- **Responsive**: Breakpoint at 600px for wider screens
- **Accessible**: ARIA live regions, focus-visible outlines, prefers-reduced-motion support
- **Red asterisks** on all required fields

## Default Course
Rocky Bayou Country Club — Niceville, FL (Course ID 14208). Fetched live from USGA NCRDB; no hardcoded tee data. Blue tees auto-selected as default.

## Deployment
- **Repo**: https://github.com/supernole1/esr-calculator
- **Hosting**: GitHub Pages (legacy build from `master` branch, root `/`)
- **Git identity**: supernole1 / supernole1@users.noreply.github.com (repo-local config)
- **CORS proxy**: corsproxy.io (browser-side GET requests for tee data loading)

## Known Limitations
- **USGA name search not possible via proxy**: The NCRDB search requires a POST with CSRF cookies, which no client-side CORS proxy can handle. Server-side proxies (Cloudflare Workers, Vercel/AWS Lambda) were also tested but Akamai CDN blocks all major cloud provider IPs. The workaround is having users search ncrdb.usga.org directly and paste the URL/Course ID back.
- **Abandoned proxy attempts**: `worker/` (Cloudflare Worker) and `api/` (Vercel Serverless Functions) directories contain non-functional proxy code — both are blocked by Akamai. These are gitignored.

## Status
- [x] Spreadsheet logic validated against USGA rules
- [x] Web app architecture planned
- [x] Web app built
- [x] Deployed to GitHub Pages
- [x] USGA course lookup via URL/ID paste with auto-extraction
- [x] Default course (Rocky Bayou) fetched live from USGA NCRDB
- [x] Searched courses persisted in localStorage with timestamps
- [ ] Add more built-in courses if requested
