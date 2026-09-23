# plscripten — (slop-coded) Polski TypeScript

> **EN:** A Node-compatible runtime and preprocessor that lets you write programs
> **entirely in Polish** — every JavaScript and TypeScript keyword, primitive
> type, utility type, global object and common built-in method has a Polish
> equivalent. Think `ts-node` + the TypeScript compiler, but the source language
> is Polish. Files use the `.pls` extension (and `.ts` / `.js` are supported too).
>
> **PL:** Środowisko uruchomieniowe i preprocesor zgodny z Node, który pozwala
> pisać programy **w całości po polsku** — każde słowo kluczowe JavaScriptu i
> TypeScriptu, typ prosty, typ narzędziowy, obiekt globalny i popularna metoda
> wbudowana ma polski odpowiednik. To jak `ts-node` + kompilator TypeScript, ale
> językiem źródłowym jest polski. Pliki mają rozszerzenie `.pls` (obsługiwane są
> też `.ts` / `.js`).

```ts
funkcja pozdrów(kto: napis): napis {
	zwróć `Cześć, ${kto}!`;
}

konsola.dziennik(pozdrów('Świecie'));
```

...becomes, after translation:

```ts
function pozdrów(kto: string): string {
	return `Cześć, ${kto}!`;
}

console.log(pozdrów('Świecie'));
```

## Szybki start / Quick start

```bash
npm install
npm run build          # kompiluje plscripten / builds plscripten
npm run example        # uruchamia examples/główny.pls
```

Uruchom dowolny plik / Run any file:

```bash
npm run plscripten examples/główny.pls
# lub / or, po zainstalowaniu globalnie / once installed globally:
plscripten examples/główny.pls
pls examples/główny.pls
```

## Komendy CLI / CLI commands

| Komenda / Command                    | Opis / Description                                         |
| ------------------------------------ | --------------------------------------------------------- |
| `plscripten <plik.pls>`              | Uruchom plik / Run a file                                  |
| `plscripten run <plik.pls> [args]`   | Uruchom plik z argumentami / Run with arguments           |
| `plscripten compile <plik.pls> [-o]` | Zamień na TypeScript (lub `.js`) / Emit TypeScript or `.js` |
| `plscripten polonizuj <plik.ts>`     | Zamień angielski kod na polski / Turn English code Polish  |
| `plscripten słownik`                 | Wypisz cały słownik / Print the whole dictionary          |
| `plscripten version`                 | Wersja / Version                                          |
| `plscripten help`                    | Pomoc / Help                                              |

## Jak to działa / How it works

**EN:**
1. **Translate.** The `.pls` source is scanned with the TypeScript scanner. Only
   real identifier/keyword tokens are swapped Polish → English; strings, template
   text, comments and regular expressions are copied verbatim, so translation is
   lossless.
2. **Transpile.** The resulting standard TypeScript is compiled to JavaScript
   with `ts.transpileModule` (transpile-only, no type checking — fast start-up,
   just like `ts-node --transpile-only`).
3. **Run.** A CommonJS `require` hook is installed for `.pls` (and `.ts`), so a
   program can `importuj ... z './inny.pls'` and everything just works.

**PL:**
1. **Tłumaczenie.** Kod `.pls` jest skanowany skanerem TypeScript. Podmieniane są
   wyłącznie prawdziwe tokeny identyfikatorów/słów kluczowych (polski → angielski);
   napisy, tekst szablonów, komentarze i wyrażenia regularne są kopiowane
   dosłownie, więc tłumaczenie jest bezstratne.
2. **Transpilacja.** Powstały standardowy TypeScript jest kompilowany do
   JavaScriptu przez `ts.transpileModule` (bez sprawdzania typów — szybki start,
   jak `ts-node --transpile-only`).
3. **Uruchomienie.** Instalowany jest hak `require` CommonJS dla `.pls` (oraz
   `.ts`), więc program może `importuj ... z './inny.pls'` i wszystko działa.

### Rejestracja jako loader / Register as a loader

Jak `ts-node/register` / Like `ts-node/register`:

```bash
node -r plscripten/register examples/główny.pls
```

## Samodzielna binarka / Standalone binary

**EN:** Compile plscripten (CLI + the TypeScript compiler) into a single native
executable using Node's Single Executable Application (SEA) feature:

**PL:** Skompiluj plscripten (CLI + kompilator TypeScript) do jednego natywnego
pliku wykonywalnego przy użyciu funkcji Single Executable Application (SEA):

```bash
npm run build:binary
./plscripten examples/główny.pls   # bez Node w PATH / no Node needed in PATH
```

> **EN:** SEA needs an **official, statically-linked** Node binary. Some installs
> (Homebrew, Volta) ship a tiny launcher that links a shared `libnode` and cannot
> host a blob. If the build warns about this, point it at an official build:
>
> **PL:** SEA wymaga **oficjalnej, statycznie linkowanej** binarki Node. Niektóre
> instalacje (Homebrew, Volta) dostarczają mały launcher linkujący współdzielone
> `libnode`, który nie może hostować bloba. Jeśli build o tym ostrzeże, wskaż
> oficjalną binarkę:

```bash
# pobierz oficjalny Node z / download official Node from https://nodejs.org
PLSCRIPTEN_NODE_BIN=/ścieżka/do/node npm run build:binary
```

## Słownik / Dictionary

Kilka przykładów z ponad 240 tłumaczeń / A few of the 240+ translations
(`plscripten słownik` pokazuje wszystkie / shows them all):

| English      | Polski        | English    | Polski      | English   | Polski        |
| ------------ | ------------- | ---------- | ----------- | --------- | ------------- |
| `function`   | `funkcja`     | `if`       | `jeżeli`    | `return`  | `zwróć`       |
| `else`       | `inaczej`     | `for`      | `dla`       | `while`   | `dopóki`      |
| `const`      | `stała`       | `let`      | `niech`     | `class`   | `klasa`       |
| `import`     | `importuj`    | `from`     | `z`         | `export`  | `eksportuj`   |
| `async`      | `asynchroniczna` | `await` | `czekaj`    | `this`    | `to`          |
| `string`     | `napis`       | `number`   | `liczba`    | `boolean` | `logiczna`    |
| `Promise`    | `Obietnica`   | `Array`    | `Tablica`   | `Omit`    | `Pomiń`       |
| `Partial`    | `Częściowy`   | `Record`   | `Rekord`    | `Pick`    | `Wybierz`     |
| `console`    | `konsola`     | `log`      | `dziennik`  | `map`     | `mapuj`       |
| `filter`     | `filtruj`     | `reduce`   | `zredukuj`  | `length`  | `długość`     |

## Podświetlanie składni / Syntax highlighting

**EN:** Two levels of editor support ship with the repo:

- **GitHub** — `.gitattributes` tells Linguist to render `.pls` files as
  TypeScript, so blobs and diffs are coloured out of the box.
- **VS Code** — a small extension in [`editor/vscode-plscripten`](editor/vscode-plscripten)
  colours the *Polish* keywords, types, globals and built-in members as
  first-class tokens. Its TextMate grammar is **generated from the dictionary**
  (`npm run gen:grammar`), so highlighting never drifts from the lexicon.

**PL:** Repozytorium zawiera dwa poziomy wsparcia edytora:

- **GitHub** — `.gitattributes` mówi Linguistowi, aby renderował pliki `.pls`
  jak TypeScript, więc pliki i różnice są od razu kolorowane.
- **VS Code** — mała wtyczka w [`editor/vscode-plscripten`](editor/vscode-plscripten)
  koloruje *polskie* słowa kluczowe, typy, obiekty globalne i składowe wbudowane
  jako pełnoprawne tokeny. Jej gramatyka TextMate jest **generowana ze słownika**
  (`npm run gen:grammar`), więc podświetlanie nigdy nie odbiega od leksykonu.

```bash
# instaluje do VS Code / Cursor / install into VS Code / Cursor
npm run install:extension
# potem zrestartuj edytor / then restart the editor (or: Developer: Reload Window)
```

## Struktura projektu / Project layout

```
src/
  dictionary.ts   # EN<->PL lexicon (240+ tokens) + collision guard
  translator.ts   # token-level translator (TS scanner, template & regex aware)
  transpiler.ts   # translate + ts.transpileModule
  loader.ts       # require hook for .pls / .ts
  runtime.ts      # run a .pls file as the entry point
  cli.ts          # run / compile / polonizuj / słownik
  register.ts     # `node -r plscripten/register`
  index.ts        # public API
  sea-entry.ts    # entry for the single-executable build
tools/            # Node 24+ native-TypeScript build, test & grammar scripts
  gen-grammar.ts  # generates the VS Code TextMate grammar from the dictionary
editor/
  vscode-plscripten/  # VS Code extension: .pls syntax highlighting
examples/         # główny.pls, pomocnik.pls
```

## Testy / Tests

```bash
npm test              # runs tools/test.ts natively (Node 24+ type stripping)
npm run typecheck:tools
```

## Uwaga / Note

**EN:** This is a playful-but-real language layer. Type annotations are erased
(not checked) at run time, matching transpile-only tools. Because member names
like `.map`/`.length` are translated by token, an identifier you define that
collides with a dictionary word will also be translated — write your own names
in Polish and it stays consistent.

**PL:** To zabawna, ale w pełni działająca warstwa językowa. Adnotacje typów są
usuwane (nie sprawdzane) w czasie uruchomienia, zgodnie z narzędziami typu
transpile-only. Ponieważ nazwy składowych, jak `.map`/`.length`, są tłumaczone
tokenowo, zdefiniowany przez Ciebie identyfikator kolidujący ze słowem ze
słownika również zostanie przetłumaczony — pisz własne nazwy po polsku, a
wszystko pozostanie spójne.

## Licencja / License

MIT
