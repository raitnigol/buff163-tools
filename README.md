# buff163-tools

Open-source userscript utilities and quality-of-life enhancements for
**buff.163.com**.

This project provides small tools and UI improvements for the BUFF163
marketplace to make inventory management and trading workflows easier.

------------------------------------------------------------------------

## Features

**Current functionality**

-   Toggle between **default inventory size (50)** and **full inventory
    view**
-   Native **BUFF-style tab integration** in the interface
-   Lightweight userscript (Tampermonkey / Greasemonkey compatible)

**Planned ideas**

-   Inventory price / valuation helpers
-   Profit & loss tracking
-   Better filtering tools
-   Bulk actions for inventory items
-   UI improvements

------------------------------------------------------------------------

## Installation

### 1. Install a userscript manager

-   Tampermonkey\
-   Violentmonkey\
-   Greasemonkey

### 2. Install the script from this repository

Canonical install URL (matches `@downloadURL` in the script header):

https://raw.githubusercontent.com/raitnigol/buff163-tools/main/dist/buff163-tools.user.js

The repository root file `buff163-tools.user.js` is the **same build output** as `dist/buff163-tools.user.js`, kept in sync by `npm run build` so older links to the root path keep working. **Do not edit either file by hand**; change `src/` and rebuild.

### 3. Open your BUFF inventory

https://buff.163.com/market/steam_inventory

The new control will appear in the **top navigation tabs**.

------------------------------------------------------------------------

## Development

Source lives under `src/` and is bundled with **esbuild** into
`dist/buff163-tools.user.js` (and copied to `buff163-tools.user.js` at the
repo root).

From the repository root:

    npm install
    npm run build

Use `npm run watch` for a watch build while editing.

Project structure (high level):

    buff163-tools/
    ├─ src/                    # editable source
    ├─ dist/buff163-tools.user.js   # built userscript (tracked in git)
    ├─ buff163-tools.user.js   # same bytes as dist/ (legacy raw URL)
    ├─ scripts/build.mjs
    ├─ userscript.header.txt
    ├─ README.md
    ├─ LICENSE
    └─ screenshots/

Contributions and ideas are welcome.

------------------------------------------------------------------------

## License

This project is released under the **MIT License**.

See the `LICENSE` file for details.

------------------------------------------------------------------------

## Development Note

This project was developed with significant **AI / LLM assistance**
("vibe coded").

To avoid ambiguity, all original contributions in this repository are
intentionally released under the **MIT License**.

------------------------------------------------------------------------

## Disclaimer

This project is **not affiliated with or endorsed by BUFF or NetEase**.

Use at your own risk.
