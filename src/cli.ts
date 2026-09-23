import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import { Runtime } from './runtime';
import { transpiler, SUPPORTED_EXTENSIONS } from './transpiler';
import { translator } from './translator';
import { LEXICON, LEXICON_SIZE } from './dictionary';

// EN: The subcommands understood by the CLI.
// PL: Podkomendy rozumiane przez CLI.
enum Command {
	Run = 'run',
	Compile = 'compile',
	Polonize = 'polonizuj',
	Lexicon = 'słownik',
	Help = 'help',
	Version = 'version',
}

// EN: A parsed command line: the command, its target file and leftover args.
// PL: Sparsowana linia poleceń: komenda, plik docelowy i pozostałe argumenty.
class ParsedArgs {
	public command: Command = Command.Help;
	public file: string | null = null;
	public output: string | null = null;
	public toPolish = false;
	public rest: string[] = [];
}

export class Cli {
	private static readonly version = '1.0.0';

	// EN: Detect an explicit subcommand; otherwise assume `run <file>`.
	// PL: Wykrywa jawną podkomendę; w przeciwnym razie zakłada `run <plik>`.
	private static parse(argv: string[]): ParsedArgs {
		const parsed = new ParsedArgs();

		if(!argv.length) {
			parsed.command = Command.Help;
			return parsed;
		}

		const first = argv[0];
		const commandValues = Object.values(Command) as string[];

		let index = 0;

		if(commandValues.includes(first)) {
			parsed.command = first as Command;
			index = 1;
		}
		else if(first === '-h' || first === '--help') {
			parsed.command = Command.Help;
			return parsed;
		}
		else if(first === '-v' || first === '--version') {
			parsed.command = Command.Version;
			return parsed;
		}
		else if(SUPPORTED_EXTENSIONS.some(ext => first.toLowerCase().endsWith(ext))) {
			// EN: Bare `plscripten główny.pls` means run that file.
			// PL: Samo `plscripten główny.pls` oznacza uruchomienie tego pliku.
			parsed.command = Command.Run;
			index = 0;
		}
		else {
			parsed.command = Command.Help;
			return parsed;
		}

		// EN: Walk the remaining tokens, pulling out flags and the target file.
		// PL: Przechodzi przez pozostałe tokeny, wyłuskując flagi i plik docelowy.
		for(let i = index; i < argv.length; i++) {
			const arg = argv[i];

			if(arg === '-o' || arg === '--out') {
				parsed.output = argv[++i] ?? null;
			}
			else if(arg === '--to-polish' || arg === '--do-polskiego') {
				parsed.toPolish = true;
			}
			else if(!parsed.file && !arg.startsWith('-')) {
				parsed.file = arg;
			}
			else {
				parsed.rest.push(arg);
			}
		}

		return parsed;
	}

	// EN: `run` — execute a `.pls`/`.ts`/`.js` file with the runtime hook.
	// PL: `run` — uruchamia plik `.pls`/`.ts`/`.js` z hakiem wykonawczym.
	private static commandRun(parsed: ParsedArgs): number {
		if(!parsed.file) {
			console.error('Podaj plik do uruchomienia / Provide a file to run.');
			return 1;
		}

		Runtime.run(parsed.file, parsed.rest);
		return 0;
	}

	// EN: `compile` — emit standard TypeScript (default) or JavaScript to disk.
	// PL: `compile` — zapisuje standardowy TypeScript (domyślnie) lub JavaScript.
	private static commandCompile(parsed: ParsedArgs): number {
		if(!parsed.file) {
			console.error('Podaj plik do skompilowania / Provide a file to compile.');
			return 1;
		}

		const source = fs.readFileSync(parsed.file, 'utf8');
		const emitJs = !!parsed.output && parsed.output.toLowerCase().endsWith('.js');

		if(emitJs) {
			const result = transpiler.compile(source, {
				translate: parsed.file.toLowerCase().endsWith('.pls'),
				fileName: parsed.file,
				inlineSourceMap: false,
			});

			fs.writeFileSync(parsed.output as string, result.javascript, 'utf8');
			console.log(`Zapisano JavaScript / Wrote JavaScript: ${parsed.output}`);
			return 0;
		}

		// EN: Default: translate Polish to standard TypeScript text.
		// PL: Domyślnie: tłumaczy polski na standardowy tekst TypeScript.
		const typescript = translator.toEnglish(source);
		const target = parsed.output ?? Cli.swapExtension(parsed.file, '.ts');

		fs.writeFileSync(target, typescript, 'utf8');
		console.log(`Zapisano TypeScript / Wrote TypeScript: ${target}`);
		return 0;
	}

	// EN: `polonizuj` — turn standard TypeScript/JavaScript into Polish `.pls`.
	// PL: `polonizuj` — zamienia standardowy TypeScript/JavaScript na polski `.pls`.
	private static commandPolonize(parsed: ParsedArgs): number {
		if(!parsed.file) {
			console.error('Podaj plik do spolszczenia / Provide a file to polonize.');
			return 1;
		}

		const source = fs.readFileSync(parsed.file, 'utf8');
		const polish = translator.toPolish(source);
		const target = parsed.output ?? Cli.swapExtension(parsed.file, '.pls');

		fs.writeFileSync(target, polish, 'utf8');
		console.log(`Zapisano / Wrote: ${target}`);
		return 0;
	}

	// EN: `słownik` — print the whole dictionary, grouped by category.
	// PL: `słownik` — wypisuje cały słownik, pogrupowany według kategorii.
	private static commandLexicon(): number {
		console.log(`plscripten — słownik / lexicon (${LEXICON_SIZE} słów / words)\n`);

		for(const group of LEXICON) {
			console.log(`# ${group.title}`);

			for(const [english, polish] of Object.entries(group.entries)) {
				console.log(`  ${english.padEnd(24)} -> ${polish}`);
			}

			console.log('');
		}

		return 0;
	}

	private static commandVersion(): number {
		console.log(`plscripten ${Cli.version} (typescript ${ts.version})`);
		return 0;
	}

	private static commandHelp(): number {
		console.log(Cli.helpText());
		return 0;
	}

	// EN: Replace a file's extension, keeping its directory and base name.
	// PL: Zmienia rozszerzenie pliku, zachowując katalog i nazwę.
	private static swapExtension(file: string, extension: string): string {
		const parsed = path.parse(file);
		return path.join(parsed.dir, `${parsed.name}${extension}`);
	}

	private static helpText(): string {
		return [
			'plscripten — Polski TypeScript / Polish TypeScript',
			'',
			'Użycie / Usage:',
			'  plscripten <plik.pls>                 Uruchom plik / Run a file',
			'  plscripten run <plik.pls> [args]      Uruchom plik / Run a file',
			'  plscripten compile <plik.pls> [-o x]  Do TypeScript (lub .js) / To TypeScript (or .js)',
			'  plscripten polonizuj <plik.ts> [-o x] Do polskiego / To Polish',
			'  plscripten słownik                    Pokaż słownik / Show the dictionary',
			'  plscripten version                    Wersja / Version',
			'  plscripten help                       Ta pomoc / This help',
			'',
			'Rozszerzenia / Extensions: .pls (polski), .ts, .js',
		].join('\n');
	}

	// EN: Dispatch the parsed command and return a process exit code.
	// PL: Rozsyła sparsowaną komendę i zwraca kod wyjścia procesu.
	public static main(argv: string[]): number {
		const parsed = Cli.parse(argv);

		switch(parsed.command) {
			case Command.Run:
				return Cli.commandRun(parsed);
			case Command.Compile:
				return Cli.commandCompile(parsed);
			case Command.Polonize:
				return Cli.commandPolonize(parsed);
			case Command.Lexicon:
				return Cli.commandLexicon();
			case Command.Version:
				return Cli.commandVersion();
			case Command.Help:
			default:
				return Cli.commandHelp();
		}
	}
}

// EN: Convenience entry used by the bin shim.
// PL: Wygodny punkt wejścia używany przez skrypt bin.
export function main(argv: string[] = process.argv.slice(2)): void {
	const code = Cli.main(argv);

	if(code !== 0) {
		process.exitCode = code;
	}
}
