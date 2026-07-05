# Course Updates

Course data lives in `data/courses.json`. The app remains a single static
`index.html`; run the sync script after changing course data so the JSON is
embedded into the page GitHub Pages serves.

## Common Commands

```powershell
npm run sync:courses
```

Regenerates the embedded course data in `index.html` from `data/courses.json`.
Built-in courses from `data/courses.json` take priority over any older copy
saved in browser localStorage.

```powershell
npm run refresh:rocky
```

Attempts to refresh Rocky Bayou from USGA NCRDB. NCRDB is protected by Akamai
and may return HTTP 403 to automated requests. If that happens, update
`data/courses.json` manually from ncrdb.usga.org, then run `npm run sync:courses`.

```powershell
npm run publish:courses
```

Runs the sync, commits the course workflow files, and pushes the current branch
to `origin`.

## Adding Or Updating A Course

1. Add or edit a course under the `courses` object in `data/courses.json`.
2. Use keys like `usga-14208` for USGA course IDs.
3. Set `defaultTee` to the zero-based index of the tee that should load first.
4. Run `npm run sync:courses`.
5. Review with `git diff`, then run `npm run publish:courses`.

Each tee should include:

```json
{ "name": "BLUE", "gender": "M", "par": 72, "cr": 70.8, "slope": 128, "yards": 6408 }
```
