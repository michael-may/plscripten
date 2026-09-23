#!/usr/bin/env node
'use strict';

// EN: Thin executable shim. When bundled into a single-executable application
// (SEA) the compiled CLI is embedded; otherwise we load it from dist/.
// PL: Cienki wykonywalny nakładka. Po spakowaniu do pojedynczego pliku
// wykonywalnego (SEA) skompilowany CLI jest osadzony; w innym wypadku ładujemy
// go z katalogu dist/.
(function main() {
	let cli;

	try {
		// EN: Detect a SEA build and use its embedded bundle.
		// PL: Wykrywa build SEA i używa osadzonego pakietu.
		const sea = require('node:sea');

		if(sea && typeof sea.isSea === 'function' && sea.isSea()) {
			cli = require('../dist/cli.js');
		}
	}
	catch (err) {
		// EN: node:sea is unavailable on older runtimes — that is fine.
		// PL: node:sea jest niedostępny w starszych środowiskach — to w porządku.
	}

	if(!cli) {
		cli = require('../dist/cli.js');
	}

	cli.main(process.argv.slice(2));
})();
