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
- **Course selection**: Built-in Rocky Bayou CC (Niceville, FL) with all 9 tee boxes; Blue tees default
- **USGA course search**: Search the National Course Rating Database (ncrdb.usga.org) via Cloudflare Worker proxy; auto-populates tee data (Course Rating, Slope, Par)
- **Course ID fallback**: Users can also enter a USGA Course ID directly to load tee data
- **Manual entry**: Enter Course Rating, Slope, Par by hand for any course
- **Result card**: Color-coded verdict (green = No ESR, amber = Tier 1, red = Tier 2) with Differential, Course Hcp, and HI-Diff stats
- **Reference table**: 16-row table (score -10 to +5) showing Differential, HI-Diff, and ESR status for each score; entered score highlighted
- **Info tooltips**: Tap (i) bubbles on Diff and ESR columns/stats for explanations with formulas and linked USGA sources
- **Mobile-first**: 16px inputs (no iOS zoom), 44px+ tap targets, numeric keypads, golf-themed palette
- **Responsive**: Breakpoint at 600px for wider screens
- **Accessible**: ARIA live regions, focus-visible outlines, prefers-reduced-motion support
- **Red asterisks** on all required fields

## Built-in Course Data
Rocky Bayou Country Club — Niceville, FL (Par 72 all tees):
| Tee | Course Rating | Slope |
|-----|--------------|-------|
| Black | 73.0 | 133 |
| Black/Blue | 71.9 | 131 |
| Blue (default) | 70.8 | 128 |
| Blue/White | 69.2 | 126 |
| White | 67.8 | 119 |
| White/Gold | 66.7 | 116 |
| Gold | 65.6 | 114 |
| Gold/Red | 64.2 | 109 |
| Red | 63.6 | 100 |

## Deployment
- **Repo**: https://github.com/supernole1/esr-calculator
- **Hosting**: GitHub Pages (legacy build from `master` branch, root `/`)
- **Git identity**: supernole1 / supernole1@users.noreply.github.com (repo-local config)
- **CORS proxy**: Cloudflare Worker at `esr-course-search.supernole1.workers.dev` (handles USGA NCRDB search and tee data fetching with proper CSRF/cookie handling server-side)
- **Worker source**: `worker/index.js` + `worker/wrangler.toml` (deploy with `npx wrangler deploy` from `worker/` dir)
- **Worker endpoints**: `/search?q=name` (returns JSON array of courses), `/tees?id=courseId` (returns HTML for client-side parsing)
- **Cloudflare free tier**: 100K requests/day

## Status
- [x] Spreadsheet logic validated against USGA rules
- [x] Web app architecture planned
- [x] Web app built
- [x] Deployed to GitHub Pages
- [x] USGA course name search working via Cloudflare Worker (replaced corsproxy.io which couldn't handle CSRF)
- [ ] Add more built-in courses if requested
