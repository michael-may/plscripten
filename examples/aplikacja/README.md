# przykładowa-aplikacja / example app

**EN:** A small standalone project that consumes **plscripten** — its whole source
is written in Polish (`.pls`). It shows the two ways another project uses
plscripten, and how to package the app together with the standalone binary so it
runs on a machine with **no Node and no plscripten installed**.

**PL:** Mały samodzielny projekt korzystający z **plscripten** — cały kod napisany
po polsku (`.pls`). Pokazuje dwa sposoby, w jakie inny projekt używa plscripten,
oraz jak spakować aplikację razem z samodzielną binarką, by działała na maszynie
**bez Node i bez zainstalowanego plscripten**.

## 1. Jako zależność / As a dependency

`package.json` deklaruje plscripten jako zależność / declares plscripten as a
dependency:

```json
"dependencies": { "plscripten": "file:../.." },
"scripts": { "start": "plscripten run src/główny.pls" }
```

```bash
npm install
npm start           # -> plscripten run src/główny.pls
npm start -- Ania   # przekaż argument / pass an argument
```

W tym repo, bez instalacji, użyj / In this repo, without installing, use:

```bash
npm run start:dev            # node ../../bin/plscripten.js run src/główny.pls
npm run start:dev -- Ania
```

## 2. Spakowane z binarką / Packaged with the binary

**EN:** `npm run build` runs [tools/spakuj.ts](tools/spakuj.ts), which builds the
standalone plscripten binary (if needed), then copies it plus the `.pls` sources
into `dist/` with a launcher, and makes a `.tar.gz`.

**PL:** `npm run build` uruchamia [tools/spakuj.ts](tools/spakuj.ts), który buduje
samodzielną binarkę plscripten (jeśli trzeba), kopiuje ją wraz ze źródłami `.pls`
do `dist/` z launcherem i tworzy `.tar.gz`.

```bash
npm run build
./dist/uruchom.sh Ania      # Windows: dist\uruchom.cmd Ania
```

`dist/` zawiera / contains:

```
dist/
  plscripten       # samodzielna binarka / standalone runtime (~138 MB)
  główny.pls       # źródło / source
  kalkulator.pls   # źródło / source
  uruchom.sh       # launcher
```

> **EN:** Building the binary needs an official, statically-linked Node. If the
> build warns, set `PLSCRIPTEN_NODE_BIN=/path/to/node` (see the repo README).
>
> **PL:** Budowa binarki wymaga oficjalnego, statycznie linkowanego Node. Gdy
> build ostrzega, ustaw `PLSCRIPTEN_NODE_BIN=/ścieżka/do/node` (zob. README repo).
