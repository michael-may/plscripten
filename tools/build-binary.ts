// EN: Build a standalone native executable of plscripten using Node's Single
// Executable Application (SEA) feature. The CLI plus the TypeScript compiler
// are bundled into one JS file with esbuild, baked into a blob, and injected
// into a copy of the Node binary with postject. Node 24+ native TypeScript.
// PL: Buduje samodzielny natywny plik wykonywalny plscripten przy użyciu funkcji
// Single Executable Application (SEA) Node'a. CLI wraz z kompilatorem TypeScript
// pakowane jest esbuildem do jednego pliku JS, zapiekane w blob i wstrzykiwane
// do kopii binarki Node przez postject. Natywny TypeScript Node 24+.
const fs = require('node:fs') as typeof import('node:fs');
const path = require('node:path') as typeof import('node:path');
const os = require('node:os') as typeof import('node:os');
const { execFileSync } = require('node:child_process') as typeof import('node:child_process');

const root: string = path.join(__dirname, '..');
const buildDir: string = path.join(root, 'build');
const bundlePath: string = path.join(buildDir, 'plscripten.bundle.js');
const seaConfigPath: string = path.join(root, 'sea-config.json');
const blobPath: string = path.join(root, 'sea-prep.blob');

const isWindows: boolean = process.platform === 'win32';
const outputName: string = isWindows ? 'plscripten.exe' : 'plscripten';
const outputPath: string = path.join(root, outputName);

// EN: The Node binary to embed the SEA blob into. Defaults to the running Node,
// but many installs (Homebrew, Volta) ship a tiny shared-library launcher that
// cannot host a blob — point PLSCRIPTEN_NODE_BIN at an official static build.
// PL: Binarka Node, w którą wstrzykujemy blob SEA. Domyślnie bieżący Node, ale
// wiele instalacji (Homebrew, Volta) dostarcza mały launcher z biblioteką
// współdzieloną, który nie może hostować bloba — wskaż PLSCRIPTEN_NODE_BIN na
// oficjalną statyczną binarkę.
const hostBinary: string = process.env.PLSCRIPTEN_NODE_BIN || process.execPath;

// EN: Small helper for running a command and echoing what we do.
// PL: Mały pomocnik do uruchamiania komendy i wypisywania, co robimy.
function run(command: string, args: string[]): void {
	console.log(`$ ${command} ${args.join(' ')}`);
	execFileSync(command, args, { stdio: 'inherit' });
}

function ensureBuildDir(): void {
	if(!fs.existsSync(buildDir)) {
		fs.mkdirSync(buildDir, { recursive: true });
	}
}

// EN: Step 1 — bundle the CLI and all its dependencies into one CJS file.
// PL: Krok 1 — pakuje CLI i wszystkie jego zależności do jednego pliku CJS.
function bundle(): void {
	const esbuild = require('esbuild') as typeof import('esbuild');

	esbuild.buildSync({
		entryPoints: [path.join(root, 'dist', 'sea-entry.js')],
		bundle: true,
		platform: 'node',
		target: 'node20',
		format: 'cjs',
		outfile: bundlePath,
		minify: true,
		legalComments: 'none',
	});

	console.log(`Zpakowano / Bundled -> ${bundlePath}`);
}

// EN: Step 2 — write the SEA config that points at the bundle.
// PL: Krok 2 — zapisuje konfigurację SEA wskazującą na pakiet.
function writeSeaConfig(): void {
	const config = {
		main: bundlePath,
		output: blobPath,
		disableExperimentalSEAWarning: true,
	};

	fs.writeFileSync(seaConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

// EN: Step 3 — generate the SEA blob from the bundle. The blob format is tied
// to the Node version that will host it, so generate it with the host binary.
// PL: Krok 3 — generuje blob SEA z pakietu. Format bloba jest powiązany z wersją
// Node, która go zhostuje, więc generujemy go binarką hosta.
function generateBlob(): void {
	run(hostBinary, ['--experimental-sea-config', seaConfigPath]);
}

// EN: Step 4 — copy the Node binary and inject the blob into it.
// PL: Krok 4 — kopiuje binarkę Node i wstrzykuje do niej blob.
function injectBlob(): void {
	// EN: A previous run may have left a read-only binary that blocks overwrite.
	// PL: Poprzedni bieg mógł zostawić binarkę tylko do odczytu blokującą nadpisanie.
	if(fs.existsSync(outputPath)) {
		fs.rmSync(outputPath, { force: true });
	}

	fs.copyFileSync(hostBinary, outputPath);

	// EN: copyFileSync preserves the source mode, which is read-only for most
	// installed Node binaries; postject needs write access to patch it.
	// PL: copyFileSync zachowuje tryb źródła, który dla większości zainstalowanych
	// binarek Node jest tylko do odczytu; postject potrzebuje prawa zapisu.
	fs.chmodSync(outputPath, 0o755);

	// EN: macOS binaries must have their signature removed before editing.
	// PL: Binarki macOS muszą mieć usunięty podpis przed edycją.
	if(process.platform === 'darwin') {
		try {
			run('codesign', ['--remove-signature', outputPath]);
		}
		catch (err) {
			console.warn('codesign --remove-signature nie powiódł się / failed (kontynuuję / continuing).');
		}
	}

	const postjectArgs: string[] = [
		outputPath,
		'NODE_SEA_BLOB',
		blobPath,
		'--sentinel-fuse',
		'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
	];

	if(process.platform === 'darwin') {
		postjectArgs.push('--macho-segment-name', 'NODE_SEA');
	}

	const postjectBin: string = path.join(root, 'node_modules', '.bin', os.platform() === 'win32' ? 'postject.cmd' : 'postject');
	run(postjectBin, postjectArgs);

	// EN: Re-sign on macOS so the OS will run the patched binary.
	// PL: Ponowny podpis na macOS, aby system uruchomił załataną binarkę.
	if(process.platform === 'darwin') {
		try {
			run('codesign', ['--sign', '-', outputPath]);
		}
		catch (err) {
			console.warn('codesign --sign nie powiódł się / failed (binarka może wymagać podpisu / binary may need signing).');
		}
	}
}

function cleanup(): void {
	for(const file of [blobPath, seaConfigPath]) {
		if(fs.existsSync(file)) {
			fs.rmSync(file);
		}
	}
}

// EN: A shared-library Node build (e.g. Homebrew's ~70KB launcher that links
// libnode) cannot host a SEA blob. Warn early so the failure is understandable.
// PL: Build Node z biblioteką współdzieloną (np. ~70KB launcher Homebrew
// linkujący libnode) nie może hostować bloba SEA. Ostrzegamy wcześnie, aby błąd
// był zrozumiały.
function checkHostBinary(): void {
	const size = fs.statSync(hostBinary).size;

	if(size < 10 * 1024 * 1024) {
		console.warn('');
		console.warn('Uwaga / Warning: bieżący Node to mała binarka współdzielona / the current Node is a small shared-library launcher');
		console.warn(`  (${size} bajtów / bytes @ ${hostBinary}).`);
		console.warn('  SEA wymaga oficjalnej, statycznej binarki Node / SEA needs an official statically-linked Node binary.');
		console.warn('  Pobierz z / Download from https://nodejs.org lub / or użyj nvm / use nvm.');
		console.warn('');
	}
}

function build(): void {
	checkHostBinary();
	ensureBuildDir();
	bundle();
	writeSeaConfig();
	generateBlob();
	injectBlob();
	cleanup();

	console.log(`\nGotowe / Done: ${outputPath}`);
	console.log('Spróbuj / Try: ./' + outputName + ' examples/główny.pls');
}

build();
