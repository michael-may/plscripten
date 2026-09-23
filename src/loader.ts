import Module from 'module';
import fs from 'fs';

import { transpiler, SourceExtension } from './transpiler';

// EN: Internal shape of Node's Module that the public typings omit.
// PL: Wewnętrzny kształt Node'owego Module, którego pomijają publiczne typy.
interface InternalModule {
	_compile(code: string, fileName: string): unknown;
}

interface ModuleWithExtensions {
	_extensions: Record<string, (module: NodeModule, fileName: string) => void>;
}

// EN: A CommonJS require hook. Once installed, Node can require/import `.pls`
// (and `.ts`) files directly — they are translated from Polish and transpiled
// on the fly, exactly like ts-node does for TypeScript.
// PL: Hak `require` dla CommonJS. Po zainstalowaniu Node potrafi bezpośrednio
// ładować pliki `.pls` (oraz `.ts`) — są one tłumaczone z polskiego i
// transpilowane w locie, dokładnie tak jak ts-node dla TypeScriptu.
export class Loader {
	// EN: Guards against installing the hook more than once.
	// PL: Zabezpiecza przed wielokrotnym zainstalowaniem haka.
	private static installed = false;

	// EN: Only `.pls` is treated as Polish; `.ts`/`.js` run as standard sources.
	// PL: Tylko `.pls` jest traktowany jako polski; `.ts`/`.js` działają jako
	// standardowe źródła.
	private static shouldTranslate(fileName: string): boolean {
		return fileName.toLowerCase().endsWith(SourceExtension.Pls);
	}

	// EN: Compile a single source file to runnable JavaScript.
	// PL: Kompiluje pojedynczy plik źródłowy do wykonywalnego JavaScriptu.
	private static compileFile(fileName: string): string {
		const source = fs.readFileSync(fileName, 'utf8');

		const result = transpiler.compile(source, {
			translate: Loader.shouldTranslate(fileName),
			fileName,
		});

		return result.javascript;
	}

	// EN: Register handlers on Node's require.extensions for every extension.
	// PL: Rejestruje obsługę w require.extensions Node'a dla każdego rozszerzenia.
	public static install(): void {
		if(Loader.installed) {
			return;
		}

		const extensions = [SourceExtension.Pls, SourceExtension.Ts];
		const registry = (Module as unknown as ModuleWithExtensions)._extensions;

		for(const extension of extensions) {
			// EN: `_compile` turns the emitted JS into a live module.
			// PL: `_compile` zamienia wyemitowany JS w działający moduł.
			registry[extension] = (module: NodeModule, fileName: string): void => {
				const javascript = Loader.compileFile(fileName);
				(module as unknown as InternalModule)._compile(javascript, fileName);
			};
		}

		Loader.installed = true;
	}
}
