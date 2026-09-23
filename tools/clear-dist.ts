// EN: Remove the previous build output before a fresh compile. Written in
// Node 24+ native TypeScript (type stripping), run directly with `node`.
// PL: Usuwa poprzedni wynik builda przed świeżą kompilacją. Napisane w
// natywnym TypeScripcie Node 24+ (usuwanie typów), uruchamiane wprost `node`.
const fs = require('node:fs') as typeof import('node:fs');
const path = require('node:path') as typeof import('node:path');

const dist: string = path.join(__dirname, '..', 'dist');

if(fs.existsSync(dist)) {
	fs.rmSync(dist, { recursive: true, force: true });
	console.log('Wyczyszczono / Cleared dist/');
}
