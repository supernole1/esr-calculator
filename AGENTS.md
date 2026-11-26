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
- Slope Rating accepts decimals (same as Course Rating).

## Tech Stack
Single static HTML file (`index.html`) with inline CSS and JS. No frameworks, no dependencies, no build tools. Hosted on GitHub Pages; auto-deploys on push to `master`.

## Features
- **Default course**: Rocky Bayou CC (Course ID 14208) hardcoded as built-in tee data; loads instantly with Blue tees selected on every visit. localStorage may overlay fresher data from previous sessions.
- **Manual course entry**: User enters Course Name, City/State, and builds a tee list (Name, CR, Slope, Par per tee) using a compact inline tee builder. All tees saved to one course entry and appear in the Tee dropdown.
- **Course persistence**: Manually saved courses stored in localStorage; persist across sessions on the same device. Each course shows "Current as of date/time".
- **Edit course**: Edit button on course badge pre-fills all fields (including full tee list) for correction.
- **Result card**: Color-coded verdict (green = No ESR, amber = Tier 1, red = Tier 2) with Differential, Course Hcp, and HI-Diff stats. Goes gray with dashes when course/tee is changed, prompting recalculate.
- **Reference table**: 16-row table (score -10 to +5) showing Differential, HI-Diff, and ESR status for each score; entered score highlighted.
- **Info tooltips**: Tap (i) bubbles on Diff and ESR columns/stats for explanations with formulas and linked USGA sources.
- **Mobile-first**: 16px inputs (no iOS zoom), 44px+ tap targets, numeric/decimal keypads, golf-themed palette.
- **Responsive**: Breakpoint at 600px for wider screens.
- **Accessible**: ARIA live regions, focus-visible outlines, prefers-reduced-motion support.
- **Red asterisks** on all required fields.

## Default Course
Rocky Bayou Country Club — Niceville, FL (Course ID 14208). Full tee data (Men's + Women's, 16 tees) is hardcoded as built-in fallback in `BUILTIN_COURSES`. Blue (Men's, index 2) is auto-selected. No network call needed on load.

## Course Management
- **Built-in**: Rocky Bayou always available; appears in dropdown on every device/visit.
- **Manual entry**: User looks up course info at ncrdb.usga.org, then enters Course Name, City/State, and adds tees one by one (Name / CR / Slope / Par + Add button). "Save Course for Future Use" persists to localStorage.
- **Edit**: Edit button on the course badge reopens the manual entry form pre-filled with all existing tee data. "Update Course" saves in place.
- **Delete**: Removes from dropdown and localStorage.
- **Set Default**: Marks a course as the one that loads on next visit (defaults to Rocky Bayou).

## Deployment
- **Repo**: https://github.com/supernole1/esr-calculator
- **Hosting**: GitHub Pages (legacy build from `master` branch, root `/`)
- **Git identity**: supernole1 / supernole1@users.noreply.github.com (repo-local config)
- **No CORS proxy**: All proxy-based USGA lookup was removed — Akamai CDN blocks every known proxy (corsproxy.io, allorigins, codetabs, Cloudflare Workers, Vercel/Lambda). Course data is entered manually.

## Known Limitations
- **USGA live lookup removed**: ncrdb.usga.org is protected by Akamai CDN which blocks all cloud/proxy IPs. Users must visit ncrdb.usga.org directly, note their course's CR/Slope/Par, and enter manually.
- **Abandoned proxy attempts**: `worker/` (Cloudflare Worker) and `api/` (Vercel Serverless Functions) directories contain non-functional proxy code — both blocked by Akamai. These are gitignored.

## Status
- [x] Spreadsheet logic validated against USGA rules
- [x] Web app architecture planned
- [x] Web app built
- [x] Deployed to GitHub Pages
- [x] Default course (Rocky Bayou) hardcoded as built-in — loads instantly on any device
- [x] Manual course entry with multi-tee builder
- [x] Course persistence in localStorage with timestamps
- [x] Edit, Delete, Set Default course management
- [x] Result card clears to dashes on course/tee change
- [x] Slope Rating accepts decimals
