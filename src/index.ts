// EN: Public API for embedding plscripten in other tools.
// PL: Publiczne API do osadzania plscripten w innych narzędziach.
export { Translator, translator } from './translator';
export { Transpiler, transpiler, TranspileOptions, TranspileResult, SourceExtension, SUPPORTED_EXTENSIONS } from './transpiler';
export { Loader } from './loader';
export { Runtime } from './runtime';
export { Cli, main } from './cli';
export {
	TranslationDirection,
	LEXICON,
	LEXICON_SIZE,
	ENGLISH_TO_POLISH,
	POLISH_TO_ENGLISH,
} from './dictionary';

import { Loader } from './loader';

// EN: Importing plscripten/register installs the runtime hook as a side effect,
// mirroring `ts-node/register`. Use with `node -r plscripten/register file.pls`.
// PL: Import plscripten/register instaluje hak wykonawczy jako efekt uboczny,
// analogicznie do `ts-node/register`. Użyj z `node -r plscripten/register plik.pls`.
export function register(): void {
	Loader.install();
}
