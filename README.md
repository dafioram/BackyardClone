# Backyard Clone

[Backyard Clone](https://dafioram.github.io/BackyardClone)

A browser-based tower-defense game inspired by the original *Plants vs. Zombies*. Defend your lawn across 18 handcrafted levels in 3 zones, then survive Endless mode.

No build step, no dependencies — just open `index.html`.

## Play

**Option A — open locally:** download this repo and open `index.html` in Chrome (or any modern browser). Works offline.

**Option B — GitHub Pages:**
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to **Deploy from a branch**, pick your branch and the `/ (root)` folder.
4. Your game will be live at `https://dafioram.github.io/BackyardClone/`.

## How to play

- **Collect sun** — click/tap falling suns (worth 25) and sunflowers (produce 25 every ~24s).
- **Plant** — click a seed packet, then click a lawn tile. Packets recharge after use.
- **Shovel** — remove a plant you no longer want.
- **Survive** — stop the zombies before they cross your lawn. Lawnmowers are your last resort (one per row).

### Plants

| Plant      | Cost | Unlocked | Notes                              |
|------------|------|----------|------------------------------------|
| Peashooter | 100  | Level 1  | Basic shooter                      |
| Sunflower  | 50   | Level 2  | Produces sun                       |
| Wall-nut   | 50   | Level 3  | Tough blocker, shows damage cracks |
| Cherry Bomb| 150  | Level 5  | 3×3 explosion, leaves a crater     |
| Snow Pea   | 175  | Level 8  | Slows zombies                      |
| Repeater   | 200  | Level 11 | Fires two peas                     |

### Zombies

Normal, Conehead (medium armor), Buckethead (heavy armor), Sprinter (fast, weak).

### Campaign

- **Levels 1–6:** Front Lawn — learn the ropes, new plants unlock.
- **Levels 7–12:** Backyard Blitz — sprinters arrive, bigger waves.
- **Levels 13–18:** Graveyard Shift — bucketheads, huge 4-flag finale.
- **Endless (19+):** escalating survival after beating level 18, with best-kill tracking.

Progress (unlocked levels, endless best) saves automatically in the browser via `localStorage`.

## Project structure

```
backyard-clone/
├── index.html              # the entire game (self-contained)
├── tests/
│   └── game.spec.js        # Playwright smoke tests
├── .github/workflows/ci.yml
├── playwright.config.js
└── package.json
```

## Development

The game is a single self-contained HTML file — all CSS and JS are inline, no external assets, works offline.

```bash
npm install      # install Playwright
npm test         # run the test suite (headless Chromium)
```

Tests load the game with a `?pvzdebug` query flag that exposes a small testing API (`window.__pvz`) for starting levels, simulating taps, and fast-forwarding. This hook is inert during normal play.

## License

MIT — do whatever you want with it.
