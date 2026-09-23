// EN: Lightweight test runner — no framework, just assertions. Verifies the
// translator round-trips and that the example program runs end to end. Written
// in Node 24+ native TypeScript, run directly with `node tools/test.ts`.
// PL: Lekki runner testów — bez frameworka, same asercje. Sprawdza, czy tłumacz
// działa w obie strony i czy przykładowy program uruchamia się od początku do
// końca. Napisane w natywnym TypeScripcie Node 24+, uruchamiane `node tools/test.ts`.
const path = require('node:path') as typeof import('node:path');
const { execFileSync } = require('node:child_process') as typeof import('node:child_process');

const dist: string = path.join(__dirname, '..', 'dist');
const { translator } = require(path.join(dist, 'translator.js')) as typeof import('../src/translator');
const { transpiler } = require(path.join(dist, 'transpiler.js')) as typeof import('../src/transpiler');

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean): void {
	if(condition) {
		passed++;
		console.log(`  ok   ${name}`);
	}
	else {
		failed++;
		console.error(`  FAIL ${name}`);
	}
}

// EN: 1. English -> Polish -> English is an identity for known tokens.
// PL: 1. Angielski -> polski -> angielski to tożsamość dla znanych tokenów.
const english = 'export function add(a: number, b: number): number { return a + b; }';
const polish = translator.toPolish(english);
const back = translator.toEnglish(polish);

check('polonize changes the source', polish !== english);
check('round-trip restores the source', back === english);
check('function -> funkcja', polish.includes('funkcja'));
check('number -> liczba', polish.includes('liczba'));
check('return -> zwróć', polish.includes('zwróć'));

// EN: 2. Strings and comments are never translated.
// PL: 2. Napisy i komentarze nigdy nie są tłumaczone.
const withString = "const x = 'return function if'; // return function if";
const translatedString = translator.toEnglish(withString);
check('string and comment contents are preserved', translatedString === withString);

// EN: 3. Template literal text is preserved, expressions are translated.
// PL: 3. Tekst szablonu jest zachowany, a wyrażenia tłumaczone.
const template = 'stała x = `on ma ${liczby.długość} lat`;';
const templateOut = translator.toEnglish(template);
check('template text is preserved', templateOut.includes(' ma '));
check('template expression is translated', templateOut.includes('.length'));

// EN: 4. Polish source transpiles to working JavaScript.
// PL: 4. Polski kod źródłowy transpiluje się do działającego JavaScriptu.
const plsSource = 'eksportuj stała witaj = () => konsola.dziennik("cześć");';
const compiled = transpiler.compile(plsSource, { fileName: 'test.pls' });
check('transpile emits console.log', compiled.javascript.includes('console.log'));
check('transpile emits exports', compiled.javascript.includes('exports'));

// EN: 5. The example program runs and prints the expected output.
// PL: 5. Przykładowy program uruchamia się i wypisuje oczekiwany wynik.
const bin: string = path.join(__dirname, '..', 'bin', 'plscripten.js');
const example: string = path.join(__dirname, '..', 'examples', 'główny.pls');

let output = '';

try {
	output = execFileSync(process.execPath, [bin, 'run', example], { encoding: 'utf8' });
}
catch (err) {
	const failure = err as { stdout?: string; stderr?: string; message?: string };
	output = (failure.stdout || '') + (failure.stderr || '');
	console.error(failure.stderr || failure.message);
}

check('example greets in Polish', output.includes('Cześć, Świecie!'));
check('example prints Fibonacci', output.includes('fib(5) ='));
check('example resolves a promise', output.includes('gotowe / done'));
check('example handles enums', output.includes('Jesteś adminem'));

console.log(`\n${passed} passed, ${failed} failed`);

if(failed > 0) {
	process.exit(1);
}
