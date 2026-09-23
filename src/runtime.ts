import path from 'path';
import fs from 'fs';
import Module from 'module';

import { Loader } from './loader';

// EN: Executes a Polish source file as the program's entry point, wiring up the
// require hook so any `.pls` files it imports also work. This is the runtime
// half of plscripten — the equivalent of `node file.js` for `.pls`.
// PL: Uruchamia polski plik źródłowy jako punkt wejścia programu, instalując hak
// `require`, aby importowane pliki `.pls` również działały. To wykonawcza część
// plscripten — odpowiednik `node plik.js` dla `.pls`.
export class Runtime {
	// EN: Resolve the entry path relative to the current working directory.
	// PL: Rozwiązuje ścieżkę wejścia względem bieżącego katalogu roboczego.
	private static resolveEntry(entry: string): string {
		const resolved = path.resolve(process.cwd(), entry);

		if(!fs.existsSync(resolved)) {
			throw new Error(`Nie znaleziono pliku / File not found: ${resolved}`);
		}

		return resolved;
	}

	// EN: Run a file. `argv` are forwarded to the program as process.argv[2..].
	// PL: Uruchamia plik. `argv` są przekazywane do programu jako process.argv[2..].
	public static run(entry: string, argv: string[] = []): void {
		Loader.install();

		const resolved = Runtime.resolveEntry(entry);

		// EN: Present a normal argv to the program: [node, script, ...args].
		// PL: Udostępnia programowi normalne argv: [node, skrypt, ...argumenty].
		process.argv = [process.argv[0], resolved, ...argv];

		// EN: Run as the main module so `require.main === module` holds inside.
		// PL: Uruchamia jako moduł główny, aby wewnątrz działało `require.main === module`.
		const runMain = (Module as unknown as { runMain?: () => void }).runMain;

		if(typeof runMain === 'function') {
			process.argv[1] = resolved;
			runMain();
			return;
		}

		// EN: Fallback for environments without Module.runMain.
		// PL: Awaryjnie dla środowisk bez Module.runMain.
		require(resolved);
	}
}
