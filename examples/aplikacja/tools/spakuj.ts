// EN: Packaging script — bundles this app together with the standalone
// plscripten binary into a self-contained dist/ folder and a tarball, so the
// app can be shipped and run on a machine with no Node and no plscripten
// installed. Node 24+ native TypeScript, run with `node tools/spakuj.ts`.
// PL: Skrypt pakujący — łączy tę aplikację z samodzielną binarką plscripten w
// niezależny folder dist/ oraz archiwum tar, aby aplikację dało się wysłać i
// uruchomić na maszynie bez Node i bez zainstalowanego plscripten. Natywny
// TypeScript Node 24+, uruchamiany `node tools/spakuj.ts`.
const fs = require('node:fs') as typeof import('node:fs');
const path = require('node:path') as typeof import('node:path');
const { execFileSync } = require('node:child_process') as typeof import('node:child_process');

const appRoot: string = path.join(__dirname, '..');
const repoRoot: string = path.join(appRoot, '..', '..');
const distDir: string = path.join(appRoot, 'dist');

const isWindows: boolean = process.platform === 'win32';
const binaryName: string = isWindows ? 'plscripten.exe' : 'plscripten';
const repoBinary: string = path.join(repoRoot, binaryName);

// EN: Run a command, echoing it, inheriting stdio.
// PL: Uruchamia komendę, wypisując ją, dziedzicząc stdio.
function run(command: string, args: string[], cwd?: string): void {
	console.log(`$ ${command} ${args.join(' ')}`);
	execFileSync(command, args, { stdio: 'inherit', cwd, env: process.env });
}

// EN: A real SEA binary is tens of MB; anything smaller is a broken leftover
// from a failed build (e.g. a shared-library Node copy) and must be rebuilt.
// PL: Prawdziwa binarka SEA ma dziesiątki MB; cokolwiek mniejszego to zepsuta
// pozostałość po nieudanym buildzie (np. kopia Node z biblioteką współdzieloną)
// i trzeba ją przebudować.
const MIN_BINARY_BYTES = 10 * 1024 * 1024;

// EN: Make sure a valid standalone binary exists; build it in the repo if not.
// PL: Upewnia się, że istnieje poprawna samodzielna binarka; buduje ją w repo, gdy brak.
function ensureBinary(): void {
	if(fs.existsSync(repoBinary)) {
		const size = fs.statSync(repoBinary).size;

		if(size >= MIN_BINARY_BYTES) {
			console.log(`Znaleziono binarkę / Found binary: ${repoBinary}`);
			return;
		}

		console.warn(`Zepsuta binarka (${size} B), przebudowuję / Broken binary (${size} B), rebuilding...`);
		fs.rmSync(repoBinary, { force: true });
	}

	console.log('Buduję binarkę / Building the binary (npm run build:binary)...');
	const npm = isWindows ? 'npm.cmd' : 'npm';
	run(npm, ['run', 'build:binary'], repoRoot);

	if(!fs.existsSync(repoBinary)) {
		throw new Error(
			'Nie udało się zbudować binarki / Failed to build the binary. '
			+ 'Ustaw PLSCRIPTEN_NODE_BIN na oficjalny Node / Set PLSCRIPTEN_NODE_BIN to an official Node.'
		);
	}
}

// EN: Reset dist/ to a clean state.
// PL: Przywraca dist/ do czystego stanu.
function resetDist(): void {
	fs.rmSync(distDir, { recursive: true, force: true });
	fs.mkdirSync(distDir, { recursive: true });
}

// EN: Copy the binary and every .pls source into dist/.
// PL: Kopiuje binarkę i każde źródło .pls do dist/.
function copyArtifacts(): void {
	const targetBinary = path.join(distDir, binaryName);
	fs.copyFileSync(repoBinary, targetBinary);
	fs.chmodSync(targetBinary, 0o755);

	const srcDir = path.join(appRoot, 'src');

	for(const file of fs.readdirSync(srcDir)) {
		if(file.endsWith('.pls')) {
			fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
		}
	}
}

// EN: Write a small launcher so end users just run one command.
// PL: Zapisuje mały launcher, aby użytkownicy uruchamiali jedną komendą.
function writeLauncher(): void {
	if(isWindows) {
		const cmd = '@echo off\r\n"%~dp0plscripten.exe" run "%~dp0główny.pls" %*\r\n';
		fs.writeFileSync(path.join(distDir, 'uruchom.cmd'), cmd, 'utf8');
		return;
	}

	const sh = '#!/bin/sh\n'
		+ '# EN: launcher for the packaged app / PL: launcher spakowanej aplikacji\n'
		+ 'DIR="$(cd "$(dirname "$0")" && pwd)"\n'
		+ 'exec "$DIR/plscripten" run "$DIR/główny.pls" "$@"\n';

	const launcher = path.join(distDir, 'uruchom.sh');
	fs.writeFileSync(launcher, sh, 'utf8');
	fs.chmodSync(launcher, 0o755);
}

// EN: Create a tarball of dist/ next to it (best effort — needs `tar`).
// PL: Tworzy archiwum tar z dist/ obok niego (najlepszy wysiłek — wymaga `tar`).
function createTarball(): void {
	const tarball = path.join(appRoot, 'przykladowa-aplikacja.tar.gz');

	try {
		run('tar', ['-czf', tarball, '-C', appRoot, 'dist']);
		console.log(`Archiwum / Tarball: ${tarball}`);
	}
	catch (err) {
		console.warn('Pominięto archiwum (brak `tar`) / Skipped tarball (no `tar`).');
	}
}

function packageApp(): void {
	ensureBinary();
	resetDist();
	copyArtifacts();
	writeLauncher();
	createTarball();

	console.log('\nGotowe / Done. Spróbuj / Try:');
	console.log(isWindows ? '  dist\\uruchom.cmd Ania' : '  ./dist/uruchom.sh Ania');
}

packageApp();
