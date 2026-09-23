// EN: Install the plscripten VS Code extension into every editor found on this
// machine (VS Code and Cursor). Copies a real directory — no symlinks, which
// have proven fragile (bad $(pwd), and re-running `ln -s` drops a recursive loop
// inside the target). Idempotent: safe to re-run after `npm run gen:grammar`.
// Node 24+ native TypeScript: `node tools/install-extension.ts`.
// PL: Instaluje wtyczkę VS Code plscripten w każdym edytorze znalezionym na tym
// komputerze (VS Code i Cursor). Kopiuje prawdziwy katalog — bez dowiązań
// symbolicznych, które okazały się kruche. Idempotentne: bezpieczne do
// ponownego uruchomienia po `npm run gen:grammar`.
const fs = require('node:fs') as typeof import('node:fs');
const os = require('node:os') as typeof import('node:os');
const path = require('node:path') as typeof import('node:path');

const root: string = path.join(__dirname, '..');
const src: string = path.join(root, 'editor', 'vscode-plscripten');
const manifest = require(path.join(src, 'package.json')) as { name: string; version: string; publisher: string };
const folderName = `${manifest.publisher}.${manifest.name}-${manifest.version}`;

const home: string = os.homedir();

// EN: Known per-user extension roots. We install only where the editor's home
// directory already exists, so we never create a dir for an editor you lack.
// PL: Znane katalogi wtyczek użytkownika. Instalujemy tylko tam, gdzie katalog
// domowy edytora już istnieje, więc nigdy nie tworzymy folderu dla edytora,
// którego nie masz.
const editors: { name: string; base: string }[] = [
	{ name: 'VS Code', base: path.join(home, '.vscode') },
	{ name: 'Cursor', base: path.join(home, '.cursor') },
	{ name: 'VS Code Insiders', base: path.join(home, '.vscode-insiders') },
	{ name: 'Windsurf', base: path.join(home, '.windsurf') },
];

let installed = 0;

for(const editor of editors) {
	if(!fs.existsSync(editor.base)) continue;

	const extRoot: string = path.join(editor.base, 'extensions');
	fs.mkdirSync(extRoot, { recursive: true });

	const dest: string = path.join(extRoot, folderName);
	fs.rmSync(dest, { recursive: true, force: true });
	// EN: Also clear any leftover symlink from earlier manual installs.
	// PL: Usuń też stare dowiązanie z wcześniejszych ręcznych instalacji.
	fs.rmSync(path.join(extRoot, 'vscode-plscripten'), { recursive: true, force: true });

	fs.cpSync(src, dest, { recursive: true });
	console.log(`installed -> ${editor.name}: ${dest}`);
	installed++;
}

if(installed === 0) {
	console.log('No VS Code / Cursor installation found under your home directory.');
}
else {
	console.log(`\nDone. Fully quit and reopen the editor (or run "Developer: Reload Window") to load it.`);
}
