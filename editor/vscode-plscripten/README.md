# plscripten syntax highlighting

Syntax highlighting for [plscripten](../../README.md) `.pls` files — TypeScript
written entirely in Polish.

The grammar colours Polish keywords, primitive & utility types, global objects
and built-in members as first-class language tokens (not plain identifiers):

- `funkcja`, `stała`, `niech`, `klasa`, `jeżeli`, `dla`, `zwróć` — keywords
- `napis`, `liczba`, `logiczna`, `pustka` — primitive types
- `Obietnica`, `Tablica`, `Częściowy`, `Pomiń` — globals & utility types
- `konsola.dziennik`, `liczby.filtruj`, `tekst.długość` — built-in members

## Install locally

Run the installer from the repo root — it copies this folder into every editor
it finds (VS Code, Cursor, Insiders, Windsurf) and is safe to re-run:

```bash
npm run install:extension
```

> Prefer this over `ln -s`. A symlink is fragile here: a bad `$(pwd)` leaves a
> dangling link the editor silently skips, and re-running `ln -s` against an
> existing link drops a **recursive loop** inside the target that makes the
> extension scanner abandon it. The installer copies a real directory instead.

Then **fully quit and reopen** the editor (or run *Developer: Reload Window*).
Open any `.pls` file — it highlights automatically and the status-bar language
mode reads "plscripten".

After changing the grammar, re-run both steps:

```bash
npm run build && npm run gen:grammar && npm run install:extension
```

## How the grammar is built

`syntaxes/plscripten.tmLanguage.json` is **generated** from the plscripten
dictionary, so it never drifts from the lexicon. Regenerate after changing
`src/dictionary.ts`:

```bash
npm run build          # dist/dictionary.js is the source of truth
npm run gen:grammar    # rewrites syntaxes/plscripten.tmLanguage.json
```

Do not hand-edit the generated grammar — edit `tools/gen-grammar.ts` instead.
