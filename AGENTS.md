# AGENTS.md

Notes for anyone, human or AI agent, changing this code. `README.md` documents the control's API and usage, and
`TECHNICAL_DOCUMENTATION.md` explains its internals (rendering, coordinates, events); this file covers how to
build and change it safely.

## What this is

TSTimeLine, a timeline control drawn on an HTML5 canvas, written in TypeScript. It shows coloured "chicklets" for
date ranges on up to 10 parallel rows, scrolls with the mouse wheel or touch, and raises `DATECLICKED` and
`DATEHOVERED` events on the canvas. It has no build system, no package manager and no dependencies; it runs in any
modern browser.

## Commands

```bash
tsc --target ES5 --sourceMap Timeline.ts    # rebuild Timeline.js and Timeline.js.map from the source
```

- There is no `tsconfig.json` or `package.json`; install TypeScript globally to get `tsc`. The committed
  `Timeline.js` is ES5 output (`var`, function-wrapped classes).
- To try it, open `index.html` in a browser; it is the demo page.
- There are no tests yet.

## Layout

- `Timeline.ts`: the whole control.
  - `TimeLine`: configuration (`numrows`, `daysize`, `margin`, colours, `LineLabels`), the data list, the canvas
    event handlers, and drawing (`FillCanvas`).
  - `Chicklet_Styles`: the 30 styles (10 colours by box, circle and triangle).
  - `TimeLineDataItem` (the public data type), `DATECLICKEDMETADATA`, `DATEHOVEREDMETADATA`, and the internal
    `InterpretedLineDataItem`.
- `Timeline.js` and `Timeline.js.map`: the compiled output, committed so the control can be used without a build.
- `index.html`: the demo. It also loads `JS/jquery-1.10.2.min.js`, which the control itself does not use.

## Rules that keep it working

- **Edit `Timeline.ts`, then recompile.** Never hand-edit `Timeline.js`; commit the source and both compiled files
  together so they stay in step.
- **The API is used by pages that load `Timeline.js` directly.** The classes are globals, not modules. Keep
  public names (`TimeLine`, `TimeLineDataItem`, `Chicklet_Styles`, `AddDataItem`, `FillCanvas`, the event names)
  stable, and update both documentation files when they change.
- **Line endings.** `Timeline.ts` and `index.html` use CRLF and `Timeline.js` uses LF; keep each file's existing
  endings so diffs show only real changes.

## Making a change

- Recompile, open `index.html`, and check scrolling, hovering, clicking, weekend shading and resizing by hand.
- Update `README.md` (API) and `TECHNICAL_DOCUMENTATION.md` (internals) to match.

There is no CI workflow in this repository.
