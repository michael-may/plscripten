import ts from 'typescript';

import { translator } from './translator';

// EN: Recognised source extensions. `.pls` is Polish source and always
// translated; `.ts` and `.js` are treated as standard sources and passed
// straight through to the transpiler unless translation is explicitly requested.
// PL: Rozpoznawane rozszerzenia źródeł. `.pls` to polski kod, zawsze tłumaczony;
// `.ts` i `.js` są traktowane jako standardowe źródła i przekazywane wprost do
// transpilera, o ile nie zażądano tłumaczenia jawnie.
export enum SourceExtension {
	Pls = '.pls',
	Ts = '.ts',
	Js = '.js',
}

export const SUPPORTED_EXTENSIONS: readonly string[] = [
	SourceExtension.Pls,
	SourceExtension.Ts,
	SourceExtension.Js,
];

// EN: The result of preparing a single file for execution or emit.
// PL: Wynik przygotowania pojedynczego pliku do uruchomienia lub zapisu.
export class TranspileResult {
	public readonly typescript: string;
	public readonly javascript: string;
	public readonly sourceMap: string | null;

	constructor(typescript: string, javascript: string, sourceMap: string | null) {
		this.typescript = typescript;
		this.javascript = javascript;
		this.sourceMap = sourceMap;
	}
}

// EN: Options controlling a single transpile.
// PL: Opcje sterujące pojedynczą transpilacją.
export class TranspileOptions {
	// EN: When true the source is treated as Polish and translated first.
	// PL: Gdy prawda, źródło jest traktowane jako polskie i najpierw tłumaczone.
	public translate = true;
	// EN: Emit CommonJS (the runtime) or leave module syntax for tooling.
	// PL: Emituje CommonJS (środowisko) lub zostawia składnię modułów dla narzędzi.
	public module: ts.ModuleKind = ts.ModuleKind.CommonJS;
	public target: ts.ScriptTarget = ts.ScriptTarget.ES2021;
	// EN: Original file name, used for diagnostics and source maps.
	// PL: Oryginalna nazwa pliku, używana w diagnostyce i mapach źródeł.
	public fileName = 'moduł.pls';
	public inlineSourceMap = true;

	constructor(init?: Partial<TranspileOptions>) {
		if(init) {
			Object.assign(this, init);
		}
	}
}

export class Transpiler {
	// EN: Decide whether a file should be translated based on its extension.
	// PL: Decyduje, czy plik należy przetłumaczyć na podstawie rozszerzenia.
	public static shouldTranslate(fileName: string): boolean {
		return fileName.toLowerCase().endsWith(SourceExtension.Pls);
	}

	// EN: Translate (if needed) then compile to JavaScript. No type checking is
	// performed — like ts-node's transpile-only mode — so runtime start-up is
	// fast and Polish type annotations are simply erased.
	// PL: Tłumaczy (jeśli trzeba), a następnie kompiluje do JavaScriptu. Nie ma
	// sprawdzania typów — jak tryb transpile-only w ts-node — więc start jest
	// szybki, a polskie adnotacje typów są po prostu usuwane.
	public compile(source: string, options?: Partial<TranspileOptions>): TranspileResult {
		const opts = new TranspileOptions(options);

		const typescript = opts.translate ? translator.toEnglish(source) : source;

		const output = ts.transpileModule(typescript, {
			compilerOptions: {
				module: opts.module,
				target: opts.target,
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				inlineSourceMap: opts.inlineSourceMap,
				inlineSources: opts.inlineSourceMap,
				resolveJsonModule: true,
			},
			fileName: opts.fileName,
			reportDiagnostics: true,
		});

		const diagnostics = output.diagnostics ?? [];

		if(diagnostics.length) {
			const message = ts.formatDiagnostics(diagnostics, {
				getCanonicalFileName: fileName => fileName,
				getCurrentDirectory: ts.sys.getCurrentDirectory,
				getNewLine: () => ts.sys.newLine,
			});

			// EN: Transpile-only diagnostics are almost always syntax problems in
			// the translated output, so surface them rather than swallowing them.
			// PL: Diagnostyka trybu transpile-only to niemal zawsze problemy
			// składniowe w przetłumaczonym wyniku, więc pokazujemy je zamiast ukrywać.
			console.warn(message);
		}

		return new TranspileResult(typescript, output.outputText, output.sourceMapText ?? null);
	}
}

export const transpiler = new Transpiler();
