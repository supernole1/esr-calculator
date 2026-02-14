# ESR GHIN Analysis - Web App

## Project Overview
A mobile-friendly, OS-agnostic web app that determines whether a golf round qualifies as an Exceptional Scoring Record (ESR) under the USGA GHIN handicap system.

## Origin
Based on validated Excel spreadsheet logic (ESR GHIN Analysis.xlsm) that calculates score differentials and ESR thresholds.

## Core Logic (Validated)

### Score Differential Formula
`(Adjusted Gross Score - Course Rating) x 113 / Slope Rating`

### Course Handicap Formula
`Handicap Index x (Slope Rating / 113) + (Course Rating - Par)`

### ESR Thresholds (USGA Rules)
- **Tier 1**: HI - Differential is 7.0 to 9.9 --> -1 adjustment applied to 20 most recent differentials
- **Tier 2**: HI - Differential is 10.0 or more --> -2 adjustment applied to 20 most recent differentials

### Notes
- PCC (Playing Conditions Calculation) is a daily adjustment (-1 to +3) applied by USGA. Cannot be predicted in advance, so omitted from this tool.
- Par is variable per course (not always 72). The app must accept Par as an input.

## Tech Stack
Single static HTML file (`index.html`) with inline CSS and JS. No frameworks, no dependencies, no build tools. Opens directly from the filesystem or any static host (GitHub Pages, Netlify).

## Status
- [x] Spreadsheet logic validated against USGA rules
- [x] Web app architecture planned
- [x] Web app built
- [ ] Testing and deployment
